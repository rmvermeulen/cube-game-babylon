import { ArcRotateCamera, Scene, Vector3 } from 'babylonjs';

export const setupCamera = (scene: Scene, canvas: HTMLCanvasElement) => {
  const camera = new ArcRotateCamera(
    'Camera',
    Math.PI / 2,
    Math.PI / 2,
    2,
    new Vector3(0, 0, 5),
    scene,
  );
  // camera.attachControl(canvas, true);
  return camera;
};
