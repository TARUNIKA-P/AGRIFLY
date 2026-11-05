import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { 
  ChevronDown, 
  ChevronUp, 
  RotateCw, 
  Layers, 
  Droplets, 
  Eye, 
  Maximize2, 
  Minimize2,
  Wind
} from 'lucide-react';

export const ThreeDDroneViewer: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isDockCollapsed, setIsDockCollapsed] = useState<boolean>(false);
  const [explodedAmount, setExplodedAmount] = useState<number>(0);
  const [rotorRpm, setRotorRpm] = useState<number>(2400);
  const [sprayActive, setSprayActive] = useState<boolean>(true);
  const [cameraPreset, setCameraPreset] = useState<'iso' | 'nozzles' | 'top' | 'front'>('iso');

  // Mutable refs for Three.js render loop
  const explodedRef = useRef(0);
  const rpmRef = useRef(2400);
  const sprayActiveRef = useRef(true);
  const targetCameraPosRef = useRef(new THREE.Vector3(3.2, 2.2, 3.8));
  const targetLookAtRef = useRef(new THREE.Vector3(0, 0.4, 0));

  explodedRef.current = explodedAmount;
  rpmRef.current = rotorRpm;
  sprayActiveRef.current = sprayActive;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL as per guidelines
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0b1326');
    scene.fog = new THREE.FogExp2('#0b1326', 0.045);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      50
    );
    camera.position.set(3.2, 2.2, 3.8);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.1;
    controls.minDistance = 1.2;
    controls.maxDistance = 12;
    controls.target.set(0, 0.4, 0);

    // Studio Environment (PMREM + RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Lighting (Warm directional key + cool Hemisphere fill)
    const keyLight = new THREE.DirectionalLight('#fff5ea', 2.8);
    keyLight.position.set(4, 7, 4);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.castShadow) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight('#4cd7f6', '#060e20', 1.2);
    scene.add(hemiLight);

    const rimLight = new THREE.DirectionalLight('#68dba9', 1.4);
    rimLight.position.set(-4, 3, -3);
    scene.add(rimLight);

    // Ground Grid & Contact Shadow
    const gridHelper = new THREE.GridHelper(14, 28, '#334155', '#171f33');
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Procedural radial contact shadow texture
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(64, 64, 8, 64, 64, 60);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.25)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    const shadowTex = new THREE.CanvasTexture(canvas);
    shadowTex.colorSpace = THREE.SRGBColorSpace;

    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 3.6),
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.8,
      })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.01;
    scene.add(shadowPlane);

    // ==========================================
    // PROCEDURAL COMPOSITE 3D HEXACOPTER MODEL
    // ==========================================
    const droneRoot = new THREE.Group();
    droneRoot.position.set(0, 0.45, 0);
    scene.add(droneRoot);

    // PBR Materials
    const carbonMat = new THREE.MeshStandardMaterial({
      color: '#1a1d24',
      metalness: 0.8,
      roughness: 0.25,
    });
    const anodizedOrangeMat = new THREE.MeshStandardMaterial({
      color: '#ee9800',
      metalness: 0.9,
      roughness: 0.18,
    });
    const metalSilverMat = new THREE.MeshStandardMaterial({
      color: '#b0bec5',
      metalness: 0.95,
      roughness: 0.15,
    });
    const lensMat = new THREE.MeshPhysicalMaterial({
      color: '#4cd7f6',
      metalness: 0.1,
      roughness: 0.05,
      transmission: isSoftwareGl ? 0 : 0.9,
      transparent: true,
      opacity: isSoftwareGl ? 0.4 : 1,
      ior: 1.5,
    });
    const bioGreenMat = new THREE.MeshStandardMaterial({
      color: '#68dba9',
      emissive: '#003825',
      metalness: 0.5,
      roughness: 0.3,
    });

    // 1. Central Fuselage Chassis
    const chassisGeo = new THREE.CylinderGeometry(0.38, 0.42, 0.18, 8);
    const chassis = new THREE.Mesh(chassisGeo, carbonMat);
    chassis.castShadow = !isSoftwareGl;
    droneRoot.add(chassis);

    // 2. Top Avionics Pod & Orange Heatsink
    const topAvionics = new THREE.Group();
    const avionicsBase = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.1, 8), carbonMat);
    avionicsBase.position.y = 0.14;
    topAvionics.add(avionicsBase);

    // Heatsink fins
    for (let f = -0.12; f <= 0.12; f += 0.04) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 0.015), anodizedOrangeMat);
      fin.position.set(0, 0.22, f);
      topAvionics.add(fin);
    }
    droneRoot.add(topAvionics);

    // 3. Sensor Gimbal Pod (LiDAR & Optical)
    const sensorPod = new THREE.Group();
    sensorPod.position.set(0, -0.15, 0.15);
    const gimbalHousing = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), carbonMat);
    sensorPod.add(gimbalHousing);
    const opticalLens = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 16), lensMat);
    opticalLens.rotation.x = Math.PI / 2;
    opticalLens.position.set(0, 0, 0.08);
    sensorPod.add(opticalLens);
    droneRoot.add(sensorPod);

    // 4. Landing Gear Skids
    const landingGear = new THREE.Group();
    const legLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.45), carbonMat);
    legLeft.position.set(-0.25, -0.22, 0);
    legLeft.rotation.z = 0.2;
    landingGear.add(legLeft);

    const legRight = legLeft.clone();
    legRight.position.set(0.25, -0.22, 0);
    legRight.rotation.z = -0.2;
    landingGear.add(legRight);

    const skidTubeGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.8, 12);
    const skidLeft = new THREE.Mesh(skidTubeGeo, metalSilverMat);
    skidLeft.rotation.x = Math.PI / 2;
    skidLeft.position.set(-0.32, -0.44, 0);
    landingGear.add(skidLeft);

    const skidRight = skidLeft.clone();
    skidRight.position.set(0.32, -0.44, 0);
    landingGear.add(skidRight);
    droneRoot.add(landingGear);

    // 5. Micro-Spray Boom with 6 Nozzles
    const sprayBoom = new THREE.Group();
    sprayBoom.position.set(0, -0.28, -0.05);
    const boomPipe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 1.6, 12),
      metalSilverMat
    );
    boomPipe.rotation.z = Math.PI / 2;
    sprayBoom.add(boomPipe);

    // 6 Solenoid Micro-Nozzles
    const nozzlePositions: THREE.Vector3[] = [];
    for (let i = 0; i < 6; i++) {
      const nx = -0.65 + i * 0.26;
      const nozzle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.015, 0.08, 8),
        anodizedOrangeMat
      );
      nozzle.position.set(nx, -0.04, 0);
      sprayBoom.add(nozzle);
      nozzlePositions.push(new THREE.Vector3(nx, -0.36, -0.05));
    }
    droneRoot.add(sprayBoom);

    // 6. Hexacopter 6 Rotor Arms + Motor Bells + Propellers
    const armGroups: { group: THREE.Group; prop: THREE.Mesh; baseDir: THREE.Vector3 }[] = [];
    const armRadius = 1.05;

    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const armGroup = new THREE.Group();

      const armDir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));

      // Carbon arm tube
      const armTube = new THREE.Mesh(
        new THREE.CylinderGeometry(0.022, 0.022, armRadius, 12),
        carbonMat
      );
      armTube.rotation.z = Math.PI / 2;
      armTube.rotation.y = -angle;
      armTube.position.set((Math.cos(angle) * armRadius) / 2, 0, (Math.sin(angle) * armRadius) / 2);
      armGroup.add(armTube);

      // Motor Bell Housing
      const motorBell = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.07, 0.06, 16),
        anodizedOrangeMat
      );
      motorBell.position.set(Math.cos(angle) * armRadius, 0.04, Math.sin(angle) * armRadius);
      armGroup.add(motorBell);

      // Propeller (dual carbon blades)
      const propGroup = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.008, 0.04),
        carbonMat
      );
      propGroup.position.set(Math.cos(angle) * armRadius, 0.08, Math.sin(angle) * armRadius);
      armGroup.add(propGroup);

      droneRoot.add(armGroup);
      armGroups.push({ group: armGroup, prop: propGroup, baseDir: armDir });
    }

    // 7. Micro-Spray Particle Mist Simulation
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities: { x: number; y: number; z: number; life: number; maxLife: number; nozzleIndex: number }[] = [];

    for (let p = 0; p < particleCount; p++) {
      const nzIdx = p % 6;
      const initialPos = nozzlePositions[nzIdx];
      particlePositions[p * 3] = initialPos.x;
      particlePositions[p * 3 + 1] = initialPos.y;
      particlePositions[p * 3 + 2] = initialPos.z;

      particleVelocities.push({
        x: (Math.random() - 0.5) * 0.12,
        y: -1.8 - Math.random() * 1.2,
        z: (Math.random() - 0.5) * 0.12,
        life: Math.random() * 0.8,
        maxLife: 0.8,
        nozzleIndex: nzIdx,
      });
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: '#4cd7f6',
      size: 0.045,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const mistParticles = new THREE.Points(particleGeo, particleMat);
    droneRoot.add(mistParticles);

    // ==========================================
    // RENDER LOOP & DAMPING
    // ==========================================
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = () => {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      // 1. Smooth Camera Transition Damping
      camera.position.lerp(targetCameraPosRef.current, 0.05);
      controls.target.lerp(targetLookAtRef.current, 0.05);
      controls.update();

      // 2. Exploded-view kinematic displacement
      const currentExp = explodedRef.current;
      topAvionics.position.y = THREE.MathUtils.damp(topAvionics.position.y, currentExp * 0.5, 8, dt);
      sensorPod.position.y = THREE.MathUtils.damp(sensorPod.position.y, -0.15 - currentExp * 0.35, 8, dt);
      sprayBoom.position.y = THREE.MathUtils.damp(sprayBoom.position.y, -0.28 - currentExp * 0.45, 8, dt);

      armGroups.forEach(({ group, baseDir }) => {
        const targetDist = currentExp * 0.45;
        group.position.x = THREE.MathUtils.damp(group.position.x, baseDir.x * targetDist, 8, dt);
        group.position.z = THREE.MathUtils.damp(group.position.z, baseDir.z * targetDist, 8, dt);
      });

      // 3. Propeller Rotation
      const rpm = rpmRef.current;
      const rotDelta = (rpm / 60) * Math.PI * 2 * dt;
      armGroups.forEach(({ prop }, idx) => {
        // Alternating CW and CCW
        prop.rotation.y += idx % 2 === 0 ? rotDelta : -rotDelta;
      });

      // 4. Particle Mist Animation
      if (sprayActiveRef.current && mistParticles.visible) {
        const positions = particleGeo.attributes.position.array as Float32Array;
        for (let p = 0; p < particleCount; p++) {
          const v = particleVelocities[p];
          v.life += dt;

          if (v.life >= v.maxLife) {
            v.life = 0;
            const nz = nozzlePositions[v.nozzleIndex];
            positions[p * 3] = nz.x;
            positions[p * 3 + 1] = nz.y - (currentExp * 0.45);
            positions[p * 3 + 2] = nz.z;
          } else {
            positions[p * 3] += v.x * dt;
            positions[p * 3 + 1] += v.y * dt;
            positions[p * 3 + 2] += v.z * dt;
          }
        }
        particleGeo.attributes.position.needsUpdate = true;
      } else {
        mistParticles.visible = false;
      }
      if (sprayActiveRef.current) {
        mistParticles.visible = true;
      }

      // 5. Subtle hover floating bobbing
      if (currentExp === 0) {
        droneRoot.position.y = 0.45 + Math.sin(now * 0.002) * 0.02;
        shadowPlane.scale.setScalar(1 - Math.sin(now * 0.002) * 0.05);
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const handleCameraPreset = (preset: 'iso' | 'nozzles' | 'top' | 'front') => {
    setCameraPreset(preset);
    if (preset === 'iso') {
      targetCameraPosRef.current.set(3.2, 2.2, 3.8);
      targetLookAtRef.current.set(0, 0.4, 0);
    } else if (preset === 'nozzles') {
      targetCameraPosRef.current.set(0.2, -0.2, 2.2);
      targetLookAtRef.current.set(0, -0.2, 0);
    } else if (preset === 'top') {
      targetCameraPosRef.current.set(0.01, 4.8, 0.01);
      targetLookAtRef.current.set(0, 0.4, 0);
    } else if (preset === 'front') {
      targetCameraPosRef.current.set(0, 0.5, 3.5);
      targetLookAtRef.current.set(0, 0.4, 0);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[580px] bg-[#0b1326] overflow-hidden select-none">
      {/* 3D WebGL Canvas mount container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Spec Badge */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <div className="bg-[#131b2e]/95 border border-[#334155] rounded-xs p-3 shadow-2xl">
          <div className="text-[10px] font-bold text-[#68dba9] tracking-wider uppercase font-body">
            PRECISION CRAFT ARCHITECTURE (THREE.JS)
          </div>
          <h2 className="text-sm font-bold text-white font-display mt-0.5">
            AgriFly Heavy-Lift Hexacopter Unit
          </h2>
          <div className="text-[11px] font-mono text-[#bccac0] mt-1 space-y-0.5">
            <div>FRAME: Carbon Composite 1200mm Hex-Boom</div>
            <div>ACTUATION: 6-Nozzle PWM Solenoid Bar</div>
            <div>SENSOR SUITE: Livox 360° LiDAR + Dual VIO Gimbal</div>
          </div>
        </div>
      </div>

      {/* Viewport-First Collapsible Bottom Control Dock */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 w-[94vw] max-w-[840px] select-none">
        {/* Toggle Collapse Header */}
        <div className="flex justify-center -mb-px">
          <button
            onClick={() => setIsDockCollapsed(!isDockCollapsed)}
            className="flex items-center gap-1.5 px-4 py-1 bg-[#131b2e] hover:bg-[#1e293b] border-t border-x border-[#334155] text-[11px] font-mono text-[#bccac0] rounded-t-xs transition-colors cursor-pointer shadow-lg"
          >
            {isDockCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{isDockCollapsed ? 'EXPAND 3D DOCK' : 'MINIMIZE 3D DOCK'}</span>
          </button>
        </div>

        {/* Dock Body */}
        {!isDockCollapsed && (
          <div className="bg-[#131b2e] border border-[#334155] rounded-xs p-3.5 shadow-2xl space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Exploded View Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#87948b] flex items-center gap-1.5">
                    <Layers className="w-3 h-3 text-[#4cd7f6]" />
                    EXPLODED ASSEMBLY:
                  </span>
                  <span className="text-white font-bold">{Math.round(explodedAmount * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={explodedAmount}
                  onChange={(e) => setExplodedAmount(Number(e.target.value))}
                  className="w-full accent-[#4cd7f6] cursor-pointer"
                />
              </div>

              {/* Rotor RPM Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#87948b] flex items-center gap-1.5">
                    <RotateCw className="w-3 h-3 text-[#68dba9]" />
                    MOTOR ROTOR RPM:
                  </span>
                  <span className="text-[#68dba9] font-bold tabular-nums">{rotorRpm} RPM</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4800"
                  step="100"
                  value={rotorRpm}
                  onChange={(e) => setRotorRpm(Number(e.target.value))}
                  className="w-full accent-[#68dba9] cursor-pointer"
                />
              </div>

              {/* Micro-Mist Spray Toggle */}
              <div className="flex items-center justify-between p-2 bg-[#171f33] rounded-xs border border-[#334155]">
                <span className="text-xs font-mono text-[#bccac0] flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-[#4cd7f6]" />
                  Micro-Mist Particle Plume:
                </span>
                <button
                  onClick={() => setSprayActive(!sprayActive)}
                  className={`px-2.5 py-1 text-xs font-mono font-bold rounded-xs cursor-pointer transition-colors ${
                    sprayActive
                      ? 'bg-[#003825] text-[#68dba9] border border-[#68dba9]'
                      : 'bg-[#222a3d] text-[#87948b]'
                  }`}
                >
                  {sprayActive ? 'ACTIVE' : 'OFF'}
                </button>
              </div>
            </div>

            {/* Camera View Angle Presets */}
            <div className="flex items-center justify-between border-t border-[#334155] pt-2 text-xs">
              <span className="text-[10px] font-bold text-[#87948b] uppercase font-body">
                CAMERA ANGLES:
              </span>
              <div className="flex items-center gap-2">
                {[
                  { key: 'iso', label: 'Isometric View' },
                  { key: 'nozzles', label: 'Spray Nozzles POV' },
                  { key: 'top', label: 'Top Avionics' },
                  { key: 'front', label: 'Front Sensor Gimbal' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => handleCameraPreset(key as any)}
                    className={`px-2.5 py-1 text-xs rounded-xs font-mono transition-colors cursor-pointer ${
                      cameraPreset === key
                        ? 'bg-[#002f38] text-[#4cd7f6] border border-[#4cd7f6]'
                        : 'bg-[#171f33] text-[#87948b] hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
