import {
  ArcRotateCamera,
  Engine,
  HemisphericLight,
  MeshBuilder,
  Scene,
  Vector3,
} from 'babylonjs';
import * as GUI from 'babylonjs-gui';

import { logger } from './logger';

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

const createGUI = (scene: Scene) => {
  const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI(
    'UI',
    true,
    scene,
  );
  const button = GUI.Button.CreateSimpleButton('but', 'Some button');
  button.width = 0.2;
  button.height = '40px';
  button.color = 'white';
  button.background = 'green';
  button.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
  advancedTexture.addControl(button);

  button.onPointerUpObservable.add(() => {
    debug('click');
  });
};
export const setupScreen = () => {
  debug('setup');

  const canvas = getRenderCanvas();
  const engine = new Engine(canvas, true); // Generate the BABYLON 3D engine
  const scene = new Scene(engine);
  createGUI(scene);

  const camera = new ArcRotateCamera(
    'Camera',
    Math.PI / 2,
    Math.PI / 2,
    2,
    new Vector3(0, 0, 5),
    scene,
  );
  camera.attachControl(canvas, true);
  // Add lights to the scene
  const light1 = new HemisphericLight('light1', new Vector3(1, 1, 0), scene);

  // Add and manipulate meshes in the scene
  const sphere = MeshBuilder.CreateSphere('sphere', { diameter: 2 }, scene);

  let frames = 0;
  // Register a render loop to repeatedly render the scene
  engine.runRenderLoop(() => {
    ++frames;
    scene.render();
  });

  let counts = 0;
  const logFps = logger('fps');
  setInterval(() => logFps(frames / ++counts), 1000);

  // Watch for browser/canvas resize events
  window.addEventListener('resize', () => {
    engine.resize();
  });
};
