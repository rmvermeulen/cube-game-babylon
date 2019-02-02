import {
  CubeTexture,
  HemisphericLight,
  MeshBuilder,
  Scene,
  Space,
  StandardMaterial,
  Texture,
  Vector3,
} from 'babylonjs';
import * as _ from 'lodash';
import {
  applyTo,
  binary,
  clamp,
  equals,
  evolve,
  filter,
  flip,
  map,
  mapObjIndexed,
  pick,
  pipe,
  prop,
  propEq,
  reject,
  tap,
} from 'ramda';

import { logger } from './logger';

const debug = logger('mediocre-scene');
type Keys = Combokeys.Combokeys;

const trackKey = (keys: Keys, keyName: string) => {
  const tracker = {
    isHeld: false,
    // tslint:disable-next-line:no-empty
    stop: () => {},
  };
  keys.bind(keyName, () => (tracker.isHeld = true), 'keydown');
  keys.bind(keyName, () => (tracker.isHeld = false), 'keyup');

  tracker.stop = () => {
    keys.unbind(keyName, 'keydown');
    keys.unbind(keyName, 'keyup');
  };
  return tracker;
};
type Tracker = ReturnType<typeof trackKey>;

export const setupCubeScene = (scene: Scene, keys: Keys): (() => void) => {
  const light1 = new HemisphericLight('light1', new Vector3(1, 1, 0), scene);

  // Skybox
  const skybox = MeshBuilder.CreateBox('skyBox', { size: -20.0 }, scene);
  const skyboxMaterial = new StandardMaterial('skyBox', scene);
  skyboxMaterial.backFaceCulling = true;
  // skyboxMaterial.reflectionTexture = new CubeTexture('assets/skybox', scene);
  skyboxMaterial.reflectionTexture = new CubeTexture(
    'assets/stormydays',
    scene,
  );
  skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
  skyboxMaterial.disableLighting = true;
  skybox.material = skyboxMaterial;

  const cube = {
    mesh: MeshBuilder.CreateBox('cube', { size: 3 }),
    direction: null as null | 'left' | 'right' | 'up' | 'down',
    rotation: 0,
  };

  const player = MeshBuilder.CreateSphere('player', { diameter: 0.3 }, scene);
  player.position.z += 4;
  const trackers = {
    up: trackKey(keys, 'up'),
    left: trackKey(keys, 'left'),
    down: trackKey(keys, 'down'),
    right: trackKey(keys, 'right'),
  };

  const offset = 0.8;
  const clampPlayer = {
    x: clamp(-offset, offset),
    y: clamp(-offset, offset),
  };

  let ppCosFactor = 0;

  const ps = '';
  let updateFn;
  return (updateFn = () => {
    skybox.rotate(Vector3.Up(), 5 / 1e4);
    if (cube.direction) {
      let reset = false;
      let step = 2;
      cube.rotation += step;
      if (cube.rotation > 90) {
        step -= cube.rotation - 90;
        reset = true;
      }

      const deg = (n: number) => n * (Math.PI / 180);

      const cosFactor = Math.cos(deg(cube.rotation));
      const playerSpeed = 2 * (ppCosFactor - cosFactor);
      ppCosFactor = cosFactor;

      switch (cube.direction) {
        case 'left': {
          cube.mesh.rotate(Vector3.Up(), deg(step), Space.WORLD);
          skybox.rotate(Vector3.Up(), deg(step) * 0.9, Space.WORLD);
          if (!reset) {
            player.position.x += playerSpeed;
          }
          break;
        }
        case 'right': {
          cube.mesh.rotate(Vector3.Up(), -deg(step), Space.WORLD);
          skybox.rotate(Vector3.Up(), -deg(step) * 0.7, Space.WORLD);
          if (!reset) {
            player.position.x -= playerSpeed;
          }
          break;
        }
        case 'up': {
          cube.mesh.rotate(Vector3.Left(), deg(step), Space.WORLD);
          skybox.rotate(Vector3.Left(), deg(step) * 0.3, Space.WORLD);
          if (!reset) {
            player.position.y += playerSpeed;
          }
          break;
        }
        case 'down': {
          cube.mesh.rotate(Vector3.Left(), -deg(step), Space.WORLD);
          skybox.rotate(Vector3.Left(), -deg(step) * 1.2, Space.WORLD);
          if (!reset) {
            player.position.y -= playerSpeed;
          }
          break;
        }
      }

      if (reset) {
        cube.direction = null;
        cube.rotation = 0;
      }
    } else {
      const heldKeys = map(prop<Tracker, 'isHeld'>('isHeld'), trackers);

      // TODO: determine whether to bind to x,y, or z by checking currentSide of cube
      const playerStep = new Vector3(
        +heldKeys.left - +heldKeys.right,
        +heldKeys.up - +heldKeys.down,
      );

      if (playerStep.lengthSquared() > 0) {
        playerStep.normalize();
        player.translate(playerStep, 1 / 60);
      }
    }

    const jp = (...values: any[]) => {
      const [theOneThing, isList] = values;
      const target = isList ? values : theOneThing;
      const msg =
        typeof target === 'function'
          ? target.toString()
          : JSON.stringify(target, null, 2);
      debug(msg);
    };

    const { position } = player;

    const atBounds = pipe(
      pick<Vector3, 'x' | 'y'>(['x', 'y']),
      evolve(clampPlayer),
      mapObjIndexed(
        pipe(
          (value: number, key: string) => (pos: any) =>
            Math.sign(value - pos[key]),
          applyTo(position),
        ),
      ),
    )(position);

    _.update(position, 'x', clampPlayer.x);
    _.update(position, 'y', clampPlayer.y);

    if (!cube.direction) {
      if (atBounds.x > 0) {
        cube.direction = 'left';
      } else if (atBounds.x < 0) {
        cube.direction = 'right';
      } else if (atBounds.y > 0) {
        cube.direction = 'up';
      } else if (atBounds.y < 0) {
        cube.direction = 'down';
      }
    }
  });
};
