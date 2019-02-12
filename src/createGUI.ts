import { AdvancedDynamicTexture, Button, Control } from 'babylonjs-gui';

import { logger } from './logger';
import { MyScene } from './MyScene';

const debug = logger('gui');
export const createGUI = (scene: MyScene) => {
  const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI(
    'UI',
    true,
    scene,
  );
  const button = Button.CreateSimpleButton('but', 'Toggle camera');
  button.width = 0.2;
  button.height = '40px';
  button.color = 'white';
  button.background = 'green';
  button.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
  advancedTexture.addControl(button);

  button.onPointerUpObservable.add(() => {
    debug('click');
    const { toggleCameraControl } = window;
    if (toggleCameraControl) {
      toggleCameraControl();
    }
  });
};
