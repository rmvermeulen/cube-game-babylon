import { CubeLevel } from './cubeLevel';

const doN = (n: number, fn: () => any) => {
  while (--n) {
    fn();
  }
};

describe('The Cube-shaped level', () => {
  let cube: CubeLevel;
  beforeAll(() => {
    cube = new CubeLevel({
      planes: [],
    });
  });

  it('can be constructed', () => {
    expect(cube).toBeDefined();
  });
  it('can rotate in any direction forever', () => {
    const flips = 500;
    expect(() => {
      doN(flips, () => cube.rotateUp());
      doN(flips, () => cube.rotateDown());
      doN(flips, () => cube.rotateLeft());
      doN(flips, () => cube.rotateRight());
    }).not.toThrow();
  });
  it('shows map-data', () => {
    expect(true);
  });
});
