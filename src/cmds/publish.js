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

const reFormatDataSet = (opts, cb) => {
  const actions = []
  opts.opportunities.forEach((opp) => {
    let _
    if (opp.trade === 'LAY' && opp.underdog_type.includes('UND')) {
      _ = `LVL ${opp.level}, ${opp.trade} ${opts.udg_short_name} <= ${opp.underdog_odd}`
      
    } else if (opp.trade === 'LAY' && opp.underdog_type.includes('WRONG FAV')){
      _ = `LVL ${opp.level}, ${opp.trade} ${opts.fav_short_name}, wrong princing, PRE-MATCH or inplay according events`
      
    } else  if (opp.trade === 'BACK') {
      //_ = `LVL ${opp.level}, ${opp.trade} ${opts.fav_short_name} ~ 1.9, according events`
      _ = 'Still to be defined'
      
    } else {
      _ = `No value`
    }
    actions.push(_)
  })
  
  return cb(null, {
    'date_fixture': opts.fx_date_fixture,
    'league_name': opts.lea_league_name,
    'continent': opts.lea_continent,
    'flag_country': opts.lea_url_flag_country,
    'round': opts.fx_round,
    'bookmaker': opts.hk_bookmaker_id,
    'home': opts.hom_short_name,
    'odds':opts.hk_home_odds,
    'home_bnews': opts.hk_home_bnews,
    'away': opts.away_short_name,
    'odds':opts.hk_away_odds,
    'away_bnews': opts.hk_away_bnews,
    'fav':opts.fav_short_name,
    'fav_market_cap': opts.hk_favorite_market_cap,
    'udg': opts.udg_short_name,
    'udg_market_cap': opts.hk_underdog_market_cap,
    'diff_market_cap': opts.hk_diff_market_cap,
    'actions': actions
  })
}


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
      mod_async.map(_, (opts, cb) => {
        Utils.getOpportunity(opts, (err, opportunities) => {
          if (err) return cb(err)     
          opts.opportunities = opportunities
          cb(null, opts) 
        })
      }, done)
    },
    (_, done) => {
      mod_async.map(_, reFormatDataSet, done)
    }
  ], (err, data) => {
    if (err) throw err
    console.log(data)
  })
}
