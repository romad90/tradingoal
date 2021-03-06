'use strict'

/**
 * Module dependencies 
 * @private
 */
const mod_async = require('async')
const mod_axios = require('axios')
const mod_fs = require('fs')
const mod_moment = require('moment')

/**
 * Modules variables
 * @private
 */
const knex = require('../src/knex.js')
const WScrapper = require('../src/components/WScrapper')
const footballAPi = require('../src/services/footballAPi.js')

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
  */
	/*
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
	},*/
  
  //america-futebol-clube-mg-/startseite/verein/2863/saison_id/2020
  //https://www.transfermarkt.com/cuiaba-ec-mt-/startseite/verein/28022/saison_id/2020
  /*
  mod_async.apply(WScrapper.parsePlayer, {
      league_id: 71,
      country: 'Brazil',
      team_id: 125,
      name: 'América Futebol Clube (MG)',
      short_name: 'America Mineiro',
      total_market_value: 12.9,
      total_market_value_unit: 'm',
      total_market_value_currency: '€',
      average_market_value: 331,
      average_market_value_unit: 'th',
      average_market_value_currency: '€',
      url_logo: 'https://tmssl.akamaized.net/images/wappen/tiny/2863.png?lm=1419949367',
      url_players: '/cuiaba-ec-mt-/startseite/verein/28022/saison_id/2020'
    }),
  */
  /*
		(cb) => {
			footballAPi.getFixtureByDate({
				league: 71,
				date: '2021-06-06'
			}, (err, fixtures) => {
				if (err) return cb(err)
				mod_async.map(fixtures, function(_, done) {
					return done(null, {
						fixture_id:_.fixture.id,
						date_fixture: _.fixture.date,
						home_team:_.teams.home.id,
						away_team:_.teams.away.id,
						league_id:_.league.id,
						status: 'pending'
					})
				}, function(err, fixtures) {
					if (err) return cb(err)
					knex('FIXTURE')
						.insert(fixtures)
						.then(cb)
				  	.catch(console.error)	
				})
			})
		},
    */
		/*
		(cb) => {
			const reliabilities = [
				{
					league_id: 39,
					reduction: 1
				},
				{
					league_id: 140,
					reduction: 2
				},
				{
					league_id: 135,
					reduction: 2
				},
				{
					league_id: 78,
					reduction: 1
				},
				{
					league_id: 61,
					reduction: 3
				},
				{
					league_id: 88,
					reduction: 4
				},
				{
					league_id: 144,
					reduction: 4
				},
				{
					league_id: 94,
					reduction: 3
				},
				{
					league_id: 203,
					reduction: 4
				},
				{
					league_id: 71,
					reduction: 3
				},
				{
					league_id: 128,
					reduction: 4
				},
				{
					league_id: 40,
					reduction: 3
				},
			]
				
			knex('RELIABILITY')
				.insert(reliabilities)
				.then(cb)
				  .catch(console.error)	
		},
	*/
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
  /*(cb) => {
    
    const options = {
      method: 'GET',
      url: 'https://v3.football.api-sports.io/teams',
      params: {
        league: 71,
        season: 2021
      },
      headers: {
        'x-rapidapi-host': 'v3.football.api-sports.io',
        'x-rapidapi-key': 'a9f6d46c4598107951d83d8aeb3f7d36'
      }
    }
	  
    mod_axios
		.request(options)
  	.then(response => {
    	response.data.response.forEach((_) => {
    	  console.log(_)
    	})
    	return cb(null)
  	})
		.catch(() => {})
  },
    */
    /*
	(cb) => {
		footballAPi.getFixtureByDate({
      season: 2021,
			league: 128,
			date: '2021-06-13'
		}, (err, fixtures) => {
			if (err) return cb(err)
        
			mod_async.map(fixtures, function(_, done) {
				console.log(_)
        done(null)
			}, function(err) {
				if (err) return cb(err)
				cb(null)
			})
		})
	},
    */
   (cb) => {
     const months = {
       'Jan': '01',
       'Feb': '02',
       'Mar': '03',
       'Apr': '04',
       'May': '05',
       'Jun': '06',
       'Jul': '07',
       'Aug': '08',
       'Sep': '09',
       'Oct': '10',
       'Nov': '11',
       'Dec': '12',
     }
     const match = 'Mar 2, 2000 (21)'.split(',')
     const first = match[0].split(' ')
     const month = months[first[0]]
     const day = first[1]
     
     console.log('--')
     //console.log(mod_moment(dt).format('MMM DD, YYYY'))
     console.log(month)
     console.log(day)
     console.log(match[1].match(/\b\d{4}\b/))

     /*
      const options = {
        method: 'GET',
        url: 'https://v3.football.api-sports.io/fixtures',
        params: {
          id: 688930,
          //bookmaker: 3
          //league: 71, 
          //season: 2021,
          //date: '2021-06-03',
        },
        headers: {
          'x-rapidapi-host': 'v3.football.api-sports.io',
          'x-rapidapi-key': 'a9f6d46c4598107951d83d8aeb3f7d36'
        }
      }
	  
      mod_axios
  		.request(options)
    	.then(response => {
        //console.log(response)
      	response.data.response.forEach((_) => {
      	  //console.log(_)
      	})
      	return cb(null)
    	})
  		.catch(() => {})
     */
    },
    /*
    (cb) => {
      const options = {
        method: 'GET',
        url: 'https://v3.football.api-sports.io/fixtures',
        params: {
          //id: 688920,
          //bookmaker: 3,
          league: 71, 
          season: 2021,
          date: '2021-06-13'
        },
        headers: {
          'x-rapidapi-host': 'v3.football.api-sports.io',
          'x-rapidapi-key': 'a9f6d46c4598107951d83d8aeb3f7d36'
        }
      }
      
      mod_axios
  		.request(options)
    	.then(response => {
        //console.log(response)
      	response.data.response.forEach((_) => {
      	  console.log(_)
      	})
      	return cb(null)
    	})
  		.catch(() => {})
    },
    */
    /*
    (cb) => {

       const options = {
         method: 'GET',
         url: 'https://v3.football.api-sports.io/teams',
         params: {
           //fixture: 688927,
           //team:134
           //bookmaker: 3
           league: 128, 
           season: 2021,
           //date: '2021-06-03',
         },
         headers: {
           'x-rapidapi-host': 'v3.football.api-sports.io',
           'x-rapidapi-key': 'a9f6d46c4598107951d83d8aeb3f7d36'
         }
       }
	  
       mod_axios
   		.request(options)
     	.then(response => {
         console.log(response)
       	response.data.response.forEach((_) => {
       	  console.log(_)
       	})
       	return cb(null)
     	})
   		.catch(() => {})
     }
    */
], (err, results) => {
    if (err) throw err
      console.log(results)
})
