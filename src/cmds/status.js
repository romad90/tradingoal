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
const LIMIT = 8

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
    },
    (_, done) => {
      Utils.getIPlayersWithoutNumber((err, data) => {
        if (err) return done(err)
        _.push(data)
        done(null, _)
      })
    },
    (_, done) => {
      Utils.getTeamsHavingManyPlayersWithoutNumber({limit: LIMIT}, (err, data) => {
        if (err) return done(err)
        const [resume, raw_details] = data
        resume.push({
          'details': `Team(s) having more than ${LIMIT} players without any number affected, might cause problems when searching opportunities.`
        })
        _.push(resume)
        done(null, _)
      })
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
