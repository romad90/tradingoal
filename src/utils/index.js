'use strict'

/**
 * Module dependencies
 * @private
 *
 */
const autoBind = require('auto-bind')
const mod_async = require('async')
const mod_assert = require('assert').strict
const mysql = require('mysql2')  
const config = require('config')

/**
 * Module variables
 * @private
 */
const MIN = 2500
const MAX = 8000
const WScrapper = require('../components/WScrapper')
const footballAPi = require('../services/footballAPi.js')
const knex = require('../knex.js')
const pool = mysql.createPool({
  connectionLimit: config.get('mysql.connectionLimit'),
  host: config.get('mysql.host'),
  port: config.get('mysql.port'),
  user: config.get('mysql.user'),
  password: config.get('mysql.password'),
  database: config.get('mysql.database')
})
function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}

/**
 * Main
 */
class Utils {
  constructor() {
     autoBind(this)
  }

  isMySQLUp(cb) {
    mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function!")
    mod_assert.ok(typeof pool === 'object' && pool !== null, "'pool' must be an object")

    pool.getConnection((err, conn) => {
      if (err) return cb(err)
      cb(null)
    })
  }

  isDatabaseExists(cb) {
    mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function!")
    mod_assert.ok(typeof pool === 'object' && pool !== null, "'pool' must be an object")

    pool.query(`select schema_name from information_schema.schemata where schema_name = '${config.get('mysql.database')}';`, (err, rows) => {
      if (err) return cb(err)
      if (rows.length === 0) return cb(null, false)
      cb(null, true)
    })
  }

  isTableEmpty (opts = {}, cb) {
    mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function!")
    mod_assert.ok(typeof pool === 'object' && pool !== null, "'pool' must be an object")
    mod_assert.ok(typeof opts === 'object' && opts !== null, "arguments 'opts' must be an object")
    mod_assert.ok(typeof opts.table === 'string' && opts.table !== null, "arguments 'opts.table' must be a string")

    pool.query(`select * from ${opts.table};`, (err, rows) => {
      if (err) return cb(err)
      if (rows.length === 0) return cb(null, true)
      cb(null, false)
    })
  }
  
  populatedLeagueTable (opts, cb) {
    mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function!")
		
		let extraLeagueInformations = []
    const _ = JSON.parse(JSON.stringify(config.get('leagues')))
		
		if (!opts) {
			/**
			 * By default, all pre-listed leagues will be there.
			 */
			Object.entries(_).forEach(([key, value]) => {
				extraLeagueInformations = extraLeagueInformations.concat(_[key])
			})
		} else {
			if (!_[opts]) 
				return cb (Error(`country: [${opts}] does not exist`))
			extraLeagueInformations = extraLeagueInformations.concat(_[opts])
		}
		
		mod_async.map(extraLeagueInformations, (_, done) => {
			setTimeout(function(){
				WScrapper.parseLeague(_, done)
			}, randomIntFromInterval(MIN, MAX))
		}, (err, raw) => {
			if (err) return cb(err)
			const leagues = raw.flat()
			knex('LEAGUE')
				.insert(leagues)
				.then(() => {
					return cb(null, leagues)
				})
      .catch(() => {})	
		})
  }
	
	populatedTeamTable (opts, cb) {
    mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function!")	
    mod_assert.ok(typeof opts === 'object' && opts !== null, "arguments 'opts' must be an object") 
    mod_assert.ok(typeof opts.url_teams === 'string' && opts !== null, "arguments 'opts.url_teams' must be a string")
    mod_assert.ok(typeof opts.league_id === 'number' && opts !== null, "arguments 'opts.number' must be a number")

    WScrapper.parseTeam(opts, (err, teams) => {
      if (err) return cb(err)
				
			mod_async.map(teams, (_, done) => {
				setTimeout(function(){
					footballAPi.setTeamId(_, done)
				}, randomIntFromInterval(MIN, MAX))
			}, function(err, teams) {
				if (err) return cb(err)
				knex('TEAM')
					.insert(teams)
					.then(() => {
						return cb(null, teams)
					})
        .catch(() => {})	
			})
    })
	}

  populatedPlayer (opts, cb) {
    mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function!")	
    mod_assert.ok(typeof opts === 'object' && opts !== null, "arguments 'opts' must be an object") 
    mod_assert.ok(typeof opts.team_id === 'number' && opts !== null, "arguments 'opts.team_id' must be a number")
    mod_assert.ok(typeof opts.url_players === 'string' && opts !== null, "arguments 'opts.url_players' must be a string")
		
		setTimeout(function(){
			WScrapper.parsePlayer(opts, (err, players) => {
			  if (err) return cb(err)
			  knex('PLAYER')
				  .insert(players)
				  .then(() => {
					  return cb(null, players)
				})
        .catch(() => {})
			})
		}, randomIntFromInterval(MIN, MAX))  
  }
  
  getLeagueAvailable(cb) {
    mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function!")	
    
	  knex('LEAGUE')
    .select('*')
	  .then((leagues) => {
	    return cb(null, leagues)
	  })
    .catch(() => {})
  }
  
  getTeamNumberByLeagueId(opts, cb) {
    mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function!")	
    mod_assert.ok(typeof opts === 'object' && opts !== null, "arguments 'opts' must be an object") 
    mod_assert.ok(typeof opts.league_id === 'number' && opts !== null, "arguments 'opts.league_id' must be a number")
    
    knex('TEAM')
	  .select('*')
    .where({league_id: opts.league_id})
	  .then((teams) => {
		  return cb(null, teams.length)
    })
    .catch(() => {})
  }
  
  getPlayerNumberByLeagueId(opts, cb) {
    mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function!")	
    mod_assert.ok(typeof opts === 'object' && opts !== null, "arguments 'opts' must be an object") 
    mod_assert.ok(typeof opts.league_id === 'number' && opts !== null, "arguments 'opts.league_id' must be a number")
    
    knex.from('PLAYER')
    .innerJoin('TEAM', 'TEAM.team_id', 'PLAYER.team_id')
    .where('TEAM.league_id', opts.league_id)
	  .then((players) => {
		  return cb(null, players.length)
    })
    .catch(() => {})
  }
  
  getThresholdByLeagueId(opts, cb) {
    mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function!")	
    mod_assert.ok(typeof opts === 'object' && opts !== null, "arguments 'opts' must be an object") 
    mod_assert.ok(typeof opts.league_id === 'number' && opts !== null, "arguments 'opts.league_id' must be a number")
        
    mod_async.parallel([
      mod_async.apply(this.getTeamNumberByLeagueId, opts),
      mod_async.apply(this.getPlayerNumberByLeagueId, opts)
    ], (err, results) => {
      if (err) return cb(err)
      const [number_teams, number_players] = results
      const number_teams_expected = config.get('threshold')[opts.league_id].number_teams_expected || 'undefined'
      const number_players_expected = config.get('threshold')[opts.league_id].number_players_expected || 'undefined'
        
      return cb(null, {
        [opts.league_id]: {
          name: opts.league_name,
          country: opts.country,
          current: {
            number_teams,
            number_players
          },
          expected: {
            number_teams: number_teams_expected,
            number_players:number_players_expected
          }
        }
      })  
    })
  }
  
  prepFixture(opts) {
    mod_assert.ok(typeof opts === 'object' && opts !== null, "arguments 'opts' must be an object")
    mod_assert.ok(typeof opts.league.id === 'number' && opts !== null, "arguments 'opts.league_id' must be a number") 
    mod_assert.ok(typeof opts.fixture.id === 'number' && opts !== null, "arguments 'opts.fixture.id' must be a number")
    mod_assert.ok(typeof opts.fixture.date === 'string' && opts !== null, "arguments 'opts.fixture.date' must be a string")
    mod_assert.ok(typeof opts.fixture.timezone === 'string' && opts !== null, "arguments 'opts.fixture.timezone' must be a string")
    mod_assert.ok(typeof opts.teams.home.id === 'number' && opts !== null, "arguments 'opts.teams.home.id' must be a number")
    mod_assert.ok(typeof opts.teams.away.id === 'number' && opts !== null, "arguments 'opts.teams.away.id' must be a number")
        
    return {
      league_id: opts.league.id,
      fixture_id: opts.fixture.id,
      date_fixture: opts.fixture.date,
      timezone: opts.fixture.timezone,
      home_team: opts.teams.home.id,
      away_team: opts.teams.away.id,
      status: 'pending'
    }
  }
}

module.exports = new Utils()
