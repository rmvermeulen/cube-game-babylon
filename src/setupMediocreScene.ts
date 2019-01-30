import {
  HemisphericLight,
  MeshBuilder,
  Scene,
  Space,
  Vector3,
} from 'babylonjs';

import { logger } from './logger';

const debug = logger('mediocre-scene');

export const setupMediocreScene = (
  scene: Scene,
  keys: Combokeys.Combokeys,
): (() => void) => {
  const light1 = new HemisphericLight('light1', new Vector3(1, 1, 0), scene);

  const cube = {
    mesh: MeshBuilder.CreateBox('cube', { size: 3 }),
    direction: null as null | 'left' | 'right' | 'up' | 'down',
    rotation: 0,
  };

  keys.bind('left', () => {
    if (!cube.direction) {
      cube.direction = 'left';
    }
  });
  keys.bind('right', () => {
    if (!cube.direction) {
      cube.direction = 'right';
    }
  });
  keys.bind('up', () => {
    if (!cube.direction) {
      cube.direction = 'up';
    }
  });
  keys.bind('down', () => {
    if (!cube.direction) {
      cube.direction = 'down';
    }
  });

  return () => {
    if (!cube.direction) {
      return;
    }
    let reset = false;
    let step = 6;
    cube.rotation += step;
    if (cube.rotation > 90) {
      step -= cube.rotation - 90;
      reset = true;
    }

    const deg = (n: number) => n * (Math.PI / 180);

    switch (cube.direction) {
      case 'left': {
        cube.mesh.rotate(Vector3.Up(), deg(step), Space.WORLD);
        break;
      }
      case 'right': {
        cube.mesh.rotate(Vector3.Up(), -deg(step), Space.WORLD);
        break;
      }
      case 'up': {
        cube.mesh.rotate(Vector3.Left(), deg(step), Space.WORLD);
        break;
      }
      case 'down': {
        cube.mesh.rotate(Vector3.Left(), -deg(step), Space.WORLD);
        break;
      }
    }

    if (reset) {
      cube.direction = null;
      cube.rotation = 0;
    }
  };
};
