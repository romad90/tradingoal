'use strict'

/**
 * Module dependencies
 * @private
 */

const mod_ora = require('ora')
const mod_async = require('async')
const mod_process = require('process')

/**
 * Module variables
 * @private
 */
const Utils = require('../utils')

module.exports = (args) => {
	const opts = {} 
  	
	if (!args.l && !args.league) {
			console.log('-l or --league is the only option available.')
	    mod_process.exit(0) 
	}
  
	if (args.l || args.league) {
		opts.league_id = args.l || args.league
		if (typeof opts.league_id !== 'number') {
			console.log('league is mandatory, and must be a number.')
			mod_process.exit(1)
		} 
	}
  
  const spinner = mod_ora().start('Loading...')
    
  mod_async.waterfall([
    Utils.getLeagueAvailable,
    (leagues, done) => {
      mod_async.map(leagues, Utils.getThresholdByLeagueId, done)
    }
  ], (err, res) => {
    if (err) {
      spinner.fail('Could not get the status..., please check configurations.')
      throw err
    }
    spinner.succeed('Status: ')
    console.log(JSON.stringify(res, null, 2))
		mod_process.exit() 
  })
}