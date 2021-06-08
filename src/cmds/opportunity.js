'use strict'

/**
 * Module dependencies
 * @private
 */
const mod_async = require('async')
const mod_ora = require('ora')
const mod_process = require('process')


/**
 * Module variables
 * @private
 */

const Utils = require('../utils')
const DealSeeker = require('../components/DealSeeker')

/**
 * Module export
 * @public
 */
module.exports = () => {
	//console.log(`OPPORTUNITY`)
  // FETCH ALL HOMEWORK OF FIXTURES NOT STARTED
  // CREATE JOURNAL TRADING PER LEAGUE, SEASON, DATE_FIXURE
  const spinner = mod_ora().start(`Seeking opportunies from homeworks...`)
  
  mod_async.waterfall([
    Utils.getHomeworksNotStartedYet,
    (_, done) => {
      if (_.length === 0) return done(new Error('No opportunities from now, try later when odds will be available on fixtures fetched.'))
      done(null, _)
    },
    (_, done) => {
      const oDealSeeker = new DealSeeker(_)
      oDealSeeker.batch((err, data) => {
        if (err) return done(err)
        console.log(oDealSeeker.opportunities)
        done(null)
      })
    }
  ], (err, data) => {
    if (err) {
      spinner.fail(err.message)
      mod_process.exit(0)
    }
    spinner.succeed('Done!')
  })
}