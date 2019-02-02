import debug from 'debug';

const appName = 'app';

// only set if empty, or possibly outdated '<appName>:*'

if (!localStorage.debug || /^\w+:\*/.test(localStorage.debug)) {
  localStorage.debug = `${appName}:*`;
  debug(`${appName}:root`)('updated debug environment value');
}
export const logger = (namespace: string) => debug(`${appName}:${namespace}`);
