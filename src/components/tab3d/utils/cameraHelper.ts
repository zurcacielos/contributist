import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/**
 * Adjusts the camera zoom and position to fit the targetObject in the viewport.
 * 
 * @param camera The PerspectiveCamera to adjust.
 * @param controls The OrbitControls associated with the camera.
 * @param targetObject The object (or group) to frame.
 * @param preserveRotation If true, preserves the current camera rotation relative to target. If false, resets to a default isometric angle.
 */
export function zoomCameraToFit(
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
  targetObject: THREE.Object3D,
  preserveRotation: boolean = true
): void {
  const box = new THREE.Box3().setFromObject(targetObject);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());

  // Avoid math errors for empty objects
  if (size.x === 0 && size.y === 0 && size.z === 0) return;

  const maxDim = Math.max(size.x, size.y, size.z);
  const fovRad = (camera.fov * Math.PI) / 180;
  const cameraDistance = maxDim / (2 * Math.tan(fovRad / 2));

  let direction = new THREE.Vector3();
  if (preserveRotation) {
    // Get direction vector from controls target to current camera position
    direction.subVectors(camera.position, controls.target).normalize();
    // Fallback if direction is zero (e.g. camera is exactly at controls target)
    if (direction.lengthSq() === 0) {
      direction.set(1.2, 1.0, 1.5).normalize();
    }
  } else {
    // Default isometric view direction
    direction.set(1.2, 1.0, 1.5).normalize();
  }

  // Position camera along that direction at calculated distance
  camera.position.copy(center).addScaledVector(direction, cameraDistance * 1.35);

  // Set OrbitControls target to bounding box center and update controls
  controls.target.copy(center);
  controls.update();
}
