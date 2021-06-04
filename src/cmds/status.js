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

/**
 * Module export
 * @public
 */

module.exports = () => {  
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