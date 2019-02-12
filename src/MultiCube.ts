import { Mesh, MeshBuilder, Scene, TransformNode } from 'babylonjs';
import { assert } from 'chai';
import { __, all, either, equals, flatten, none, times } from 'ramda';

import { logger } from './logger';

const debug = logger('multi-cube');

export class MultiCube {
  public get rootNode(): TransformNode {
    assert(this._rootNode);
    return this._rootNode!;
  }
  private _rootNode?: TransformNode;
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

  public intersects(other: Mesh) {
    for (const { mesh } of this.cubeMap.values()) {
      if (mesh && mesh.intersectsMesh(other, true)) {
        return true;
      }
    }
    return false;
  }
  private bind(scene: Scene) {
    if (this._rootNode) {
      this.scene.removeTransformNode(this._rootNode);
      this._rootNode = undefined;
    }
    this.scene = scene;
    // TODO: create cubes
    const cubes: Mesh[] = this.generateCubes();

    const parent = new TransformNode('multi-cube-root', scene);
    for (const cube of cubes) {
      cube.setParent(parent);
      cube.checkCollisions = true;
    }
    this._rootNode = parent;

    debug('meshes merged');
    this.scene.addTransformNode(this._rootNode);
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
            const enabled = isCorner || Math.random() > 0.7;
            // must be a corner- or edge piece
            if (!isCorner && none(isEdge, pos)) {
              return;
            }
            const name = pos.join();
            let mesh: Mesh | undefined;
            if (enabled) {
              mesh = MeshBuilder.CreateBox(name, {
                size: cubeSize * 0.99,
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
    const rootName = 'mc-body';
    const body = MeshBuilder.CreateBox(rootName, {
      size: this.totalSize - 2.2 * cubeSize,
    });
    this.cubeMap.set(rootName, {
      name: rootName,
      mesh: body,
      enabled: true,
    });
    meshes.unshift(body);
    return meshes;
  }
}
