'use strict'

/**
 * Module dependencies
 * @private
 */
const mod_async = require('async')

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
	console.log(`PUBLISH`)
  // FETCH ALL HOMEWORK OF FIXTURES NOT STARTED
  // CREATE JOURNAL TRADING PER LEAGUE, SEASON, DATE_FIXURE
  
  mod_async.waterfall([
    Utils.getDatasetToPublish,
    (_, done) => {
      // Get Opportunities per Fixtures
      mod_async.map(_, (opts, cb) => {
        Utils.getOpportunity(opts, (err, opportunities) => {
          if (err) return cb(err)
          
          opts.opportunities = opportunities
          cb(null, opts) 
        })
      }, done)
    }
  ], (err, data) => {
    if (err) throw err
    console.log(data)
  })
}