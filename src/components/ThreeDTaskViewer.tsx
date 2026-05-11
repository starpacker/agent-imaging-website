'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RotateCcw } from 'lucide-react';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const SCREEN_LEFT_SHIFT = 0.05;

const THREE_D_TASKS = new Set([
  'eht_black_hole_original',
  'eht_black_hole_tomography',
  'SSNP_ODT',
  'reflection_ODT',
  'light_field_microscope',
  'single_molecule_light_field',
  's2ism',
  'xray_laminography',
]);

interface PointCloudPayload {
  task: string;
  site_task: string;
  upstream_task: string;
  title: string;
  source: string;
  mode: string;
  positions: number[][];
  colors: number[][];
  intensity: number[];
  bounds?: Record<string, unknown>;
}

export function hasThreeDView(taskName: string): boolean {
  return THREE_D_TASKS.has(taskName);
}

function addFrame(scene: THREE.Scene, size = 2.16) {
  const box = new THREE.BoxGeometry(size, size, size);
  const edges = new THREE.EdgesGeometry(box);
  scene.add(
    new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.36 })
    )
  );
}

function pointSizeForMode(mode: string): number {
  if (mode === 'localizations') return 0.032;
  if (mode === 'heightfield') return 0.042;
  return 0.038;
}

function defaultThresholdForTask(taskName: string): number {
  if (taskName === 'eht_black_hole_tomography') return 0.02;
  return 0.08;
}

function fitVisiblePositions(positions: number[], preserveDomain: boolean): number[] {
  if (positions.length === 0 || preserveDomain) return positions;

  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];

  for (let i = 0; i < positions.length; i += 3) {
    for (let axis = 0; axis < 3; axis += 1) {
      const value = positions[i + axis];
      min[axis] = Math.min(min[axis], value);
      max[axis] = Math.max(max[axis], value);
    }
  }

  const center = [
    (min[0] + max[0]) / 2,
    (min[1] + max[1]) / 2,
    (min[2] + max[2]) / 2,
  ];
  const span = Math.max(max[0] - min[0], max[1] - min[1], max[2] - min[2]);
  const scale = Number.isFinite(span) && span > 1e-6 ? 1.82 / span : 1;

  return positions.map((value, index) => (value - center[index % 3]) * scale);
}

function createPointCloud(payload: PointCloudPayload, threshold: number) {
  const positions: number[] = [];
  const colors: number[] = [];

  for (let i = 0; i < payload.positions.length; i += 1) {
    const intensity = payload.intensity[i] ?? 1;
    if (intensity < threshold) continue;
    const p = payload.positions[i];
    const c = payload.colors[i] ?? [0.6, 0.85, 1.0];
    positions.push(p[0], p[1], p[2]);
    colors.push(c[0], c[1], c[2]);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(
    fitVisiblePositions(positions, Boolean(payload.bounds?.preserve_domain)),
    3
  ));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeBoundingSphere();

  const material = new THREE.PointsMaterial({
    size: pointSizeForMode(payload.mode),
    vertexColors: true,
    transparent: true,
    opacity: payload.mode === 'heightfield' ? 0.98 : 0.94,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });

  return {
    points: new THREE.Points(geometry, material),
    count: positions.length / 3,
  };
}

function addContextGeometry(scene: THREE.Scene, payload: PointCloudPayload) {
  addFrame(scene);

  if (payload.task === 'eht_black_hole_tomography') {
    const sphereGeometry = new THREE.SphereGeometry(0.22, 32, 18);
    scene.add(
      new THREE.Mesh(
        sphereGeometry,
        new THREE.MeshBasicMaterial({ color: 0x020617 })
      )
    );
    scene.add(
      new THREE.Mesh(
        sphereGeometry,
        new THREE.MeshBasicMaterial({ color: 0x94a3b8, wireframe: true, transparent: true, opacity: 0.32 })
      )
    );

    const orbit = new THREE.Mesh(
      new THREE.TorusGeometry(0.62, 0.008, 8, 128),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.52 })
    );
    scene.add(orbit);

    const disk = new THREE.Mesh(
      new THREE.CircleGeometry(0.78, 96),
      new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.06, side: THREE.DoubleSide })
    );
    scene.add(disk);
  }

  if (payload.mode === 'heightfield') {
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(2.05, 2.05),
      new THREE.MeshBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.16, side: THREE.DoubleSide })
    );
    plane.position.z = -0.52;
    scene.add(plane);
  }

  if (payload.site_task === 's2ism') {
    [-1, 1].forEach((z) => {
      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(2.1, 2.1),
        new THREE.MeshBasicMaterial({ color: z > 0 ? 0xf43f5e : 0x14b8a6, transparent: true, opacity: 0.08, side: THREE.DoubleSide })
      );
      plane.position.z = z;
      scene.add(plane);
    });
  }
}

interface Props {
  taskName: string;
}

export default function ThreeDTaskViewer({ taskName }: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const [payload, setPayload] = useState<PointCloudPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [threshold, setThreshold] = useState(defaultThresholdForTask(taskName));

  useEffect(() => {
    setPayload(null);
    setError(null);
    setThreshold(defaultThresholdForTask(taskName));
    if (!hasThreeDView(taskName)) return;

    fetch(`${BASE_PATH}/data/3d/${taskName}.json`)
      .then((response) => {
        if (!response.ok) throw new Error(`3D payload not found (${response.status})`);
        return response.json();
      })
      .then((data: PointCloudPayload) => setPayload(data))
      .catch((err: Error) => setError(err.message));
  }, [taskName]);

  const renderedCount = useMemo(() => {
    if (!payload) return 0;
    return payload.intensity.filter((value) => value >= threshold).length;
  }, [payload, threshold]);

  useEffect(() => {
    if (!payload || !mountRef.current) return;
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    addContextGeometry(scene, payload);

    const { points } = createPointCloud(payload, threshold);
    scene.add(points);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(3.8, 3.0, 4.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.8;
    controls.minDistance = 2.4;
    controls.maxDistance = 8.5;
    controlsRef.current = controls;

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));

    const resize = () => {
      const width = mount.clientWidth;
      const height = Math.max(360, Math.min(620, Math.round(width * 0.56)));
      const renderWidth = Math.round(width * (1 + SCREEN_LEFT_SHIFT * 2.5));
      const offsetLeft = Math.round(width * SCREEN_LEFT_SHIFT * 2.25);
      renderer.setSize(renderWidth, height, false);
      renderer.domElement.style.width = `${renderWidth}px`;
      renderer.domElement.style.height = `${height}px`;
      renderer.domElement.style.marginLeft = `-${offsetLeft}px`;
      renderer.domElement.style.display = 'block';
      camera.aspect = renderWidth / height;
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
  }, [payload, threshold]);

  if (error) {
    return <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500">{error}</div>;
  }

  if (!payload) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-white py-16">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-200 border-t-cyan-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">{payload.title}</h3>
          <p className="mt-1 text-sm text-slate-500">
            Source: <span className="font-mono text-xs">{payload.source}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-500">
            Threshold
            <input
              type="range"
              min="0"
              max="0.75"
              step="0.01"
              value={threshold}
              onChange={(event) => setThreshold(Number(event.target.value))}
              className="w-32 accent-cyan-600"
            />
          </label>
          <span className="w-20 text-right text-xs font-mono text-slate-400">{renderedCount} pts</span>
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
