'use strict'

/**
 * Module dependencies
 * @private
 *
 */
const mod_async = require('async')
const assert = require('assert').strict
const mysql = require('mysql2')  
const propertiesReader = require('properties-reader')
const properties = propertiesReader('properties.file')

/**
 * Module variables
 * @private
 */
const WScrapper = require('../src/components/WScrapper')
const footballAPi = require('../src/services/footballAPi.js')
const knex = require('../src/knex.js')
const pool = mysql.createPool({
  connectionLimit: properties.get('mysql.connectionLimit'),
  host: properties.get('mysql.host'),
  port: properties.get('mysql.port'),
  user: properties.get('mysql.user'),
  password: properties.get('mysql.password'),
  database: properties.get('mysql.database')
})

/**
 * Main
 */
class Utils {
  constructor() {

  }

  isMySQLUp(cb) {
    mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function!")
    mod_assert.ok(typeof pool === 'object' && pool !== null, "'pool' must be an object")

    pool.getConnection((err, conn) => {
      if (err) 
        return cb(err)

      return cb(null, true)
    })
  }

  isDatabaseExists(cb) {
    mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function!")
    mod_assert.ok(typeof pool === 'object' && pool !== null, "'pool' must be an object")

    pool.query(`select schema_name from information_schema.schemata where schema_name = '${properties.get('mysql.database')}';`, (err, rows) => {
      if (err) 
        return cb(err)

      if (rows.length === 0) 
        return cb(null, false)

      return cb(null, true)
    })
  }

  isTableEmpty (opts = {}, cb) {
    mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function!")
    mod_assert.ok(typeof pool === 'object' && pool !== null, "'pool' must be an object")
    mod_assert.ok(typeof opts === 'object' && opts !== null, "arguments 'opts' must be an object")
    mod_assert.ok(typeof opts.table === 'string' && opts.table !== null, "arguments 'opts.table' must be a string")

    pool.query(`select * from ${opts.table};`, (err, rows) => {
      if (err) 
        return cb(err)

      if (rows.length === 0) 
        return cb(null, true)

      return cb(null, false)
    })
  }
  
  populatedLeagueTable (cb) {
    mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function!")
		
    /**
     * Following domestic league, will be running in the tool:
     * - English Premier League
     * - Spanish LaLiga
     * - Italian Serie A
     * - German Bundesliga
     * - French Ligue 1
     * - Dutch Eredivisie
     * - Belgian Pro League
     * - Portuguese Primeira Liga
     * - Turkish Süper Lig
     * - Brazilian Serie A
     * - Argentine Primera Division
     * - EFL Championship (second tier)
     */
    
    // Mandatory, adjustements made to be able to merge two datasets differents.
    const extraLeagueInformations = [
      {
        name: 'Premier League',
        league_id : 39,
        filter: {
          continent: 'UEFA',
					country: 'England'
        }
      },
      {
        name: 'LaLiga',
        league_id : 140,
        filter: {
          continent: 'UEFA',
					country: 'Spain'
        }
      },
      {
        name: 'Serie A',
        league_id : 135,
        filter: {
          continent: 'UEFA'
					country: 'Italy'
        }
      },
      {
        name: 'Bundesliga',
        league_id : 78,
        filter: {
          continent: 'UEFA',
					country: 'Germany'
        }
      },
      {
        name: 'Ligue 1',
        league_id : 0,
        filter: {
          continent: 'UEFA',
					country: 'France'
        }
      },
      {
        name: 'Eredivisie',
        league_id : 88,
        filter: {
          continent: 'UEFA',
					country: 'Netherlands'
        }
      },
      {
        name: 'Jupiler Pro League',
        league_id : 144,
        filter: {
          continent: 'UEFA',
					country: 'Belgium'
        }
      },
      {
        name: 'Liga NOS',
        league_id : 94,
        filter: {
          continent: 'UEFA',
					country: 'Portugal'
        }
      },
      {
        name: 'Süper Lig',
        league_id : 0,
        filter: {
          continent: 'UEFA',
					country: 'Turkey'
        }
      },
      {
        name: 'Campeonato Brasileiro Serie A',
        league_id : 71,
        filter: {
          continent: 'CONMEBOL',
					country: 'Brazil'
        }
      },
      {
        name: 'Copa de la Liga Profesional de Fútbol',
        league_id : 128,
        filter: {
          continent: 'CONMEBOL',
					country: 'Argentina'
        }
      },
      {
        name: 'Championship',
        league_id : 40,
        filter: {
          continent: 'UEFA',
					country: 'England'
        }
      }
    ]
		
		mod_async.map(extraLeagueInformations, WScrapper.parseLeague, (err, leagues) => {
			if (err) return cb(err)
			(async () => {
				try {
					const insertedRows = await knex('LEAGUE').insert(leagues)
					return cb(null)
				} catch (err) {
					return cb(err)
				}
			})().catch(err => {
				return cb(err)
			})
		})
  }
	
	populatedTeamTable (opts, cb) {
    mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function!")	
    mod_assert.ok(typeof opts === 'object' && opts !== null, "arguments 'opts' must be an object") 
    mod_assert.ok(typeof opts.url_teams === 'string' && opts !== null, "arguments 'opts.url_teams' must be a string")
    mod_assert.ok(typeof opts.league_id === 'number' && opts !== null, "arguments 'opts.number' must be a number")

    WScrapper.parseTeam(opts, (err, teams) => {
      if (err)
        return cb(err)
				
			mod_async.map(teams, footballAPi.setTeamId, function(err, teams) {
				if (err) return cb(err)
        (async () => {
          try {
					  const insertedRows = await knex('TEAM').insert(teams)
					  return cb(null)
				  } catch (err) {
					  return cb(err)
          }
        })().catch(err => {
				  return cb(err)
			  })
			})
    })
	}

  populatedPlayer (opts, cb) {
    mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function!")	
    mod_assert.ok(typeof opts === 'object' && opts !== null, "arguments 'opts' must be an object") 
    mod_assert.ok(typeof opts.team_id === 'string' && opts !== null, "arguments 'opts.team_id' must be a string")
    mod_assert.ok(typeof opts.url_players === 'string' && opts !== null, "arguments 'opts.url_players' must be a string")
		
		mod_async.map(opts, WScrapper.parsePlayer, (err, players) => {
			if (err) return cb(err)
			(async () => {
				try {
					const insertedRows = await knex('PLAYER').insert(players)
					return cb(null)
				} catch (err) {
					return cb(err)
				}
			})().catch(err => {
				return cb(err)
			})
		})
  }
}

module.exports = new Utils()
