import { logger } from './logger';
import { setupScreen } from './screen';

const debug = logger('index.ts');

window.onload = async () => {
  debug('window loaded');

  setupScreen();
};
