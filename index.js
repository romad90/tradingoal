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
const knex = require('./src/knex.js')
const WScrapper = require('./src/components/WScrapper')

/**
 * Main
 */
mod_async.series([
	mod_async.apply(WScrapper.parseLeague, {name: 'Premier League'}),
  mod_async.apply(WScrapper.parseTeam, {url_teams:'/premier-league/startseite/wettbewerb/GB1'}),
  mod_async.apply(WScrapper.parsePlayer, {url_players: '/manchester-city/startseite/verein/281/saison_id/2020'}),
	(cb) => {
		(async () => {
			const leagues = [
				{
					league_id: 7898,
					league_name: 'Premyer Liqa',
					country: 'Azerbaijan',
					url_flag_country: 'https://tmssl.akamaized.net/images/flagge/verysmall/13.png?lm=1520611569',
					clubs: '8',
					players: '199',
					total_market_value: 55.73,
					total_market_value_unit: 'm',
					total_market_value_currency: '€',
					mean_market_value: 6.97,
					mean_market_value_unit: 'm',
					mean_market_value_currency: '€',
					continent: 'UEFA',
					url_teams: '/premyer-liqasi/startseite/wettbewerb/AZ1',
					url_logo: 'https://tmssl.akamaized.net/images/logo/mediumsmall/az1.png?lm=1608210628'
				}
	    ]
			try {
				const insertedRows = await knex('LEAGUE').insert(leagues)
				return cb(null, 'data inserted.')
			} catch (err) {
				return cb(err)
			}
		})().catch(err => {
			return cb(err)
		})
	},
	(cb) => {
		(async () => {
			try {
				const selectedRows = await knex('LEAGUE').select('*')
				return cb(null, selectedRows)
			} catch (err) {
				return cb(err)
			}
		})().catch(err => {
			return cb(err)
		})	
	},
	(cb) => {
		(async () => {
			try {
				const selectedRows = await knex.raw('TRUNCATE TABLE LEAGUE')
				return cb(null, 'table LEAGUE truncated.')
			} catch (err) {
				return cb(err)
			}
		})().catch(err => {
			return cb(err)
		})
	}
], (err, results) => {
    if (err) throw err
    console.log(results)
})
