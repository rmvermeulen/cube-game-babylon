import { ArcRotateCamera, Vector3 } from 'babylonjs';

import { logger } from './logger';
import { MyScene } from './MyScene';

const debug = logger('camera');

declare global {
  interface Window {
    cameraHasControl?: boolean;
    toggleCameraControl?: () => void;
  }
}

export const setupCamera = (scene: MyScene, canvas: HTMLCanvasElement) => {
  const camera = new ArcRotateCamera(
    'Camera',
    Math.PI / 2,
    Math.PI / 2,
    8,
    new Vector3(0, 0, 0),
    scene,
  );
  const toggleCameraControl = () => {
    if (window.cameraHasControl) {
      debug('detach camera control');
      camera.detachControl(canvas);
    } else {
      debug('attach camera control');
      camera.attachControl(canvas, true);
    }
    window.cameraHasControl = !window.cameraHasControl;
  };
  Object.assign(window, {
    toggleCameraControl,
    cameraHasControl: false,
  });
  return camera;
};
