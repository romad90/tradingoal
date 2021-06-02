'use strict'

/**
 * Module dependencies
 * @private	
 */

const mod_minimist = require('minimist')

/**
 * Module exports
 * @public
 */
module.exports = (argsArray) => {
	const args = mod_minimist(argsArray.slice(2))
  let cmd = args._[0] || 'help'

  if (args.version || args.v) {
    cmd = 'version'
  }

  if (args.help || args.h) {
    cmd = 'help'
  }

  switch (cmd) {
    case 'version':
			require('./cmds/version')(args)
      break

    case 'help':
      require('./cmds/help')(args)
      break

    case 'import':
      require('./cmds/import')(args)
      break

    case 'run':
      require('./cmds/run')(args)
      break
      
    case 'fixture':
      require('./cmds/fixture')(args)
      break

    case 'status':
      require('./cmds/status')(args)
      break
      
    default:
      console.error(`"${cmd}" is not a valid command!`)
      break
  }
}