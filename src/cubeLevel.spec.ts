import { Vector2 } from 'babylonjs';

import { createLevelData, CubeLevel } from './cubeLevel';

const doN = (n: number, fn: () => any) => {
  while (--n) {
    fn();
  }
};

describe('The Cube-shaped level', () => {
  let cube: CubeLevel<10>;
  beforeAll(() => {
    const data = createLevelData(10);
    cube = new CubeLevel(data);
  });

  it('can be constructed', () => {
    expect(cube).toBeDefined();
  });
  it('tracks map-data', () => {
    const front = cube.getFront();
    expect(front).toMatchObject({
      north: expect.any(Object),
      east: expect.any(Object),
      south: expect.any(Object),
      west: expect.any(Object),
    });
  });
  it('translates a map position to a cube position', () => {
    const mapPos = new Vector2(10, 10);
    const cubePos = cube.translateMapPosition(mapPos);
    expect(cubePos).toEqual({
      x: 0,
      y: 0,
      z: 0,
    });
  });
});
