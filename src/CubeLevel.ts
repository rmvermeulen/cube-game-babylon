import { Mesh, MeshBuilder, Vector2, Vector3 } from 'babylonjs';
import { assert } from 'chai';
import { times } from 'ramda';

import { CubeMap } from './cubeMap';

export interface CubeSide {
  id: number;
  north?: CubeSide;
  south?: CubeSide;
  east?: CubeSide;
  west?: CubeSide;
  readonly size: number;
}
export interface LevelData {
  size: number;
  front: CubeSide;
  left: CubeSide;
  back: CubeSide;
  right: CubeSide;
  top: CubeSide;
  bottom: CubeSide;
}

const generate: <T, A extends number>(
  amount: A,
  fn: (n: number) => T,
) => T[] = (amount, fn) => times(fn, amount);

const createSide = (size: number) => (id: number): CubeSide => ({
  size,
  id,
});

export const createLevelData = (size: number): LevelData => {
  const sides = generate(6, createSide(size));
  const [front, left, back, right, top, bottom] = sides;
  // connect sides
  Object.assign(front, {
    north: top,
    east: right,
    south: bottom,
    west: left,
  });
  Object.assign(right, {
    north: top,
    east: back,
    south: bottom,
    west: front,
  });
  Object.assign(back, {
    north: top,
    east: right,
    south: bottom,
    west: left,
  });
  Object.assign(left, {
    north: top,
    east: front,
    south: bottom,
    west: back,
  });
  Object.assign(top, {
    north: back,
    east: right,
    south: front,
    west: left,
  });
  Object.assign(bottom, {
    north: front,
    east: right,
    south: back,
    west: left,
  });

  return { size, front, left, back, right, top, bottom };
};

type Direction = 'left' | 'right' | 'up' | 'down';

export class CubeLevel {
  private _mesh: Mesh;
  private direction: null | Direction;
  private _rotation: number;
  private mapData: LevelData;
  private cubeMap: CubeMap;

  public get mesh() {
    return this._mesh;
  }

  public get rotation() {
    return this._rotation;
  }

  constructor(size: number) {
    this._mesh = MeshBuilder.CreateBox('cube', { size: 3 });
    this.direction = null;
    this._rotation = 0;
    this.mapData = createLevelData(size);
    this.cubeMap = new CubeMap(this.mapData);
  }

  public getFront(): CubeSide {
    return this.mapData.front;
  }
  public getLeft(): CubeSide {
    return this.mapData.left;
  }
  public getBack(): CubeSide {
    return this.mapData.back;
  }
  public getRight(): CubeSide {
    return this.mapData.right;
  }
  public getTop(): CubeSide {
    return this.mapData.top;
  }
  public getBottom(): CubeSide {
    return this.mapData.bottom;
  }

  public isSpinning() {
    return !this.direction;
  }
  public rotate(direction: Direction) {
    if (this.isSpinning()) {
      return;
    }
    this.direction = direction;
  }
  public rotateUp() {
    this.rotate('up');
  }
  public rotateDown() {
    this.rotate('down');
  }
  public rotateLeft() {
    this.rotate('left');
  }
  public rotateRight() {
    this.rotate('right');
  }
  public translateMapPosition(pos: Vector2): Vector3 {
    assert(this.cubeMap);
    return new Vector3();
  }
}
