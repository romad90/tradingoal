/**
 * Module dependencies
 * @private	
 */
const { Command } = require('commander')
const program = new Command()

/**
 * Module export
 * @public
 */

module.exports = (args) => {
  program
    .option('-i, --import', 'import a dataset according a pre-determined country')
    .option('-f, --fixture', 'fecth fixtures available to a given league')
    .option('-p, --publish', 'publish journal trading available')
    .option('-o, --opportunity', 'determine the best strategies according homeworks for fixtures available')
    .option('-r, --run', 'do homeworks on fixtures fecthed to build journal trading')
    .option('-s, --status', 'show the datasets status')
    .option('-n, --number', 'mediation to fix players number')
    .option('-v, --version', 'show package version')

  program.parse(args)

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
  
  if (options.opportunity) {
    require('../src/cmds/opportunity.js')()
  }

  if (options.run) {
    require('../src/cmds/run.js')()
  }

  if (options.status) {
    require('../src/cmds/status.js')()
  }
  
  if (options.number) {
    require('../src/cmds/number.js')()
  }

  if (options.version) {
    require('../src/cmds/version.js')()
  }
  
}

process.on('uncaughtException', (err) => {
  console.log(err)
  process.exit(1)
})
