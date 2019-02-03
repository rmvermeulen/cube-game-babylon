import 'jest-extended';

import { createLevelData } from './cubeLevel';
import { containedIn, containsPos, CubeMap, rect } from './cubeMap';

describe('Overlap checking', () => {
  describe('containedIn :: Rect => Pos => boolean', () => {
    it('handles obvious cases', () => {
      const check = containedIn(
        rect({
          width: 10,
          height: 5,
        }),
      );
      expect(check({ x: 0, y: 0 })).toBeTrue();
      expect(check({ x: 2, y: 2 })).toBeTrue();
      expect(check({ x: 12, y: 2 })).toBeFalse();
      expect(check({ x: 7, y: 7 })).toBeFalse();
      expect(check({ x: 7, y: 4 })).toBeTrue();
    });
    it('handles obvious cases (with offset)', () => {
      const check = containedIn(
        rect({
          x: 10,
          y: 10,
          width: 10,
          height: 5,
        }),
      );
      expect(check({ x: 10, y: 10 })).toBeTrue();
      expect(check({ x: 12, y: 12 })).toBeTrue();
      expect(check({ x: 22, y: 12 })).toBeFalse();
      expect(check({ x: 17, y: 17 })).toBeFalse();
      expect(check({ x: 17, y: 14 })).toBeTrue();
    });

    it('handles edge cases', () => {
      const check = containedIn(
        rect({
          width: 10,
          height: 5,
        }),
      );
    });
  });
  describe('containsPos :: Pos => Rect => boolean', () => {
    it('handles obvious cases', () => {
      const check = containsPos({ x: 10, y: 10 });

      expect(check(rect({ width: 5, height: 5 }))).toBeFalse();
      expect(check(rect({ width: 5, height: 20 }))).toBeFalse();
      expect(check(rect({ width: 20, height: 5 }))).toBeFalse();

      expect(check(rect({ width: 20, height: 20 }))).toBeTrue();
    });

    it('handles edge cases', () => {
      const check = containsPos({ x: 10, y: 10 });

      expect(check(rect({}))).toBeFalse();
      expect(check(rect({ width: 10, height: 10 }))).toBeFalse();
      expect(check(rect({ width: 5, height: 5, x: 6 }))).toBeFalse();
      expect(check(rect({ width: 11, height: 11, x: -20 }))).toBeFalse();

      expect(check(rect({ width: 5, height: 5, x: 6, y: 6 }))).toBeTrue();
      expect(check(rect({ width: 11, height: 11 }))).toBeTrue();
    });
  });
});

describe('CubeMap', () => {
  let map: CubeMap;

  it('can be constructed', () => {
    map = new CubeMap(createLevelData(2));
    expect(map).toBeDefined();
  });
  it('can determine whether points are in bounds', () => {
    expect(map.contains({ x: 0, y: 0 })).toBeTrue();
    expect(map.contains({ x: 100, y: 0 })).toBeFalse();
  });

  it('can find the right side to check the map for', () => {
    expect(map.findSide({ x: 0, y: 0 })).toBe('top');
    expect(map.findSide({ x: 0, y: 1 })).toBe('front');
    expect(map.findSide({ x: 0, y: 2 })).toBe('bottom');
    expect(map.findSide({ x: 1, y: 1 })).toBe('right');
    expect(map.findSide({ x: 2, y: 1 })).toBe('back');
    expect(map.findSide({ x: 3, y: 1 })).toBe('left');
  });
});
