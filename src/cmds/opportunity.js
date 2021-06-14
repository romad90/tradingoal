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
  let iOpportunities = 0
  const spinner = mod_ora().start(`Seeking opportunies from homeworks...`)
  
  mod_async.waterfall([
    Utils.getHomeworksNotStartedYet,
    (_, done) => {
      if (_.length === 0) return done(new Error('No opportunities from now, try later when odds will be available on fixtures fetched.'))
      done(null, _)
    },
    (_, done) => {
      const oDealSeeker = new DealSeeker(_)
      oDealSeeker.batch(done)
    },
    (_, done) => {
      iOpportunities = _.length
      done(null, _)
    },
    Utils.cleanPreviousOpportunity,
    Utils.addOpportunity
  ], (err, data) => {
    if (err) {
      spinner.fail(err.message)
      mod_process.exit(0)
    }
    spinner.succeed(`${iOpportunities} opportunities added !`)
    mod_process.exit(1)
  })
}
