import { Mesh, MeshBuilder, Scene } from 'babylonjs';
import { assert } from 'chai';
import { __, either, equals, flatten, none, times } from 'ramda';

import { logger } from './logger';

const debug = logger('multi-cube');

export class MultiCube {
  private mesh?: Mesh;
  private cubeMap = new Map<string, { name: string; mesh: Mesh }>();
  constructor(private scene: Scene, public readonly size: number) {
    debug('size before bind', this.scene, size);
    this.bind(scene);
  }
  private bind(scene: Scene) {
    if (this.mesh) {
      this.scene.removeMesh(this.mesh);
      this.mesh = undefined;
    }
    this.scene = scene;
    // TODO: create cubes
    const cubes: Mesh[] = this.generateCubes();
    debug('got cubes', cubes);

    const mesh = Mesh.MergeMeshes(cubes);
    assert(mesh, 'Failed to merge meshes');
    this.mesh = mesh!;
    debug('meshes merged');
    this.scene.addMesh(this.mesh);
    this.mesh.scaling.set(0.2, 0.2, 0.2);
  }

  private generateCubes(): Mesh[] {
    debug(this.size);
    const generate = times(__, this.size);

    const isEdge = either(equals(0), equals(this.size - 1));

    const meshes: Mesh[] = (flatten as any)(
      generate((z) =>
        generate((y) =>
          generate((x) => {
            const pos = [x, y, z];
            if (none(isEdge, pos)) {
              return;
            }
            const name = pos.join();
            debug(`creating cube at ${name}`);
            const mesh = MeshBuilder.CreateBox(name, { size: 0.5 });
            mesh.position.set(x, y, z);
            this.cubeMap.set(name, {
              name,
              mesh,
            });
            return mesh;
          }),
        ),
      ),
    ).filter(Boolean);
    return meshes;
  }
}
