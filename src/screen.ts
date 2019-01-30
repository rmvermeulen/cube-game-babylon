import { Engine, Scene } from 'babylonjs';
import Combokeys from 'combokeys';

import { createGUI } from './createGUI';
import { logger } from './logger';
import { setupCamera } from './setupCamera';
import { setupMediocreScene } from './setupMediocreScene';

const debug = logger('screen');

const getRenderCanvas = (): HTMLCanvasElement => {
  const maybeCanvas = document.getElementById('renderCanvas');
  if (maybeCanvas instanceof HTMLCanvasElement) {
    return maybeCanvas;
  }
  const canvas = new HTMLCanvasElement();
  canvas.id = 'renderCanvas';
  document.body.append(canvas);
  return canvas;
};

export const setupScreen = () => {
  debug('setup');

  const canvas = getRenderCanvas();
  const keys = new Combokeys(canvas);

  const engine = new Engine(canvas, true); // Generate the BABYLON 3D engine
  const scene = new Scene(engine);

  // const update = setupSimpleScene(scene, keys);
  const update = setupMediocreScene(scene, keys);
  createGUI(scene, keys);
  setupCamera(scene, canvas);
  // const mainCamera = new Camera('main', new Vector3(0, 0, 5), scene);
  // mainCamera.attachControl(canvas, true);


  engine.runRenderLoop(() => {
    update();
    scene.render();
  });

  // Watch for browser/canvas resize events
  window.addEventListener('resize', () => {
    engine.resize();
  });

  return { canvas, keys };
};
