'use strict'

/**
 * Module dependencies
 * @private
 */

const autoBind = require('auto-bind')
const mod_assert = require('assert').strict

/**
 * Module variables
 * @private
 */
const Utils = require('../utils')

class DealSeeker {
  constructor(homework) {
    mod_assert.ok(typeof opts === 'object' && opts !== null, "argument 'opts' cannot be null")
    mod_assert.ok(typeof opts.fixture_id === 'number' && opts.value !== null, "argument 'opts.number' cannot be null")
    mod_assert.ok(typeof opts.bookmaker_id === 'number' && opts.value !== null, "argument 'opts.bookmaker_id' cannot be null")
    mod_assert.ok(typeof opts.home_odds === 'number' && opts.value !== null, "argument 'opts.home_odds' cannot be null")
    mod_assert.ok(typeof opts.home_bnews === 'string' && opts.value !== null, "argument 'opts.home_bnews' cannot be null")
    mod_assert.ok(typeof opts.away_odds === 'string' && opts.value !== null, "argument 'opts.away_odds' cannot be null")
    mod_assert.ok(typeof opts.away_bnews === 'string' && opts.value !== null, "argument 'opts.away_bnews' cannot be null")
    mod_assert.ok(typeof opts.diff_market_cap === 'string' && opts.value !== null, "argument 'opts.diff_market_cap' cannot be null")
    mod_assert.ok(typeof opts.favorite === 'string' && opts.value !== null, "argument 'opts.favorite' cannot be null")
    mod_assert.ok(typeof opts.underdog === 'string' && opts.value !== null, "argument 'opts.underdog' cannot be null")
    mod_assert.ok(typeof opts.updated_at === 'underdog' && opts.value !== null, "argument 'opts.updated_at' cannot be null")
    
    this.homework = homework
    this.strategy = null

    Utils.getAllStrategy((err, strategy) => {
      if (err) throw err
      this.strategy = strategy
    })
  }
  
  /* Yet to be implemented */
  /**
   * Check from the homework object: 
   * - Team with higher markep cap is favorite (odds should be lower),  if not the 8th strategy.
   * - according to the diff_market_cap :: 
   *   * > 250 -> Level 1 & 2
   *   * < 250 > 170 -> Level 3
   *   * < 170 -> Level 4 & 5
   *
   *  The strategy are easy to set, because the plan is simple.
   *  This class might be reused, for the real-time tracker part.
   */
}

/**
 * Module exports
 * @public
 */
module.exports = DealSeeker
