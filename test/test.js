'use strict'
var conventionalChangelogCore = require('conventional-changelog-core')
var preset = require('../')
var expect = require('chai').expect
var mocha = require('mocha')
var describe = mocha.describe
var it = mocha.it
var gitDummyCommit = require('git-dummy-commit')
var shell = require('shelljs')
var through = require('through2')
var betterThanBefore = require('better-than-before')()
var preparing = betterThanBefore.preparing

betterThanBefore.setups([
  function () {
    shell.config.silent = true
    shell.rm('-rf', 'tmp')
    shell.mkdir('tmp')
    shell.cd('tmp')
    shell.mkdir('git-templates')
    shell.exec('git init --template=./git-templates')

    gitDummyCommit(['build: first build setup', 'BREAKING CHANGE: New build system.'])
    gitDummyCommit(['ci(travis): add TravisCI pipeline', 'BREAKING CHANGE: Continuously integrated.'])
    gitDummyCommit(['feat: amazing new module', 'BREAKING CHANGE: Not backward compatible.'])
    gitDummyCommit(['fix(compile): avoid a bug', 'BREAKING CHANGE: The Change is huge.'])
    gitDummyCommit(['perf(ngOptions): make it faster', ' closes #1, #2'])
    gitDummyCommit('revert(ngOptions): bad commit')
    gitDummyCommit('fix(*): oops')
  },
  function () {
    gitDummyCommit(['feat(awesome): addresses the issue brought up in #133'])
  },
  function () {
    gitDummyCommit(['feat(awesome): fix #88'])
  },
  function () {
    gitDummyCommit(['feat(awesome): issue brought up by @bcoe! on Friday'])
  },
  function () {
    gitDummyCommit(['build(npm): edit build script', 'BREAKING CHANGE: The Change is huge.'])
    gitDummyCommit(['ci(travis): setup travis', 'BREAKING CHANGE: The Change is huge.'])
    gitDummyCommit(['docs(readme): make it clear', 'BREAKING CHANGE: The Change is huge.'])
    gitDummyCommit(['style(whitespace): make it easier to read', 'BREAKING CHANGE: The Change is huge.'])
    gitDummyCommit(['refactor(code): change a lot of code', 'BREAKING CHANGE: The Change is huge.'])
    gitDummyCommit(['test(*): more tests', 'BREAKING CHANGE: The Change is huge.'])
  },
  function () {
    shell.exec('git tag v1.0.0')
    gitDummyCommit('feat: some more features')
  },
  function () {
    gitDummyCommit(['feat(*): implementing #5 by @dlmr', ' closes #10'])
  },
  function () {
    gitDummyCommit(['fix: use npm@5 (@username)'])
  }
])

describe('edulivre preset', function () {
  it('should replace @username with GitHub user URL', function (done) {
    preparing(4)

    conventionalChangelogCore({
      config: preset
    })
      .on('error', function (err) {
        done(err)
      })
      .pipe(through(function (chunk) {
        chunk = chunk.toString()
        expect(chunk).to.include('[@bcoe](https://github.com/bcoe)')
        done()
      }))
  })

  it('should not discard commit if there is BREAKING CHANGE', function (done) {
    preparing(5)

    conventionalChangelogCore({
      config: preset
    })
      .on('error', function (err) {
        done(err)
      })
      .pipe(through(function (chunk) {
        chunk = chunk.toString()

        expect(chunk).to.include('Continuous Integration')
        expect(chunk).to.include('Build System')
        expect(chunk).to.include('Documentation')
        expect(chunk).to.include('Styles')
        expect(chunk).to.include('Code Refactoring')
        expect(chunk).to.include('Tests')

        done()
      }))
  })

  it('should work if there is a semver tag', function (done) {
    preparing(6)
    var i = 0

    conventionalChangelogCore({
      config: preset,
      outputUnreleased: true
    })
      .on('error', function (err) {
        done(err)
      })
      .pipe(through(function (chunk, enc, cb) {
        chunk = chunk.toString()

        expect(chunk).to.include('some more features')
        expect(chunk).to.not.include('BREAKING')

        i++
        cb()
      }, function () {
        expect(i).to.equal(1)
        done()
      }))
  })

  it('should only replace with link to user if it is an username', function (done) {
    preparing(8)

    conventionalChangelogCore({
      config: preset
    })
      .on('error', function (err) {
        done(err)
      })
      .pipe(through(function (chunk) {
        chunk = chunk.toString()

        expect(chunk).to.not.include('(https://github.com/5')
        expect(chunk).to.include('(https://github.com/username')

        done()
      }))
  })
})
