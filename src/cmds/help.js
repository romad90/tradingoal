'use strict'


/**
 * Modules dependencies
 * @private
 */
const mod_chalk = require('chalk')

/**
 * Modules variables
 * @private
 */

const menus = {
  main: `
${mod_chalk.greenBright('eft [command] <options>')}

  ${mod_chalk.blueBright('import')} .............. import a dataset for a pre-determined country
  ${mod_chalk.blueBright('status')} .............. show the datasets status, of a specific league
  ${mod_chalk.blueBright('fixture')} ............. set up the requirements for the trading journal creation
  ${mod_chalk.blueBright('run')}.................. create the journal trading specifying the league and the date of the fixture
  ${mod_chalk.blueBright('version')} ............. show package version
  ${mod_chalk.blueBright('test')} ................ test experimentation
  ${mod_chalk.blueBright('help')} ................ show help menu for a command
`,

  import: `
${mod_chalk.greenBright('eft import')} ${mod_chalk.whiteBright('<no-options>')}
`,

  status: `
${mod_chalk.greenBright('eft status')} ${mod_chalk.whiteBright('<no-options>')}
`,  

  fixture: `
 ${mod_chalk.greenBright('eft fixture')} ${mod_chalk.whiteBright('<no-options>')}
`,

  run: `
  ${mod_chalk.greenBright('eft run <options>')}

  --date_fixture, -df ..... [Required] set the date of the fixtures.
  --league, -c ............ [Optional] set the league to analyase. Default: all
`
}

/**
 * Module export
 * @public
 */

module.exports = (args) => {
  const subCmd = args._[0] === 'help'
    ? args._[1]
    : args._[0]
  console.log(menus[subCmd] || menus.main)
}