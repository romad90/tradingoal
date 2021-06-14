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
const randomIntFromInterval = (min, max) => {
    mod_assert.ok(typeof min === 'number', "argument 'min' must be a number")
    mod_assert.ok(typeof max === 'number', "argument 'max' must be a number")
  return Math.floor(Math.random() * (max - min + 1) + min)
}
const getPctMarketCapValue = function getPctMarketCapValue (total_market_value, market_value_player) {
    mod_assert.ok(typeof total_market_value === 'number', "argument 'total_market_value' must be a number")
    mod_assert.ok(total_market_value !== null, "total_market_value cannot be null")
    mod_assert.ok(typeof market_value_player === 'number', "argument 'market_value_player' must be a number")
    mod_assert.ok(market_value_player !== null, "market_value_player cannot be null")
    
    return 100 * market_value_player / total_market_value
}

const getPctTeamMarketDiff = function getPctTeamMarketDiff (higher_market_value, lower_market_value) {
    mod_assert.ok(typeof higher_market_value === 'number', "argument 'higher_market_value' must be a number")
    mod_assert.ok(higher_market_value !== null, "higher_market_value cannot be null")
    mod_assert.ok(typeof lower_market_value === 'number', "argument 'lower_market_value' must be a number")
    mod_assert.ok(lower_market_value !== null, "lower_market_value cannot be null")
    
    return 100 * higher_market_value / lower_market_value
}

function comparer(otherArray){
  return function(current){
    return otherArray.filter(function(other){
      return other.number == current.number
    }).length == 0;
  }
}

/**
 * Module Manage transactions over MySQL data.
 * @module Utils
 */
class Utils {
  
  /**
   * constructor 
   */
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
  
  populatedLeagueTable (opts, cb) {
    mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function!")
		
		let extraLeagueInformations = []
    const _ = JSON.parse(JSON.stringify(config.get('leagues')))
		
		if (!opts) {
			/**
			 * By default, all pre-listed leagues will be there, but no recommended.
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
        .onConflict('league_id', 'league_name')
        .merge()
				.then(() => {
					return cb(null, leagues)
				})
      .catch((error) => {
        mod_assert.fail(error,'Promise error')
      })	
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
					footballAPi.setExtraTeamInfos(_, done)
				}, randomIntFromInterval(MIN, MAX))
			}, function(err, teams) {
				if (err) return cb(err)
				knex('TEAM')
					.insert(teams)
          .onConflict('team_id', 'short_name', 'league_id')
          .merge()
					.then(() => {
						return cb(null, teams)
					})
        .catch((error) => {
          mod_assert.fail(error,'Promise error')
        })	
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
          .onConflict('team_id', 'short_name', 'birth_date')
          .merge()
				  .then(() => {
					  return cb(null, players)
				})
        .catch((error) => {
          mod_assert.fail(error,'Promise error')
        })
			})
		}, randomIntFromInterval(MIN, MAX))  
  }
  
  // TODO: yet to inspect and adjust
  searchPlayerByName(opts, cb) {
    mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function!")	
    mod_assert.ok(typeof opts === 'object' && opts !== null, "arguments 'opts' must be an object") 
    mod_assert.ok(typeof opts.team_id === 'number', "arguments 'opts.team_id' must be a number")
    mod_assert.ok(typeof opts.name === 'string', "arguments 'opts.string' must be a string")
    
	  knex('PLAYER')
    .where('name', 'like', `%${opts.name}%`)
    .andWhere('team_id', opts.team_id)
	  .then((_) => {
	    return cb(null, _)
	  })
    .catch((error) => {
      mod_assert.fail(error,'Promise error')
    })
  }
  
  getAllFixtures(cb) {
    mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function!") 
	  knex('FIXTURE')
	  .then((_) => {
	    return cb(null, _)
	  })
    .catch((error) => {
      mod_assert.fail(error,'Promise error')
    })
  }
  
  getAllFixtureNotStartedYet(cb) {
    mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function!")
     
	  knex('FIXTURE')
    .where('status', 'NS')
	  .then((_) => {
	    return cb(null, _)
	  })
    .catch((error) => {
      mod_assert.fail(error,'Promise error')
    })
  }
  
  getAllFixtureInPending(cb) {
    mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function!")
     
	  knex('FIXTURE')
    .whereNot('status', 'NS')
	  .then((_) => {
	    return cb(null, _)
	  })
    .catch((error) => {
      mod_assert.fail(error,'Promise error')
    })
  }
  
  updateFixtureStatus(opts, cb) {
    mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function!")
    mod_assert.ok(typeof opts === 'object' && opts !== null, "arguments 'opts' must be an object")
    mod_assert.ok(typeof opts.fixture_id === 'number' && opts !== null, "arguments 'opts.fixture_id' must be a number")
    mod_assert.ok(typeof opts.status === 'string' && opts !== null, "arguments 'opts.fixture_id' must be a number")
        
    knex('fixture')
      .where({fixture_id: opts.fixture_id})
      .update('status', opts.status)
	  .then((_) => {
	    return cb(null)
	  })
    .catch((error) => {
      mod_assert.fail(error,'Promise error')
    })
  }
  
  updateFixtureToInPending(opts, cb) {
    mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function!")
    mod_assert.ok(typeof opts === 'object' && opts !== null, "arguments 'opts' must be an object")
    mod_assert.ok(typeof opts.fixture_id === 'number' && opts !== null, "arguments 'opts.fixture_id' must be a number")
    
    knex('fixture')
      .where('fixture_id', '=', opts.fixture_id)
      .update({
        status: 'pending',
    })
	  .then((_) => {
	    return cb(null, _)
	  })
    .catch((error) => {
      mod_assert.fail(error,'Promise error')
    })
  }
  
  updateFixtureToFinished(opts, cb) {
    mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function!")
    mod_assert.ok(typeof opts === 'object' && opts !== null, "arguments 'opts' must be an object")
    mod_assert.ok(typeof opts === 'object' && opts !== null, "arguments 'opts' must be an object")
    
    knex('fixture')
      .where('fixture_id', '=', opts.fixture_id)
      .update({
        status: 'finished',
    })
	  .then((_) => {
	    return cb(null, _)
	  })
    .catch((error) => {
      mod_assert.fail(error,'Promise error')
    })
  }
  
  getPlayersByTeamId(opts, cb) {
    mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function!")
    mod_assert.ok(typeof opts === 'object' && opts !== null, "arguments 'opts' must be an object")
    mod_assert.ok(typeof opts.team_id === 'number' && opts !== null, "arguments 'opts.team_id' must be a number")
    
    knex('player')
      .where('team_id', '=', opts.team_id)
    .then((_) => {
      return cb(null, _)
    })
    .catch((error) => {
      mod_assert.fail(error,'Promise error')
    })
  }
  
  getFixtureById(opts, cb) {
    mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function!")
    mod_assert.ok(typeof opts === 'object' && opts !== null, "arguments 'opts' must be an object")
    mod_assert.ok(typeof opts.fixture_id === 'number' && opts !== null, "arguments 'opts.fixture_id' must be a number")
     
	  knex('FIXTURE')
    .where('fixture_id', opts.fixture_id)
	  .then((_) => {
	    return cb(null, _)
	  })
    .catch((error) => {
      mod_assert.fail(error,'Promise error')
    })
  }
  
  getLeagueAvailable(cb) {
    mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function!")	
    
	  knex('LEAGUE')
    .select('*')
	  .then((leagues) => {
	    return cb(null, leagues)
	  })
    .catch((error) => {
      mod_assert.fail(error,'Promise error')
    })
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
    .catch((error) => {
      mod_assert.fail(error,'Promise error')
    })
  }
  
  getTeamById(opts, cb) {
    mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function!")	
    mod_assert.ok(typeof opts === 'object' && opts !== null, "arguments 'opts' must be an object") 
    mod_assert.ok(typeof opts.team_id === 'number' && opts !== null, "arguments 'opts.team_id' must be a number")
    
    knex('TEAM')
    .where({team_id: opts.team_id})
	  .then((_) => {
		  return cb(null, _.pop())
    })
    .catch((error) => {
      mod_assert.fail(error,'Promise error')
    })
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
    .catch((error) => {
      mod_assert.fail(error,'Promise error')
    })
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
    mod_assert.ok(typeof opts.league.round === 'string' && opts !== null, "arguments 'opts.league.round' must be a string")
    
    return {
      league_id: opts.league.id,
      fixture_id: opts.fixture.id,
      date_fixture: opts.fixture.date,
      timezone: opts.fixture.timezone,
      home_team: opts.teams.home.id,
      away_team: opts.teams.away.id,
      status: opts.fixture.status.short,
      round: opts.league.round
    }
  }
  
  //TODO: yet to inspect and adjust
  reAdjustMarketCapTeam(opts, cb) {
    mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function!")
    mod_assert.ok(typeof opts === 'object' && opts !== null, "arguments 'opts' must be an object")
    mod_assert.ok(typeof opts.total_market_value === 'number' && opts.total_market_value !== null, "arguments 'opts.total_market_value' must be a number") 
    mod_assert.ok(Array.isArray(opts.bnews), "arguments 'opts.bnews' must be an array") 
    
    if (opts.bnews === 0) {
      return cb(null, opts) 
    }
    
    let total_missing_players_market_value = 0
    opts.bnews.forEach((_) => {
      if (_.market_value_unit === 'th') _.market_value = _.market_value /1000
      total_missing_players_market_value += _.market_value
    })
    
    opts.total_market_value = (opts.total_market_value - total_missing_players_market_value)
    opts.bnews = JSON.stringify(opts.bnews)
    
    return cb (null, opts)
  }
  
  preHomeworkPerTeam (opts, cb) {
    mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function!")	
    mod_assert.ok(typeof opts === 'object' && opts !== null, "arguments 'opts' must be an object")
    mod_assert.ok(typeof opts.fixture_id === 'number' && opts.fixture_id !== null, "arguments 'opts.fixture_id' must be a number") 
    mod_assert.ok(typeof opts.team_id === 'number' && opts.team_id !== null, "arguments 'opts.team_id' must be a number")
          
    mod_async.waterfall([
      mod_async.apply(this.getTeamById, opts),
      (_, done) => {
        opts.total_market_value = _.total_market_value
        done(null, opts)
      },
      (_, done) => {
        this.getPlayersByTeamId(opts, (err, players) => {
          if (err) return done(err)
          _.roster = players
          done(null, _)
        })
      },
      (_, done) => {
        footballAPi.getLineUpsByTeam(opts, (err, line_ups) => {
          if (err) return done(err)
          
          const listed = []
          line_ups.forEach((_) => {
            listed.push(_.player)
          })
          opts.listed = listed
          return done(null, _)
        })
      },
      (_, done) => {        
        _.bnews = _.roster.filter(({ number: id1 }) => !_.listed.some(({ number: id2 }) => id2 == id1))
        delete _.roster
        delete _.listed
        done(null, _)
      },
      this.reAdjustMarketCapTeam,
    ], (err, _) => {
      if (err) return cb(err)
      cb(null, _)
    }) 
  }
  
  prepHomework(teams, cb) {
    mod_assert.ok(Array.isArray(teams), "arguments 'teams' must be an object")
    mod_assert.ok(teams.length === 2, "arguments 'teams' must contain two items")
    mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function!")
    
    const fixture_id = teams[0].fixture_id
            
    footballAPi.getOddsByFixtureId({
      fixture_id: fixture_id
    }, (err, raw_odds) => {
      if (err) return cb(err)
      const [home_team, away_team] =  teams
      const homework = {
        fixture_id: home_team.fixture_id,
        diff_market_cap: (home_team.total_market_value > away_team.total_market_value) ? getPctTeamMarketDiff(home_team.total_market_value, away_team.total_market_value) : getPctTeamMarketDiff(away_team.total_market_value, home_team.total_market_value),
        updated_at: knex.fn.now()
      }      
      const [odds, referal_bookie_id] = raw_odds
      const [home_odds, away_odds] = odds
      if (odds) {
        const _home_odds = parseFloat(home_odds)
        const _away_odds = parseFloat(away_odds)
        
        homework.bookmaker_id = referal_bookie_id
        homework.home_odds = _home_odds
        homework.away_odds = _away_odds
        
        if (home_odds != 0 && away_odds != 0) {   
          homework.favorite = (_home_odds < _away_odds) ? home_team.team_id : away_team.team_id
          homework.favorite_market_cap = (_home_odds < _away_odds) ? home_team.total_market_value : away_team.total_market_value
          homework.underdog = (_home_odds < _away_odds) ? away_team.team_id : home_team.team_id
          homework.underdog_market_cap = (_home_odds < _away_odds) ? away_team.total_market_value : home_team.total_market_value
        }
      }
      if (home_team.bnews && home_team.bnews.length > 0) {
        homework.home_bnews = home_team.bnews
      }
      if (away_team.bnews && away_team.bnews.length > 0) {
        homework.away_bnews = away_team.bnews
      }
      return cb(null, homework)
    })
  }
  
  addHomework(homeworks, cb) {
    mod_assert.ok(Array.isArray(homeworks), "arguments 'teams' must be an object")
    mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function!")
    
    knex("HOMEWORK")
      .insert(homeworks)
      .onConflict("fixture_id")
      .merge()
    .then(_ => {
      return cb(null) 
    })
    .catch((error) => {
      mod_assert.fail(error,'Promise error')
    })
  }
  
  cleanPreviousOpportunity(opportunities, cb) {
    mod_assert.ok(Array.isArray(opportunities), "arguments 'teams' must be an object")
    mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function!")
    
    knex("OPPORTUNITY")
      .delete()
      .whereIn('fixture_id', 
        opportunities.reduce(function (newArr, opportunity) {
          newArr.push(opportunity.fixture_id)
          return newArr
        }, []
      ))
      .then(_ => {
        return cb(null, opportunities) 
      })
      .catch((error) => {
        mod_assert.fail(error,'Promise error')
      })
  }
  
  addOpportunity(opportunities, cb) {
    mod_assert.ok(Array.isArray(opportunities), "arguments 'teams' must be an object")
    mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function!")
    
    knex("OPPORTUNITY")
      .insert(opportunities)
    .then(_ => {
      return cb(null) 
    })
    .catch((error) => {
      mod_assert.fail(error,'Promise error')
    })
  }
  
  getHomeworksNotStartedYet(cb) {
    mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function")
    knex
      .select('*')
      .from('HOMEWORK')
      .join('FIXTURE', 'HOMEWORK.fixture_id', 'FIXTURE.fixture_id')
      .join('TEAM as FAV', 'HOMEWORK.favorite', 'FAV.team_id')
      .join('TEAM as UDG', 'HOMEWORK.underdog', 'UDG.team_id')
      .where('FIXTURE.status', '=', 'NS' )
      .andWhere('HOMEWORK.home_odds', '>', 0)
      .andWhere('HOMEWORK.away_odds', '>', 0)
	    .then((homeworks) => {
	      return cb(null, homeworks)
	    })
      .catch((error) => {
        mod_assert.fail(error,'Promise error')
      })
  }
  
  getDatasetToPublish(cb){
    mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function")
    
    knex
      .select(
        'LEA.league_name as lea_league_name',
        'REL.reduction',
        'LEA.country as lea_country',
        'LEA.url_flag_country as lea_url_flag_country',
        'LEA.continent as lea_continent',
        'LEA.url_logo as lea_url_logo',
        'HK.fixture_id as hk_fixture_id',
        'FIX.date_fixture as fx_date_fixture',
        'FIX.round as fx_round',
        'HOM.short_name as hom_short_name',
        'HOM.total_market_value as hom_raw_total_market_value',
        'AWA.short_name as away_short_name',
        'AWA.total_market_value as away_raw_total_market_value',
        'HK.bookmaker_id as hk_bookmaker_id',
        'HK.home_odds as hk_home_odds',
        'HK.home_bnews as hk_home_bnews',
        'HK.away_odds as hk_away_odds',
        'HK.away_bnews as hk_away_bnews',
        'HK.diff_market_cap as hk_diff_market_cap',
        'FAV.team_id as fav_team_id',
        'FAV.short_name as fav_short_name',
        'HK.favorite_market_cap as hk_favorite_market_cap',
        'FAV.url_logo as fav_url_logo',
        'UDG.team_id as udg_team_id',
        'UDG.short_name as udg_short_name',
        'HK.underdog_market_cap as hk_underdog_market_cap',
        'UDG.url_logo as udg_url_logo'
      )
      .from('HOMEWORK as HK')
      .join('FIXTURE as FIX', 'HK.fixture_id', 'FIX.fixture_id')
      .join('LEAGUE as LEA', 'LEA.league_id', 'FIX.league_id')
      .join('RELIABILITY as REL', 'LEA.league_id', 'REL.league_id')
      .join('TEAM as FAV', 'HK.favorite', 'FAV.team_id')
      .join('TEAM as UDG', 'HK.underdog', 'UDG.team_id')
      .join('TEAM as HOM', 'FIX.home_team', 'HOM.team_id')      
      .join('TEAM as AWA', 'FIX.away_team', 'AWA.team_id')
      .where('FIX.status', '=', 'NS' )
      .andWhere('HK.home_odds', '>', 0)
      .andWhere('HK.away_odds', '>', 0)
      .then((homeworks) => {
        return cb(null, homeworks)
      })
      .catch((error) => {
        mod_assert.fail(error,'Promise error')
    })
  }
  
  getOpportunity(opts, cb) {
    mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function")
    mod_assert.ok(typeof opts.hk_fixture_id === 'number' && opts.hk_fixture_id !== null, "arguments 'opts.hk_fixture_id' must be a number") 
    
	  knex('OPPORTUNITY as OPP')
    .join('STRATEGY as STR', 'STR.strategy_id', 'OPP.strategy_id')
    .where('fixture_id', opts.hk_fixture_id)
	  .then((_) => {
	    return cb(null, _)
	  })
    .catch((error) => {
      mod_assert.fail(error,'Promise error')
    })  
  }
 }

module.exports = new Utils()
