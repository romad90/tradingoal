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

  ${mod_chalk.blueBright('init')} ................ manage the datasets mandatory
  ${mod_chalk.blueBright('status')} .............. show the datasets status
  ${mod_chalk.blueBright('fixture')} ............. set up the requirements for the trading journal creation
  ${mod_chalk.blueBright('run')}.................. create the journal trading specifying the league and the date of the fixture
  ${mod_chalk.blueBright('version')} ............. show package version
  ${mod_chalk.blueBright('help')} ................ show help menu for a command
`,

  init: `
${mod_chalk.greenBright('eft init <options>')}
	--country, -c ........... set up specific leagues, by country.
	--all, -a ............... set up leagues, teams and players datasets.
`,

  status: `
${mod_chalk.greenBright('eft status <options>')}

  --league, -l ......... [Required] shows the status of teams, players installed per league.
`,

  fixture: `
${mod_chalk.greenBright('eft fixture <options>')}
  --action, -a ......... determine action to perform [add, ls].
  --league, -l ......... shows the status of teams, players installed per league.
  --date, -d ........... [Required] shows the status of teams, players installed per league.
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