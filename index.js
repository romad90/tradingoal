'use strict'

/**
 * Module dependencies 
 * @private
 */
const mod_async = require('async')

/**
 * Modules variables
 * @private
 */
const WScrapper = require('./src/components/WScrapper')

/**
 * Main
 */
mod_async.parallel([
    mod_async.apply(WScrapper.parseLeague, {name: 'Premier League'}),
    //function(callback) { ... }
], (err, results) => {
    if (err) throw err
    console.log(results)
})
//WScrapper.parseTeam({url_teams:'/premier-league/startseite/wettbewerb/GB1'})
