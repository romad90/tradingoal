'use strict'

/**
 * Module dependencies
 * @private
 */

const mod_async = require('async')
const mod_inquirer = require('inquirer')
const mod_ora = require('ora')
const mod_process = require('process')

/**
 * Module variables
 * @private
 */

const Utils = require('../utils')
const knex = require('../knex.js')
const footballAPi = require('../services/footballAPi.js')

/**
 * Module export
 * @public
 */

// TODO: yet to inspect and adjust
module.exports = () => {
  let spinner
  mod_async.waterfall([
    Utils.getAllFixtureNotStartedYet,
    (_, done) => {
      mod_async.filter(_, (fixture, callback) => {        
        footballAPi.getFixtureById(fixture, (err, data) => {
          if (err) 
            return callback(err)
            
          if (data.fixture.status.short === 'NS')
            return callback(null, true)
            
          Utils.updateFixtureStatus({
            fixture_id: data.fixture.id,
            status: 'LOCKED'
          }, (err) => {
            if (err) return callback(null, false)
          })
        })
      } , done)
    },
    (fixturesNotStartedYet, done) => {
      spinner = mod_ora().start(`Doing homeworks, on fixtures available: [${fixturesNotStartedYet.length}] found.`)
      if (fixturesNotStartedYet.length === 0) return done(new Error('no fixtures have been found, please go fetch them first.'))
      mod_async.map(fixturesNotStartedYet, (_, callback) => {
        mod_async.parallel([
          mod_async.apply(Utils.preHomeworkPerTeam, {
            fixture_id: _.fixture_id,
            team_id: _.home_team,
            league_id: _.league_id
          }),
          mod_async.apply(Utils.preHomeworkPerTeam, {
            fixture_id: _.fixture_id,
            team_id: _.away_team,
            league_id: _.league_id
          })
        ], callback)
      }, done)
    },
    (_, done) => {
       mod_async.map(_, Utils.prepHomework, done)
    },
    Utils.addHomework
  ], (err) => {
    if (err) {
      spinner.warn(err.message)
      mod_process.exit(0)
    }
    spinner.succeed()
    mod_process.exit(1)
  })
}