'use strict'

/**
 * Module dependencies 
 * @private
 */
const mod_async = require('async')
const mod_axios = require('axios')
const mod_fs = require('fs')

/**
 * Modules variables
 * @private
 */
const knex = require('./src/knex.js')
const WScrapper = require('./src/components/WScrapper')
const footballAPi = require('./src/services/footballAPi.js')

/**
 * Main
 */
mod_async.series([
	/*
	mod_async.apply(
		WScrapper.parseLeague, {
			name: 'Campeonato Brasileiro Serie A',
			league_id : 71,
			filter: {
				continent: 'CONMEBOL',
				country: 'Brazil'
      }
		}
	),
	(cb) => {
		WScrapper.parseTeam({
      league_id: 71,
      league_name: 'Campeonato Brasileiro Série A',
      country: 'Brazil',
      url_flag_country: 'https://tmssl.akamaized.net/images/flagge/verysmall/26.png?lm=1520611569',
      clubs: '20',
      players: '740',
      total_market_value: 1.1,
      total_market_value_unit: 'bn',
      total_market_value_currency: '€',
      mean_market_value: 55.06,
      mean_market_value_unit: 'm',
      mean_market_value_currency: '€',
      continent: 'CONMEBOL',
      url_teams: '/campeonato-brasileiro-serie-a/startseite/wettbewerb/BRA1',
      url_logo: 'https://tmssl.akamaized.net/images/logo/mediumsmall/bra1.png?lm=1501485979'
    }, (err, teams) => {
    	if (err) return cb(err)
			mod_async.map(teams, footballAPi.setTeamId, function(err, teams) {
				if (err) return cb(err)
					return cb(null, teams)
			})
    })
	},
  mod_async.apply(WScrapper.parsePlayer, {
      league_id: 71,
      country: 'Brazil',
      team_id: 121,
      name: 'Sociedade Esportiva Palmeiras',
      short_name: 'Palmeiras',
      total_market_value: 145.05,
      total_market_value_unit: 'm',
      total_market_value_currency: '€',
      average_market_value: 3.92,
      average_market_value_unit: 'm',
      average_market_value_currency: '€',
      url_logo: 'https://tmssl.akamaized.net/images/wappen/tiny/1023.png?lm=1411204983',
      url_players: '/se-palmeiras-sao-paulo/startseite/verein/1023/saison_id/2020'
    }),
		*/
		(cb) => {
			//get("https://v3.football.api-sports.io/fixtures?next=15");
			return cb(null, 'A')
		},
	/*
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
	},
	*/
	//mod_async.apply(footballAPi.searchTeamByName, {name:'Ceara'})
], (err, results) => {
    if (err) throw err
    console.log(results)
})
