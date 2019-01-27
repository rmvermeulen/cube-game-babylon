import debug from 'debug';

const appName = 'app';

localStorage.debug = `${appName}:*`;

export const logger = (namespace: string) => debug(`${appName}:${namespace}`);
