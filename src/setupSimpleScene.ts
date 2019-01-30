import {
  HemisphericLight,
  Mesh,
  MeshBuilder,
  PointerDragBehavior,
  Scene,
  Vector3,
} from 'babylonjs';
import { equals, flip, propEq, repeat, times } from 'ramda';

import { logger } from './logger';

const debug = logger('simple-scene');

type DoTimes = <T extends {}>(factory: (n: number) => T) => T[];

interface Cell {
  x: number;
  y: number;
  z: number;
  active: boolean;
}
class CubeGrid {
  private cells:  Cell[][][];
  constructor(public readonly size: number) {
    const doSize: DoTimes = (fn) => times(fn, size);

    const cube = () =>
      doSize((z: number) =>
        doSize((y: number) =>
          doSize(
            // prettier-ignore
            (x): Cell => ({
              x, y, z,
              active: Math.random() > 0.7,
            }),
          ),
        ),
      );

    this.cells = cube();
  }

  public forEachActive(fn: (cell: Cell) => void) {
    for (const plane of this.cells) {
      for (const line of plane) {
        for (const cell of line) {
          if (cell.active) {
            fn(cell);
          }
        }
      }
    }
  }
}

export const setupSimpleScene = (scene: Scene) => {
  const light1 = new HemisphericLight('light1', new Vector3(1, 1, 0), scene);

  // const sphere = MeshBuilder.CreateSphere('sphere', { diameter: 2 }, scene);
  // const torus = MeshBuilder.CreateTorus('torus', { thickness: 0.2 }, scene);
  // torus.addBehavior(new PointerDragBehavior());

  const scale = 0.1;
  const cubeSize = 8;
  const cellCount = Math.pow(cubeSize, 3);
  const cube = new CubeGrid(cubeSize);
  let count = 0;

  // const getName = ({ x, y, z }: Cell) => [x, y, z].join();

  const meshes: Mesh[] = [];
  cube.forEachActive((cell) => {
    ++count;
    // console.log(cell);

    const mesh = MeshBuilder.CreateBox(undefined,/*`box-${getName(cell)}`*/, {
      size: scale,
    });
    mesh.position.set(cell.x, cell.y, cell.z).scaleInPlace(scale);
    meshes.push(mesh);
  });

  const anchor = new Vector3(0, 0, 0);

  const axis = new Vector3(1, 0.5, 1).normalize();

  const ms = 1e3 / 60;
  const dt = 1 / ms;
  const deg = (rads: number) => dt * (Math.PI / 180) * rads;

  console.log({ dt, ms });

  const comboMesh = Mesh.MergeMeshes(meshes);
  if (comboMesh) {
    comboMesh.setPivotPoint(Vector3.One().scaleInPlace(0.5));
    console.log(comboMesh.getPivotPoint());
    setInterval(() => {
      comboMesh.rotateAround(anchor, axis, deg(15));
    }, ms);
  }
  console.log(
    `${count}/${cellCount}=${Math.floor((count * 1000) / cellCount) / 10}%`,
  );
};
