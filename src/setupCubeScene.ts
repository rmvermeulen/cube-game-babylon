import {
  Color3,
  CubeTexture,
  HemisphericLight,
  Light,
  MeshBuilder,
  Orientation,
  PointLight,
  Scene,
  Space,
  StandardMaterial,
  Texture,
  Vector3,
} from 'babylonjs';
import * as _ from 'lodash';
import {
  applyTo,
  clamp,
  evolve,
  map,
  mapObjIndexed,
  pick,
  pipe,
  prop,
} from 'ramda';

import { logger } from './logger';
import { MultiCube } from './MultiCube';

const debug = logger('cube-scene');
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
  // tslint:disable-next-line:no-unused-expression
  new HemisphericLight('light1', new Vector3(1, 1, 0), scene);
  // When click event is raised
  window.addEventListener('click', () => {
    debug('--');
    // We try to pick an object

    const { pickedMesh } = scene.pick(scene.pointerX, scene.pointerY)!;
    if (!pickedMesh) {
      return;
    }
    debug(pickedMesh.name);

    // pickedMesh.visibility = +!pickedMesh.visibility;
  });

  // Skybox
  const skyboxSize = 200;
  const skybox = MeshBuilder.CreateBox(
    'skyBox',
    { size: skyboxSize, sideOrientation: Orientation.CCW },
    scene,
  );
  const skyboxMaterial = new StandardMaterial('skyBox', scene);
  skyboxMaterial.backFaceCulling = true;
  skyboxMaterial.reflectionTexture = new CubeTexture(
    'assets/stormydays',
    scene,
  );
  skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
  skyboxMaterial.disableLighting = true;
  skybox.material = skyboxMaterial;

  const cubeSize = 3;
  const mc = new MultiCube(scene, 5, cubeSize);
  const cube = {
    mesh: mc.rootNode,
    direction: null as null | 'left' | 'right' | 'up' | 'down',
    rotation: 0,
  };

  const playerDiameter = 0.3;
  const player = MeshBuilder.CreateSphere(
    'player',
    { diameter: playerDiameter },
    scene,
  );
  player.checkCollisions = true;
  const playerDistance = cubeSize / 2 - playerDiameter;
  player.position.z += playerDistance;
  let playerIsColliding = false;
  const trackers = {
    up: trackKey(keys, 'up'),
    left: trackKey(keys, 'left'),
    down: trackKey(keys, 'down'),
    right: trackKey(keys, 'right'),
  };
  const playerLight = new PointLight(
    'player-light',
    new Vector3(0, 0, 0),
    scene,
  );
  playerLight.range = 2;
  playerLight.intensity = 0.2;
  playerLight.diffuse = new Color3(3, 1, 0);
  playerLight.parent = player;

  const clampPlayer = {
    x: clamp(-playerDistance, playerDistance),
    y: clamp(-playerDistance, playerDistance),
  };

  let lastPlayerPos = player.position.clone();

  return () => {
    const playerWasColliding = playerIsColliding;
    playerIsColliding = mc.intersects(player);
    if (playerIsColliding !== playerWasColliding) {
      if (playerIsColliding) {
        debug(`player colliding`);
        player.position = lastPlayerPos;
      }
      if (playerWasColliding) {
        debug(`player no longer colliding`);
      }
    }

    skybox.rotate(Vector3.Down(), 2 / 1e4);
    if (cube.direction) {
      let reset = false;
      let rotationStepSize = 5;

      cube.rotation += rotationStepSize;
      if (cube.rotation > 90) {
        rotationStepSize -= cube.rotation - 90;
        reset = true;
      }

      const radianStep = (rotationStepSize * Math.PI) / 180;

      switch (cube.direction) {
        case 'left': {
          cube.mesh.rotate(Vector3.Up(), radianStep, Space.WORLD);
          skybox.rotate(Vector3.Up(), radianStep, Space.WORLD);

          player.rotateAround(Vector3.Zero(), Vector3.Up(), radianStep);
          break;
        }
        case 'right': {
          cube.mesh.rotate(Vector3.Up(), -radianStep, Space.WORLD);
          skybox.rotate(Vector3.Up(), -radianStep, Space.WORLD);

          player.rotateAround(Vector3.Zero(), Vector3.Up(), -radianStep);
          break;
        }
        case 'up': {
          cube.mesh.rotate(Vector3.Left(), radianStep, Space.WORLD);
          skybox.rotate(Vector3.Left(), radianStep, Space.WORLD);

          player.rotateAround(Vector3.Zero(), Vector3.Left(), radianStep);
          break;
        }
        case 'down': {
          cube.mesh.rotate(Vector3.Left(), -radianStep, Space.WORLD);
          skybox.rotate(Vector3.Left(), -radianStep, Space.WORLD);

          player.rotateAround(Vector3.Zero(), Vector3.Left(), -radianStep);
          break;
        }
      }

      if (reset) {
        cube.direction = null;
        cube.rotation = 0;
        player.position.z = playerDistance;

        const quaternion = player.rotationQuaternion;
        if (quaternion) {
          quaternion.set(0, 0, 0, 0);
        }
      }
    } else {
      if (!playerIsColliding) {
        const heldKeys = map(prop<Tracker, 'isHeld'>('isHeld'), trackers);

        // TODO: determine whether to bind to x,y, or z by checking currentSide of cube
        const playerStep = new Vector3(
          +heldKeys.left - +heldKeys.right,
          +heldKeys.up - +heldKeys.down,
        );

        if (playerStep.lengthSquared() > 0) {
          lastPlayerPos = player.position.clone();

          const stepSize = 1 / 60;

          playerStep.normalize();
          const useBabylonMovement = false;
          if (useBabylonMovement) {
            player.moveWithCollisions(playerStep.scale(stepSize));
          } else {
            player.translate(playerStep, stepSize);
          }
          debug(
            'x: %i, y: %i',
            Math.sign(playerStep.x),
            Math.sign(playerStep.y),
          );
        }
      }
    }

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
        debug('spin world left');
      } else if (atBounds.x < 0) {
        cube.direction = 'right';
        debug('spin world right');
      } else if (atBounds.y > 0) {
        cube.direction = 'up';
        debug('spin world up');
      } else if (atBounds.y < 0) {
        cube.direction = 'down';
        debug('spin world down');
      }
    }
  };
};
