export type Combos = Combokeys.Combokeys;

export class KeyTracker {
  public get isHeld(): boolean {
    return this._isHeld;
  }
  public static factory(combos: Combos) {
    return (keyName: string) => new KeyTracker(combos, keyName);
  }
  private _isHeld = false;
  constructor(public readonly combos: Combos, public readonly keyName: string) {
    combos.bind(keyName, () => (this._isHeld = true), 'keydown');
    combos.bind(keyName, () => (this._isHeld = false), 'keyup');
  }

  public stop() {
    this.combos.unbind(this.keyName, 'keydown');
    this.combos.unbind(this.keyName, 'keyup');
  }
}
