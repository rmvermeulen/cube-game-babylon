import { Engine, Scene } from 'babylonjs';

import { Combos } from './KeyTracker';

export interface MySceneOptions {
  engine: Engine;
  combos: Combos;
}

export class MyScene extends Scene {
  public combos: Combos;
  constructor({ engine, combos }: MySceneOptions) {
    super(engine);
    this.combos = combos;
  }
}
