import { Engine, Scene, Vector3 } from 'babylonjs';
import Combokeys from 'combokeys';

import { createGUI } from './createGUI';
import { logger } from './logger';
import { setupCamera } from './setupCamera';
import { setupCubeScene } from './setupCubeScene';

const debug = logger('engine');

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

export const setupEngine = () => {
  debug('setup');

  const canvas = getRenderCanvas();
  const keys = new Combokeys(canvas);

  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);

  scene.gravity = new Vector3(0, -9.81, 0);
  scene.collisionsEnabled = true;

  const updateScene = setupCubeScene(scene, keys);
  createGUI(scene, keys, engine);
  setupCamera(scene, canvas);

  engine.runRenderLoop(() => {
    updateScene();
    scene.render();
  });

  // Watch for browser/canvas resize events
  window.addEventListener('resize', () => {
    debug('resizing');
    engine.resize();
  });

  return { canvas, keys };
};
