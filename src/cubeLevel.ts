import { Mesh, MeshBuilder } from 'babylonjs';

interface LevelData {
  planes: any[];
}
export class CubeLevel {
  private mesh: Mesh;
  private direction: null | 'left' | 'right' | 'up' | 'down';
  private rotation: number;

  constructor(private mapData: LevelData) {
    this.mesh = MeshBuilder.CreateBox('cube', { size: 3 });
    this.direction = null;
    this.rotation = 0;
  }

  public isSpinning() {
    return !this.direction;
  }
  public rotate(direction: 'left' | 'right' | 'up' | 'down') {
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
}
