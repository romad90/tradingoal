#!/usr/bin/env node

'use strict'

/**
 * Module dependencies
 * @private	
 */
const { Command } = require('commander')
const program = new Command()

program
  .option('-i, --import', 'import a dataset according a pre-determined country')
  .option('-f, --fixture', 'fecth fixtures available to a given league')
  .option('-p, --publish', 'publish journal trading available')
  .option('-r, --run', 'gathers information to build journal trading')
  .option('-s, --status', 'show the datasets status')
  .option('-v, --version', 'show package version')

program.parse(process.argv)

const options = program.opts()
if (options.import) {
  require('../src/cmds/import.js')()
}

if (options.fixture) {
  require('../src/cmds/fixture.js')()
}

if (options.publish) {
  require('../src/cmds/publish.js')()
}

if (options.run) {
  require('../src/cmds/run.js')()
}

if (options.status) {
  require('../src/cmds/status.js')()
}

if (options.version) {
  require('../src/cmds/version.js')()
}

process
  .on('unhandledRejection', (reason, p) => {
    console.error(reason, 'Unhandled Rejection at Promise', p)
  })
  .on('uncaughtException', err => {
    console.error(err, 'Uncaught Exception thrown')
    process.exit(1)
  })
