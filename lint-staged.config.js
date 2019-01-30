module.exports = {
  hooks: {
    'package.json': ['prettier-package-json', 'git add'],
    'src/**/*.{ts,json}': [
      'yarn lint --fix',
      'prettier --write',
      'git add',
      'jest --findRelatedTests'
    ]
  }
};
