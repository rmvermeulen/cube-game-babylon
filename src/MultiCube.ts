import { Mesh, MeshBuilder, Scene } from 'babylonjs';
import { assert } from 'chai';
import { __, all, either, equals, flatten, none, times } from 'ramda';

import { logger } from './logger';

const debug = logger('multi-cube');

export class MultiCube {
  private _mesh?: Mesh;

  public get mesh(): Mesh {
    assert(this._mesh);
    return this._mesh!;
  }
  private cubeMap = new Map<
    string,
    {
      name: string;
      mesh?: Mesh;
      enabled: boolean;
    }
  >();
  constructor(
    private scene: Scene,
    public readonly cellCount: number,
    public readonly totalSize: number,
  ) {
    debug('size before bind', this.scene, cellCount);
    this.bind(scene);
  }
  private bind(scene: Scene) {
    if (this._mesh) {
      this.scene.removeMesh(this._mesh);
      this._mesh = undefined;
    }
    this.scene = scene;
    // TODO: create cubes
    const cubes: Mesh[] = this.generateCubes();

    const mesh = Mesh.MergeMeshes(cubes);
    assert(mesh, 'Failed to merge meshes');
    this._mesh = mesh!;

    debug('meshes merged');
    this.scene.addMesh(this._mesh);
  }

  private generateCubes(): Mesh[] {
    debug(this.cellCount);
    const generate = times(__, this.cellCount);
    const cubeSize = this.totalSize / this.cellCount;
    const offset = (this.cellCount - 1) / 2;
    debug(offset);

    const isEdge = either(equals(0), equals(this.cellCount - 1));

    const meshes: Mesh[] = (flatten as any)(
      generate((z) =>
        generate((y) =>
          generate((x) => {
            const pos = [x, y, z];
            const isCorner = all(isEdge, pos);
            const enabled = isCorner ? true : Math.random() > 0.5;
            // must be a corner- or edge piece
            if (!isCorner && none(isEdge, pos)) {
              return;
            }
            const name = pos.join();
            let mesh: Mesh | undefined;
            if (enabled) {
              mesh = MeshBuilder.CreateBox(name, {
                size: cubeSize * 0.95,
              });
              mesh.position.set(
                (x - offset) * cubeSize,
                (y - offset) * cubeSize,
                (z - offset) * cubeSize,
              );
            }
            this.cubeMap.set(name, {
              name,
              mesh,
              enabled,
            });
            return mesh;
          }),
        ),
      ),
    ).filter(Boolean);
    return meshes;
  }
}
