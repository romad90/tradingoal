'use strict'

/**
 * Module dependencies
 * @private
 */

const autoBind = require('auto-bind')
const mod_async = require('async')
const mod_moment = require('moment')
const EventEmitter = require('events')

/**
 * Module variables
 * @private
 */
const Utils = require('../utils')
const footballAPi = require('../services/footballAPi.js')
const INTERVALS = 60000
const FINISHED = 'Match Finished'

class FixtureEvt {
  constructor() {
    this.fixturesNotStartedYet = []
    this.fixturesInPending = []
    this.fixturesInProgress = []
    this.watch()
    autoBind(this)    
  }
  
  updateNotStartedToInPending (opts, cb) {
    if (mod_moment.utc().isAfter(opts.date_fixture)
    Utils.updateFixtureToInPending(opts, (err) => {
      if (err) return cb(err)
      return cb(null)
    })
  }
  
  updatePendingToFinished (fixturesInPending, cb) {
    const fixtureIds = map.reduce(function(cur, fixtureObj) {
        return fixtureObj.fixture_id
    }, [])
    
    const sFixtureIds = fixtureIds.join('-')
    footballAPi.getLiveFixtures(fixtureIds.join('-'), (err, _) => {
      if (err) return cb(err)
      this.fixturesInProgress = _
        
      mod_async.map(this.fixturesInProgress, (fixture, done) => {
        if (fixture.status === FINISHED) {
          Utils.updateFixtureToFinished(fixture, done)
        }
        done(null)
      }, cb)
    })
  }
  
  watch(done) {
    setInterval(() => {
      mod_async.parallel([
        Utils.getAllFixtureNotStartedYet,
        Utils.getAllFixtureInPending
      ], (err, data) => {
        if (err) throw err
        [this.fixturesNotStartedYet, this.fixturesInPending] = data
        mod_async.parallel([
          (callback) => {
            mod_async.map(this.fixturesNotStartedYet, updateNotStartedToInPending, callback)
          },
          (callback) => {
            getFixturesInProgress(this.fixturesInPending, callback)
          }
        ], done)
      })
     }, 60000)
  }
  
  // create a function to watch fixturesInProgress, and then mixing with the strategy defines, give an alert when all criterias are meet as an opportunity.
}