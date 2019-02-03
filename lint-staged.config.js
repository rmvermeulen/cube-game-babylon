module.exports = {
  'package.json': ['prettier-package-json', 'git add'],
  'src/**/*.ts': [
    'yarn lint --fix',
    'prettier --write',
    'git add',
    'jest --findRelatedTests',
  ],
};
