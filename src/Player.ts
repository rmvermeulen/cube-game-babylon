import {
  Color3,
  MeshBuilder,
  PhysicsImpostor,
  PointLight,
  Vector3,
} from 'babylonjs';

import { KeyTracker } from './KeyTracker';
import { logger } from './logger';
import { MyScene } from './MyScene';

const debug = logger('player');

export class Player {
  public get isColliding() {
    return this._isColliding;
  }

  public get position() {
    return this._mesh.position;
  }
  public set position(pos) {
    this._mesh.position = pos;
  }

  public get mesh() {
    return this._mesh;
  }
  public get lastPosition() {
    if (!this._lastPosition) {
      this._lastPosition = this.position.clone();
    }
    return this._lastPosition;
  }
  private _mesh = MeshBuilder.CreateSphere(
    'player',
    { diameter: this.diameter },
    this.scene,
  );
  private _isColliding = false;
  private trackers: {
    up: KeyTracker;
    left: KeyTracker;
    right: KeyTracker;
    down: KeyTracker;
  };
  private _lastPosition?: Vector3;
  private isFrozen = false;

  constructor(private scene: MyScene, private diameter: number) {
    this._mesh.checkCollisions = true;
    this._mesh.physicsImpostor = new PhysicsImpostor(
      this._mesh,
      PhysicsImpostor.SphereImpostor,
      {
        mass: 0.1,
      },
    );

    const trackKey = KeyTracker.factory(scene.combos);
    this.trackers = {
      up: trackKey('up'),
      left: trackKey('left'),
      down: trackKey('down'),
      right: trackKey('right'),
    };

    const light = new PointLight('player-light', new Vector3(0, 0, 0), scene);
    light.range = 2;
    light.intensity = 0.2;
    light.diffuse = new Color3(3, 1, 0);
    light.parent = this._mesh;
  }
  public freeze() {
    const impostor = this._mesh.physicsImpostor;
    if (!impostor) {
      return;
    }
    impostor.sleep();
    this.isFrozen = true;
  }

  public unfreeze() {
    const impostor = this._mesh.physicsImpostor;
    if (impostor && this.isFrozen) {
      impostor.wakeUp();
      this.isFrozen = false;
    }
  }

  public update() {
    const { up, left, right, down } = this.trackers;
    const step = new Vector3(
      +left.isHeld - +right.isHeld,
      +up.isHeld - +down.isHeld,
    );

    if (step.lengthSquared() > 0) {
      this._lastPosition = this.position.clone();

      const stepSize = 1 / 60;

      step.normalize();
      const useBabylonMovement = false;
      if (useBabylonMovement) {
        this._mesh.moveWithCollisions(step.scale(stepSize));
      } else {
        this._mesh.translate(step, stepSize);
      }
      debug('x: %i, y: %i', Math.sign(step.x), Math.sign(step.y));
    }
  }
}
