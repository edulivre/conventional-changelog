# @vue/conventional-changelog

Custom preset for [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog/) which groups changes by package (`@edulivre/xxx`). It works by getting the package which has the highest number of changed files in each commit.

```bash
yarn add -D @edulivre/conventional-changelog
```

Example usage:

```js
const execa = require('execa')
const cc = require('conventional-changelog')
const config = require('@edulivre/conventional-changelog')

const gen = module.exports = version => {
  const fileStream = require('fs').createWriteStream(`CHANGELOG.md`)

  cc({
    config,
    releaseCount: 0,
    pkg: {
      transform (pkg) {
        pkg.version = `v${version}`
        return pkg
      }
    }
  }).pipe(fileStream).on('close', async () => {
    delete process.env.PREFIX
    await execa('git', ['add', '-A'], { stdio: 'inherit' })
    await execa('git', ['commit', '-m', `chore: ${version} changelog [ci skip]`], { stdio: 'inherit' })
  })
}

if (process.argv[2] === 'run') {
  const version = require('./package.json').version
  gen(version)
}
```
