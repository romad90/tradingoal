'use strict'

/**
 * Module dependencies
 * @private
 */

const mod_async = require('async')
const autoBind = require('auto-bind')
const mod_assert = require('assert').strict

/**
 * Module variables
 * @private
 */
const Utils = require('../../utils')
const knex = require('../../knex')
const DIFFERENCE = 20

const isDiffMinor20 = (greater, lower)  => {
    mod_assert.ok(typeof greater === 'number' && greater !== null, "argument 'greater' cannot be null")
    mod_assert.ok(typeof lower === 'number' && greater !== null, "argument 'lower' cannot be null")
    
    return (DIFFERENCE + ((lower * 100) / greater)) >= 100
}

const isUnderdogPlayingAway = (homework) => {
    mod_assert.ok(typeof homework === 'object' && homework !== null, "argument 'opts' cannot be null")
    mod_assert.ok(typeof homework.home_odds === 'number' && homework.home_odds !== null, "argument 'opts.home_odds' cannot be null")
    mod_assert.ok(typeof homework.away_odds === 'number' && homework.away_odds !== null, "argument 'opts.away_odds' cannot be null")
  
  return homework.home_odds < homework.away_odds
}

class DealSeeker {
  constructor(opts) {
    mod_assert.ok(opts, "argument 'opts' cannot be null")
    mod_assert.ok(Array.isArray(opts), "argument 'opts' must be an array")
    mod_assert.ok(opts.length > 0, "argument 'opts' cannot be empty")
    
    this.homeworks = opts
  }
    
  batch(cb) {
    mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function!")	
    
    mod_async.map(this.homeworks, this.seekBestDeal, (err, data) => {
      if (err) return cb(err)
      this.opportunities  = data.flat()
      cb(null, data.flat())
    })
   }
  
  seekBestDeal(homework, cb) {
    mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function!")	
    mod_assert.ok(typeof homework === 'object' && homework !== null, "argument 'opts' cannot be null")
    mod_assert.ok(typeof homework.fixture_id === 'number' && homework.fixture_id !== null, "argument 'opts.number' cannot be null")
    mod_assert.ok(typeof homework.bookmaker_id === 'number' && homework.bookmaker_id !== null, "argument 'opts.bookmaker_id' cannot be null")
    mod_assert.ok(homework.home_odds, "argument 'opts.home_odds' cannot be null")
    mod_assert.ok(typeof homework.home_odds === 'number', "argument 'opts.home_odds' must be a number")
    mod_assert.ok(homework.away_odds, "argument 'opts.away_odds' cannot be null")
    mod_assert.ok(typeof homework.away_odds === 'number', "argument 'opts.away_odds' cannot be null")
    mod_assert.ok(typeof homework.diff_market_cap === 'number', "argument 'opts.diff_market_cap' must be a number")
    mod_assert.ok(typeof homework.favorite === 'number', "argument 'opts.favorite' must be a number")
    mod_assert.ok(typeof homework.favorite_market_cap === 'number', "argument 'opts.favorite_market_cap' must be a number")
    mod_assert.ok(typeof homework.underdog === 'number', "argument 'opts.underdog' must be a number")
    mod_assert.ok(typeof homework.underdog_market_cap === 'number', "argument 'opts.underdog_market_cap' must be a number")
    
    if (homework.diff_market_cap >= 250) {
      if (isUnderdogPlayingAway(homework)) {
        return cb(null, [
          {
            fixture_id: homework.fixture_id,
            strategy_id: 2,
          },
          {
            fixture_id: homework.fixture_id,
            strategy_id: 4,
          }
        ])
      } else {
        return cb(null, [
          {
            fixture_id: homework.fixture_id,
            strategy_id: 1,
          },
          {
            fixture_id: homework.fixture_id,
            strategy_id: 3,
          }
        ])
      }
    }
    
    if (homework.diff_market_cap >= 170) {
      if (isUnderdogPlayingAway(homework)) {
        return cb(null, [
          {
            fixture_id: homework.fixture_id,
            strategy_id: 5,
          },
          {
            fixture_id: homework.fixture_id,
            strategy_id: 7,
          }
        ])
      } else {
        return cb(null, [
          {
            fixture_id: homework.fixture_id,
            strategy_id: 6,
          },
        ])
      }
    }
        
    if (isDiffMinor20(homework.favorite_market_cap, homework.underdog_market_cap)) {      
      const greater_odds = (homework.home_odds > homework.away_odds) ? homework.home_odds : homework.away_odds
      const lower_odds = (homework.home_odds < homework.away_odds) ? homework.home_odds : homework.away_odds
      
      if (!isDiffMinor20(greater_odds, lower_odds)) {
        return cb(null, {
          fixture_id: homework.fixture_id,
          strategy_id: 8
        })
      }
    }
    
    //NO STRATEGY FOUND!
    return cb (null, {
      fixture_id: homework.fixture_id,
      strategy_id: 9
    })
  }
}

/**
 * Module exports
 * @public
 */
module.exports = DealSeeker
