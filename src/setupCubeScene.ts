import {
  CubeTexture,
  HemisphericLight,
  MeshBuilder,
  Orientation,
  Space,
  StandardMaterial,
  Texture,
  Vector3,
} from 'babylonjs';
import * as _ from 'lodash';
import { applyTo, clamp, evolve, mapObjIndexed, pick, pipe } from 'ramda';

import { logger } from './logger';
import { MultiCube } from './MultiCube';
import { MyScene } from './MyScene';
import { Player } from './Player';

const debug = logger('cube-scene');

export const setupCubeScene = (scene: MyScene): (() => void) => {
  // tslint:disable:no-unused-expression
  new HemisphericLight('light1', new Vector3(1, 1, 0), scene);
  // tslint:enable:no-unused-expression

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

  const player = new Player(scene, playerDiameter);

  const playerDistance = cubeSize / 2 - playerDiameter;
  player.position.z += playerDistance;
  // let playerIsColliding = false;

  const clampPlayer = {
    x: clamp(-playerDistance, playerDistance),
    y: clamp(-playerDistance, playerDistance),
  };

  return () => {
    // const playerWasColliding = playerIsColliding;
    // playerIsColliding = mc.intersects(player.mesh);
    // if (playerIsColliding !== playerWasColliding) {
    //   if (playerIsColliding) {
    //     debug(`player colliding`);
    //     player.position = player.lastPosition;
    //   }
    //   if (playerWasColliding) {
    //     debug(`player no longer colliding`);
    //   }
    // }

    skybox.rotate(Vector3.Down(), 2 / 1e4);
    const cubeIsRotating = !!cube.direction;
    if (cubeIsRotating) {
      player.freeze();
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

          player.mesh.rotateAround(Vector3.Zero(), Vector3.Up(), radianStep);
          break;
        }
        case 'right': {
          cube.mesh.rotate(Vector3.Up(), -radianStep, Space.WORLD);
          skybox.rotate(Vector3.Up(), -radianStep, Space.WORLD);

          player.mesh.rotateAround(Vector3.Zero(), Vector3.Up(), -radianStep);
          break;
        }
        case 'up': {
          cube.mesh.rotate(Vector3.Left(), radianStep, Space.WORLD);
          skybox.rotate(Vector3.Left(), radianStep, Space.WORLD);

          player.mesh.rotateAround(Vector3.Zero(), Vector3.Left(), radianStep);
          break;
        }
        case 'down': {
          cube.mesh.rotate(Vector3.Left(), -radianStep, Space.WORLD);
          skybox.rotate(Vector3.Left(), -radianStep, Space.WORLD);

          player.mesh.rotateAround(Vector3.Zero(), Vector3.Left(), -radianStep);
          break;
        }
      }

      if (reset) {
        cube.direction = null;
        cube.rotation = 0;
        player.position.z = playerDistance;

        const quaternion = player.mesh.rotationQuaternion;
        if (quaternion) {
          quaternion.set(0, 0, 0, 0);
        }
      }
    } else {
      player.unfreeze();
      player.update();
      // if (!playerIsColliding) {
      //   player.update();
      // }
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
