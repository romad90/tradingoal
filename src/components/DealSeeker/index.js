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
const Utils = require('../utils')
const knex = require('knex')
const DIFFERENCE = 15

const isMarketCapsAlike = (greater, lower)  => {
    mod_assert.ok(typeof greater === 'number' && greater !== null, "argument 'greater' cannot be null")
    mod_assert.ok(typeof lower === 'number' && greater !== null, "argument 'lower' cannot be null")
    
    return (DIFFERENCE + ((lower * 100) / greater)) >= 100
}

const isUnderdogPlayingAway = (homework) => {
    mod_assert.ok(typeof homework === 'object' && homework !== null, "argument 'opts' cannot be null")
    mod_assert.ok(typeof homework.home_odds === 'number' && homework.home_odds !== null, "argument 'opts.home_odds' cannot be null")
    mod_assert.ok(typeof homework.away_odds === 'string' && homework.away_odds !== null, "argument 'opts.away_odds' cannot be null")
  
  return homework.home_odds < homework.away_odds
}

class DealSeeker {
  constructor(opts) {
    mod_assert.ok(opts, "argument 'opts' cannot be null")
    mod_assert.ok(Array.isArray(opts), "argument 'opts' must be an array")
    mod_assert.ok(opts.length > 0, "argument 'opts' cannot be empty")
    
    this.homeworks = opts
    this.opportunities = []
  }
  
  save(cb) {
    if (this.opportunities.length === 0) return cb(new Error('No opportunities found'))
    
    mod_async.map(this.opportunities, (_, done) => {
      knex('OPPORTUNITY')
        .where('fixture_id', _.fixture_id)
		    .delete()
		    .then(() => {
			    
  			  knex('OPPORTUNITY')
  				  .insert(_)
  				  .then(() => {
  					  return cb(null)
  				  })
            .catch(cb)	  
		    })
        .catch(cb)
    }, (err, data) => {
      if (err) return cb(err)
      this.opportunities  = data.flat()
      cb(null)
    })  	
  }
  
  batch(cb) {
    mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function!")	
    
    mod_async.map(this.homeworks, this.seekBestDeal, (err, data) => {
      if (err) return cb(err)
      this.opportunities  = data.flat()
      cb(null)
    })
   }
  
  seekBestDeal(homework, cb) {
    mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function!")	
    mod_assert.ok(typeof homework === 'object' && homework !== null, "argument 'opts' cannot be null")
    mod_assert.ok(typeof homework.fixture_id === 'number' && homework.fixture_id !== null, "argument 'opts.number' cannot be null")
    mod_assert.ok(typeof homework.bookmaker_id === 'number' && homework.bookmaker_id !== null, "argument 'opts.bookmaker_id' cannot be null")
    mod_assert.ok(typeof homework.home_odds === 'number' && homework.home_odds !== null, "argument 'opts.home_odds' cannot be null")
    mod_assert.ok(typeof homework.away_odds === 'string' && homework.away_odds !== null, "argument 'opts.away_odds' cannot be null")
    mod_assert.ok(typeof homework.diff_market_cap === 'string' && homework.diff_market_cap !== null, "argument 'opts.diff_market_cap' cannot be null")
    mod_assert.ok(typeof homework.favorite === 'string' && homework.favorite !== null, "argument 'opts.favorite' cannot be null")
    mod_assert.ok(typeof homework.favorite_market_cap === 'string' && homework.favorite_market_cap !== null, "argument 'opts.favorite_market_cap' cannot be null")
    mod_assert.ok(typeof homework.underdog === 'string' && homework.underdog !== null, "argument 'opts.underdog' cannot be null")
    mod_assert.ok(typeof homework.underdog_market_cap === 'string' && homework.underdog_market_cap !== null, "argument 'opts.underdog_market_cap' cannot be null")
    
    //Wrong Princing
    if (!homework.favorite_market_cap > homework.underdog_market_cap) {
      return cb(null, {
        fixture_id: homework.fixture_id
        strategy_id: 8
      })
    }
    
    if (homework.diff_market_cap >= 250) {
      if (isUnderdogPlayingAway(homework)) {
        return cb(null, [
          {
            fixture_id: homework.fixture_id
            strategy_id: 2,
          },
          {
            fixture_id: homework.fixture_id
            strategy_id: 4,
          }
        ])
      } else {
        return cb(null, [
          {
            fixture_id: homework.fixture_id
            strategy_id: 1,
          },
          {
            fixture_id: homework.fixture_id
            strategy_id: 3,
          }
        ])
      }
    }
    
    if (homework.diff_market_cap >= 170) {
      if (isUnderdogPlayingAway(homework)) {
        return cb(null, [
          {
            fixture_id: homework.fixture_id
            strategy_id: 5,
          },
          {
            fixture_id: homework.fixture_id
            strategy_id: 7,
          }
        ])
      } else {
        return cb(null, [
          {
            fixture_id: homework.fixture_id
            strategy_id: 6,
          },
        ])
      }
    }
    
    //Nothing todo ...
    return cb (null, {
      fixture_id: homework.fixture_id
      strategy_id: 9
    })
  }
}

/**
 * Module exports
 * @public
 */
module.exports = DealSeeker