import { ArcRotateCamera, Scene, Vector3 } from 'babylonjs';

import { logger } from './logger';

const debug = logger('camera');
export const setupCamera = (scene: Scene, canvas: HTMLCanvasElement) => {
  const camera = new ArcRotateCamera(
    'Camera',
    Math.PI / 2,
    Math.PI / 2,
    8,
    new Vector3(0, 0, 0),
    scene,
  );
  const toggleCameraControl = () => {
    const w = window as any;
    if (w.cameraHasControl) {
      debug('detach camera control');
      camera.detachControl(canvas);
    } else {
      debug('attach camera control');
      camera.attachControl(canvas, true);
    }
    w.cameraHasControl = !w.cameraHasControl;
  };
  Object.assign(window, {
    toggleCameraControl,
    cameraHasControl: false,
  });
  return camera;
};
