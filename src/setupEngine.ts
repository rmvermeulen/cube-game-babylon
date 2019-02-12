import { Engine, Scene, Vector3 } from 'babylonjs';
import Combokeys from 'combokeys';

import { createGUI } from './createGUI';
import { logger } from './logger';
import { MyScene } from './MyScene';
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
  const engine = new Engine(canvas, true);

  const combos = new Combokeys(canvas);
  const scene = new MyScene({ engine, combos });

  scene.gravity = new Vector3(0, -9.81, 0);
  scene.collisionsEnabled = true;

  const updateScene = setupCubeScene(scene);
  createGUI(scene);
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

  return { canvas, keys: combos };
};
