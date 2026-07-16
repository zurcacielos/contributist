import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { StlPillar } from "@/utils/stlExporter";

interface ThreeDCanvasProps {
  pillars: StlPillar[];
  numYears: number;
  heightMultiplier: number;
  baseThickness: number;
  spacing: number;
  palette: "green" | "synth" | "gray";
  onCaptureReady: (captureFn: () => string) => void;
}

const PALETTES = {
  green: {
    base: 0x0d1117,
    levels: [0x161b22, 0x0e4429, 0x006d32, 0x26a641, 0x39d353],
  },
  synth: {
    base: 0x090314,
    levels: [0x1a0f30, 0x8b5cf6, 0xec4899, 0xf43f5e, 0x06b6d4],
  },
  gray: {
    base: 0x111111,
    levels: [0x222222, 0x444444, 0x777777, 0xaaaaaa, 0xdddddd],
  },
};

export const ThreeDCanvas: React.FC<ThreeDCanvasProps> = ({
  pillars,
  numYears,
  heightMultiplier,
  baseThickness,
  spacing,
  palette,
  onCaptureReady,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const prevNumYearsRef = useRef<number>(0);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Setup Scene and Camera
    const scene = new THREE.Scene();
    scene.background = null; // transparent background so CSS theme shows through
    sceneRef.current = scene;

    const aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 1000);
    cameraRef.current = camera;

    // 2. Setup Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true, // required for taking PNG captures
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    // Append WebGL Canvas to container
    containerRef.current.appendChild(renderer.domElement);

    // 3. Setup Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.01; // don't go below ground level
    controls.minDistance = 10;
    controls.maxDistance = 300;

    // 4. Setup Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(60, 100, 40);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 250;
    
    // Set up reasonable shadow boundary box
    const d = 100;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    
    scene.add(dirLight);

    // 5. Add Main Object Group
    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;

    // 6. Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 7. Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    // 8. Register Screenshot exporter callback
    onCaptureReady(() => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return "";
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      return rendererRef.current.domElement.toDataURL("image/png");
    });

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update Geometry (Base and Pillars) when props change
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    // Clear previous group children
    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    }

    const currentPalette = PALETTES[palette] || PALETTES.green;
    const pillarSize = 1.0;
    const yearGap = 2;

    // 1. Rebuild Base Plate
    const totalWeeks = 53;
    const totalRows = numYears * 7 + (numYears - 1) * yearGap;
    const baseWidth = totalWeeks * spacing;
    const baseDepth = totalRows * spacing;
    const baseX = ((totalWeeks - 1) * spacing) / 2;
    const baseZ = ((totalRows - 1) * spacing) / 2;

    const baseGeo = new THREE.BoxGeometry(baseWidth, baseThickness, baseDepth);
    const baseMat = new THREE.MeshStandardMaterial({
      color: currentPalette.base,
      roughness: 0.2,
      metalness: 0.1,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.set(baseX, -baseThickness / 2, baseZ);
    baseMesh.receiveShadow = true;
    group.add(baseMesh);

    // 2. Rebuild Pillars
    pillars.forEach((p) => {
      const px = p.col * spacing;
      const pz = (p.yearIndex * (7 + yearGap) + p.row) * spacing;
      const ph = p.level === 0 ? 0.2 : p.level * heightMultiplier;

      const pGeo = new THREE.BoxGeometry(pillarSize, ph, pillarSize);
      const pMat = new THREE.MeshStandardMaterial({
        color: currentPalette.levels[p.level] ?? currentPalette.levels[0],
        roughness: 0.1,
        metalness: 0.05,
      });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      pMesh.position.set(px, ph / 2, pz);
      pMesh.castShadow = true;
      pMesh.receiveShadow = true;
      group.add(pMesh);
    });

    // 3. Zoom-to-fit Camera Positioning
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (camera && controls) {
      const numYearsChanged = numYears !== prevNumYearsRef.current;
      prevNumYearsRef.current = numYears;

      if (numYearsChanged) {
        const box = new THREE.Box3().setFromObject(group);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        const maxDim = Math.max(size.x, size.y, size.z);
        const fovRad = (camera.fov * Math.PI) / 180;
        const cameraDistance = maxDim / (2 * Math.tan(fovRad / 2));
        
        // Look from a nice isometric angle
        const dir = new THREE.Vector3(1.2, 1.0, 1.5).normalize();
        camera.position.copy(center).add(dir.multiplyScalar(cameraDistance * 1.35));
        
        controls.target.copy(center);
        controls.update();
      }
    }
  }, [pillars, numYears, heightMultiplier, baseThickness, spacing, palette]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        borderRadius: "12px",
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        border: "1px solid var(--border)",
        cursor: "grab",
      }}
    />
  );
};
