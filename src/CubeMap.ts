import { assert } from 'chai';
import { anyPass } from 'ramda';

type Point = Record<'x' | 'y', number>;
type Size = Record<'width' | 'height', number>;

export const containedIn = ({ width, height, ...pos }: Rect) => ({
  x,
  y,
}: Point): boolean => {
  x -= pos.x;
  y -= pos.y;
  return x >= 0 && x < width && y < height && y >= 0;
};
export const containsPos = (p: Point) => (r: Rect) => containedIn(r)(p);

type Rect = Point & Size;
export const rect = (data: Partial<Rect>): Rect => ({
  x: data.x || 0,
  y: data.y || 0,
  width: data.width || 0,
  height: data.height || 0,
});

/** _
 * |_|_ _ _     0
 * |_|_|_|_|    1 2 3 4
 * |_|          5
 * 0 top
 * 1 front
 * 2 right
 * 3 back
 * 4 left
 * 5 bottom
 */

type SideName = 'top' | 'front' | 'right' | 'back' | 'left' | 'bottom';
const cubeSideNames: SideName[] = [
  'top',
  'front',
  'right',
  'back',
  'left',
  'bottom',
];

export class CubeMap {
  private sides: {
    top: Rect;
    front: Rect;
    bottom: Rect;
    right: Rect;
    back: Rect;
    left: Rect;
  };

  private checkBarShapes: (pos: Point) => boolean;

  constructor(data: {}) {
    const verticalBar = rect({
      width: 1,
      height: 3,
    });
    const horizontalBar = rect({
      x: 1,
      y: 1,
      width: 3,
      height: 1,
    });
    this.checkBarShapes = anyPass([
      containedIn(horizontalBar),
      containedIn(verticalBar),
    ]);

    this.sides = {
      top: rect({}),
      front: rect({ y: 1 }),
      bottom: rect({ y: 2 }),
      right: rect({ x: 1, y: 1 }),
      back: rect({ x: 2, y: 1 }),
      left: rect({ x: 3, y: 1 }),
    };
  }

  public contains(point: Point): boolean {
    return this.checkBarShapes(point);
  }
  public findSide(pos: Point) {
    assert(this.contains(pos), 'Start position outside of map');
    return this._findSide(pos);
  }

  /** @param {Point} pos - Must be contained */
  private _findSide(pos: Point): SideName {
    const sides = Object.values(this.sides);
    const entry = sides.findIndex(containsPos(pos))!;
    console.log({ entry });
    return cubeSideNames[entry];
  }
}
