'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RotateCcw } from 'lucide-react';

type ThreeDKind =
  | 'eht-ring'
  | 'eht-tomography'
  | 'odt-volume'
  | 'reflection-odt'
  | 'light-field'
  | 'single-molecule'
  | 's2ism'
  | 'xray-laminography';

interface ThreeDConfig {
  kind: ThreeDKind;
  title: string;
  accent: number;
  secondary: number;
  pointCount: number;
  thresholdLabel: string;
}

const THREE_D_TASKS: Record<string, ThreeDConfig> = {
  eht_black_hole_original: {
    kind: 'eht-ring',
    title: 'EHT Imaging Volume',
    accent: 0xffb454,
    secondary: 0x5ed3ff,
    pointCount: 4200,
    thresholdLabel: 'Brightness',
  },
  eht_black_hole_tomography: {
    kind: 'eht-tomography',
    title: 'EHT Tomography Volume',
    accent: 0xff9f43,
    secondary: 0x9bdbff,
    pointCount: 5200,
    thresholdLabel: 'Emission',
  },
  SSNP_ODT: {
    kind: 'odt-volume',
    title: 'SSNP ODT Volume',
    accent: 0x2dd4bf,
    secondary: 0xf97316,
    pointCount: 3600,
    thresholdLabel: 'Density',
  },
  reflection_ODT: {
    kind: 'reflection-odt',
    title: 'Reflection ODT Stack',
    accent: 0x38bdf8,
    secondary: 0xf472b6,
    pointCount: 3200,
    thresholdLabel: 'Index',
  },
  light_field_microscope: {
    kind: 'light-field',
    title: 'Light Field Volume',
    accent: 0x22c55e,
    secondary: 0x60a5fa,
    pointCount: 2600,
    thresholdLabel: 'Signal',
  },
  single_molecule_light_field: {
    kind: 'single-molecule',
    title: 'SMLF Localizations',
    accent: 0xa78bfa,
    secondary: 0x22d3ee,
    pointCount: 4300,
    thresholdLabel: 'Precision',
  },
  s2ism: {
    kind: 's2ism',
    title: 's2ISM Axial Planes',
    accent: 0xf43f5e,
    secondary: 0x14b8a6,
    pointCount: 3400,
    thresholdLabel: 'Likelihood',
  },
  xray_laminography: {
    kind: 'xray-laminography',
    title: 'X-ray Laminography Volume',
    accent: 0xf59e0b,
    secondary: 0x06b6d4,
    pointCount: 3900,
    thresholdLabel: 'Magnitude',
  },
};

export function hasThreeDView(taskName: string): boolean {
  return taskName in THREE_D_TASKS;
}

function random(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

function addFrame(scene: THREE.Scene, size = 4.2) {
  const box = new THREE.BoxGeometry(size, size, size);
  const edges = new THREE.EdgesGeometry(box);
  const line = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.38 })
  );
  scene.add(line);
}

function addSlice(scene: THREE.Scene, z: number, color: number, opacity: number, rotateX = false) {
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(4.1, 4.1, 1, 1),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  if (rotateX) plane.rotation.x = Math.PI / 2;
  plane.position.z = z;
  scene.add(plane);
}

function makePoints(config: ThreeDConfig, threshold: number) {
  const rand = random(config.kind.length * 7919 + config.pointCount);
  const positions: number[] = [];
  const colors: number[] = [];
  const sizes: number[] = [];
  const c1 = new THREE.Color(config.accent);
  const c2 = new THREE.Color(config.secondary);
  const minKeep = threshold * 0.62;

  const pushPoint = (x: number, y: number, z: number, intensity: number, mix = (z + 2) / 4) => {
    if (intensity < minKeep) return;
    positions.push(x, y, z);
    const col = c1.clone().lerp(c2, Math.max(0, Math.min(1, mix)));
    col.multiplyScalar(0.58 + intensity * 0.55);
    colors.push(col.r, col.g, col.b);
    sizes.push(1.4 + intensity * 3.2);
  };

  for (let i = 0; i < config.pointCount; i += 1) {
    if (config.kind === 'eht-ring' || config.kind === 'eht-tomography') {
      const a = rand() * Math.PI * 2;
      const r = 1.12 + (rand() - 0.5) * (config.kind === 'eht-tomography' ? 0.42 : 0.28);
      const zWave = Math.sin(a * 2.0 + rand() * 0.4) * 0.28;
      const z = config.kind === 'eht-tomography' ? zWave + (rand() - 0.5) * 1.35 : (rand() - 0.5) * 0.42;
      const doppler = 0.45 + 0.55 * Math.max(0, Math.cos(a - 0.72));
      const flare = Math.exp(-Math.pow((r - 1.1) / 0.2, 2));
      pushPoint(Math.cos(a) * r, Math.sin(a) * r, z, flare * (0.55 + doppler * 0.75), doppler);
    } else if (config.kind === 'single-molecule') {
      const a = rand() * Math.PI * 10;
      const z = (rand() - 0.5) * 3.4;
      const radius = 0.65 + 0.28 * Math.sin(a * 0.7) + (rand() - 0.5) * 0.28;
      const arm = rand() > 0.5 ? 1 : -1;
      const x = Math.cos(a) * radius * arm + (rand() - 0.5) * 0.45;
      const y = Math.sin(a) * radius + (rand() - 0.5) * 0.45;
      const precision = 1 - Math.min(1, Math.abs(z) / 2.1) * 0.28 + rand() * 0.22;
      pushPoint(x, y, z, precision, (z + 1.7) / 3.4);
    } else if (config.kind === 'light-field' || config.kind === 's2ism') {
      const plane = config.kind === 's2ism' ? (rand() > 0.48 ? 0.65 : -0.65) : (Math.round(rand() * 4) - 2) * 0.38;
      const a = rand() * Math.PI * 2;
      const r = Math.pow(rand(), 0.55) * 1.5;
      const x = Math.cos(a) * r + (rand() - 0.5) * 0.12;
      const y = Math.sin(a) * r * (0.7 + rand() * 0.35);
      const z = plane + (rand() - 0.5) * 0.22;
      const spot = Math.exp(-(x * x + y * y) / 2.4) * (0.68 + rand() * 0.44);
      pushPoint(x, y, z, spot, (z + 1.1) / 2.2);
    } else if (config.kind === 'xray-laminography') {
      const cluster = rand();
      const cx = cluster > 0.66 ? 0.78 : cluster > 0.33 ? -0.62 : 0.05;
      const cy = cluster > 0.66 ? -0.45 : cluster > 0.33 ? 0.58 : -0.1;
      const cz = cluster > 0.66 ? 0.25 : cluster > 0.33 ? -0.25 : 0.55;
      const a = rand() * Math.PI * 2;
      const u = rand() * 2 - 1;
      const rr = Math.pow(rand(), 0.33) * (0.55 + rand() * 0.22);
      const x = cx + rr * Math.sqrt(1 - u * u) * Math.cos(a);
      const y = cy + rr * Math.sqrt(1 - u * u) * Math.sin(a);
      const z = cz + rr * u;
      pushPoint(x, y, z, 0.58 + rand() * 0.55, (z + 1.5) / 3);
    } else {
      const layer = config.kind === 'reflection-odt' ? Math.floor(rand() * 5) : 0;
      const z = config.kind === 'reflection-odt' ? -1.2 + layer * 0.6 + (rand() - 0.5) * 0.16 : (rand() - 0.5) * 2.6;
      const a = rand() * Math.PI * 2;
      const r = Math.pow(rand(), 0.45) * (config.kind === 'reflection-odt' ? 1.65 : 1.35);
      const wave = Math.sin(a * 3 + z * 2) * 0.22;
      const x = Math.cos(a) * r + wave;
      const y = Math.sin(a) * r * 0.72 + Math.cos(z * 3) * 0.18;
      const density = Math.exp(-(x * x + y * y) / 4) * (0.6 + rand() * 0.5);
      pushPoint(x, y, z, density, (z + 1.6) / 3.2);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
  return geometry;
}

function addTaskGeometry(scene: THREE.Scene, config: ThreeDConfig, threshold: number) {
  const geometry = makePoints(config, threshold);
  const material = new THREE.PointsMaterial({
    size: config.kind === 'single-molecule' ? 0.035 : 0.045,
    vertexColors: true,
    transparent: true,
    opacity: 0.94,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  scene.add(new THREE.Points(geometry, material));

  if (config.kind === 'eht-ring' || config.kind === 'eht-tomography') {
    const torus = new THREE.Mesh(
      new THREE.TorusGeometry(1.05, 0.1, 20, 96),
      new THREE.MeshBasicMaterial({ color: config.accent, transparent: true, opacity: 0.24 })
    );
    scene.add(torus);
    const shadow = new THREE.Mesh(
      new THREE.SphereGeometry(0.56, 48, 24),
      new THREE.MeshBasicMaterial({ color: 0x020617, transparent: true, opacity: 0.92 })
    );
    scene.add(shadow);
  }

  if (config.kind === 'reflection-odt') {
    [-1.2, -0.6, 0, 0.6, 1.2].forEach((z, idx) => addSlice(scene, z, idx % 2 ? config.secondary : config.accent, 0.08));
  } else if (config.kind === 's2ism') {
    addSlice(scene, -0.65, config.secondary, 0.13);
    addSlice(scene, 0.65, config.accent, 0.13);
  } else if (config.kind === 'light-field') {
    [-0.76, -0.38, 0, 0.38, 0.76].forEach((z) => addSlice(scene, z, config.secondary, 0.06));
  } else if (config.kind === 'xray-laminography') {
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(5.2, 3.1),
      new THREE.MeshBasicMaterial({ color: config.secondary, transparent: true, opacity: 0.09, side: THREE.DoubleSide })
    );
    plane.rotation.y = Math.PI / 5;
    plane.rotation.z = -Math.PI / 9;
    scene.add(plane);
  }

  addFrame(scene);
}

interface Props {
  taskName: string;
}

export default function ThreeDTaskViewer({ taskName }: Props) {
  const config = THREE_D_TASKS[taskName];
  const mountRef = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const [threshold, setThreshold] = useState(0.22);

  const taskSummary = useMemo(() => {
    if (!config) return null;
    if (config.kind === 'single-molecule') return '3D localization cloud';
    if (config.kind === 'eht-ring' || config.kind === 'eht-tomography') return 'emission geometry';
    if (config.kind === 'xray-laminography') return 'tilted projection volume';
    return 'volumetric reconstruction';
  }, [config]);

  useEffect(() => {
    if (!config || !mountRef.current) return;
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    addTaskGeometry(scene, config, threshold);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(4.4, 3.2, 4.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.9;
    controls.minDistance = 3;
    controls.maxDistance = 10;
    controlsRef.current = controls;

    const light = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(light);

    const resize = () => {
      const width = mount.clientWidth;
      const height = Math.max(360, Math.min(620, Math.round(width * 0.56)));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    let raf = 0;
    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      controls.dispose();
      renderer.dispose();
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh | THREE.Points | THREE.LineSegments;
        if ('geometry' in mesh && mesh.geometry) mesh.geometry.dispose();
        const material = 'material' in mesh ? mesh.material : undefined;
        if (Array.isArray(material)) material.forEach((m) => m.dispose());
        else material?.dispose();
      });
      renderer.domElement.remove();
      controlsRef.current = null;
    };
  }, [config, threshold]);

  if (!config) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500">
        3D view is not available for this task.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">{config.title}</h3>
          <p className="mt-1 text-sm text-slate-500">{taskSummary}</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-500">
            {config.thresholdLabel}
            <input
              type="range"
              min="0.05"
              max="0.75"
              step="0.01"
              value={threshold}
              onChange={(event) => setThreshold(Number(event.target.value))}
              className="w-32 accent-cyan-600"
            />
          </label>
          <button
            type="button"
            onClick={() => controlsRef.current?.reset()}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            aria-label="Reset 3D camera"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-950">
        <div ref={mountRef} data-3d-viewer className="min-h-[360px] w-full" />
      </div>
    </div>
  );
}
