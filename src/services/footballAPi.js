'use strict'

/**
 * Module dependencies
 * @private
 */

const mod_async = require('async')
const mod_assert = require('assert').strict
const mod_axios = require('axios')
const config = require('config')

/**
 * Module variables
 * @private
 */
const patch = config.get('patch')
const referal_bookies = config.get('bookies')
const logger = require('../logger')
const knex = require('../knex')
const headers = {
  'x-rapidapi-host': config.get('rapidapi-host'),
  'x-rapidapi-key': config.get('rapidapi-key')
}

/**
 * Main
 */

const setExtraTeamInfos = (opts, cb) => {
  mod_assert.ok(typeof cb === 'function')
  mod_assert.ok(typeof opts === 'object' && opts !== null, "opts' must be an string")  
  mod_assert.ok(typeof opts.short_name === 'string' && opts !== null, "argument 'opts.short_name' must be an string")
  mod_assert.ok(typeof opts.country === 'string' && opts !== null, "argument 'opts.country' must be an string")
	
  //Necessary, cause data may differs between two differenys datasets.  
  opts.short_name = patch?.['team_name']?.[opts?.country.toLowerCase()]?.[opts.short_name] || opts.short_name
  const patch_name = patch?.['team_name']?.[opts?.country.toLowerCase()]?.[opts.short_name]
  
  mod_axios
    .request({
      method: 'GET',
      url: `https://${config.get('rapidapi-host')}/teams`,
      params: {
        name: opts.short_name,          //to be adjusting, according the league.
				country: opts.country
      },
      headers
    })
    .then(response => {
      const res = response.data.response
      if (res.length !== 1) {
				console.warn(`team_id could not be associated a single team. Params: [ name: ${opts.name}, short_name: ${opts.short_name},, country: ${opts.country}]`)
				opts.team_id = -1
        return cb(null, opts)
      }
      const _ = res.pop()
			opts.team_id = _.team.id
      opts.url_logo = _.team.logo
      return cb(null, opts)
    })
  .catch((error) => {
    mod_assert.fail(error,'Promise error')
  })
}

/**
 * Adjustment to data sets, when team_id cannot be filled via automation.
 */
const searchTeamByName = (opts, cb) => {
	mod_assert.ok(typeof cb === 'function', "argument 'cb' must be an function")
	mod_assert.ok(typeof opts === 'object' && opts !== null, "argument 'opts' must be an object")  
	mod_assert.ok(typeof opts.name === 'string' && opts !== null, "argument 'opts.name' must be an string")
	
	mod_axios
		.request({
    	method: 'GET',
    	url: `https://${config.get('rapidapi-host')}/teams`,
    	params: {
      	search: opts.name,
    	},
    	headers
  	})
  	.then(response => {
    	const res = response.data.response
			res.forEach((_) => {
				console.log(_)
			}) 
    	return cb(null, res)
  	})
		.catch((error) => {
      mod_assert.fail(error,'Promise error')
    })
}


const getFixtureByDate = (opts, cb) => {
	mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function")
	mod_assert.ok(typeof opts === 'object' && opts !== null, "argument 'opts' must be an object")  
	mod_assert.ok(typeof opts.league === 'number' && opts !== null, "argument 'opts.league_id' must be a number")
	mod_assert.ok(typeof opts.date === 'string' && opts !== null, "argument 'opts.date' must be a string")
	mod_assert.ok(typeof opts.season === 'number' && opts !== null, "argument 'opts.season' must be a number")
	
	mod_axios
		.request({
  		method: 'GET',
  		url: `https://${config.get('rapidapi-host')}/fixtures`,
  		params: {
				league: opts.league,
				date: opts.date,
				season: opts.season,
  		},
  		headers
		})
		.then(_ => {
  		return cb(null, _.data.response)
		})
		.catch((error) => {
      mod_assert.fail(error,'Promise error')
    })
}

const getOddsByFixtureId = (opts, cb) => {
	mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function")
  mod_assert.ok(typeof opts === 'object' && opts !== null, "arguments 'opts' must be an object")
  mod_assert.ok(typeof opts.fixture_id === 'number' && opts !== null, "arguments 'opts.fixture_id' must be a number") 
  
  mod_axios
	  .request({
		  method: 'GET',
		  url: `https://${config.get('rapidapi-host')}/odds`,
		  params: {
        fixture: opts.fixture_id
		},
		headers
	})
	.then(_ => {
    const { response??} =  _.data
    
    if (response.length === 0) return cb(null, [[0,0], 0])
      
    const bookies_available = _.data.response.pop().bookmakers || {}
    let referal_bookie
    loop1: for (let i = 0; i < referal_bookies.length; i++) { 
      for (let j = 0; j < bookies_available.length; j++) {
        if (referal_bookies[i].id === bookies_available[j].id) {
          referal_bookie = bookies_available[j]
          break loop1
        }
      }
    }
    
    if (!referal_bookie) return cb(null, [[0,0], 0])
      
    const match_winner_market = referal_bookie.bets.filter((_) => _.name === 'Match Winner' ).pop()
    const [home, draw, away] = match_winner_market.values
    
    return cb(null, [[home.odd, away.odd], referal_bookie.id])
	})
	.catch((error) => {
    mod_assert.fail(error,'Promise error')
  })
}

const getInjuriesByTeam = (opts, cb) => {
	mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function")
  mod_assert.ok(typeof opts === 'object' && opts !== null, "arguments 'opts' must be an object")
  mod_assert.ok(typeof opts.league_id === 'number' && opts !== null, "arguments 'opts.league_id' must be a number")
  mod_assert.ok(typeof opts.fixture_id === 'number' && opts !== null, "arguments 'opts.fixture_id' must be a number")
  mod_assert.ok(typeof opts.team_id === 'number' && opts !== null, "arguments 'opts.team_id' must be a number") 
    
  mod_axios
	  .request({
		  method: 'GET',
		  url: `https://${config.get('rapidapi-host')}/injuries`,
		  params: {
        league: opts.league_id,
        fixture: opts.fixture_id,
        team: opts.team_id
		},
		headers
	})
	.then(_ => {
		return cb(null, _.data.response)
	})
	.catch((error) => {
    mod_assert.fail(error,'Promise error')
  })
}

const getLiveFixtures = (fixtureIds, cb) => {  
	mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function")
  mod_assert.ok(typeof fixtureIds === 'string' && fixtureIds !== null, "arguments 'fixtureIds' must be a string")
    
  mod_axios
  .request({
	  method: 'GET',
	  url: `https://${config.get('rapidapi-host')}/fixtures?live=${fixtureIds}`,
    headers
  })
  .then(_ => {
	  return cb(null, _.data.response)
  })
  .catch((error) => {
    mod_assert.fail(error,'Promise error')
  })
} 

const getFixtureById = (opts, cb) => {
  mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function")
  mod_assert.ok(typeof opts === 'object' && opts !== null, "arguments 'opts' must be an object")
  mod_assert.ok(typeof opts.fixture_id === 'number' && opts !== null, "arguments 'opts.fixture_id' must be a number")
    
  mod_axios
  .request({
	  method: 'GET',
	  url: `https://${config.get('rapidapi-host')}/fixtures?id=${opts.fixture_id}`,
    headers
  })
  .then(_ => {
	  return cb(null, _.data.response.pop())
  })
  .catch((error) => {
    mod_assert.fail(error,'Promise error')
  })
}


const getExtraPlayerInfos = (opts, cb) => {  
  mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function")
  mod_assert.ok(typeof opts === 'object' && opts !== null, "arguments 'opts' must be an object")
  mod_assert.ok(typeof opts.name === 'string' && opts !== null, "arguments 'opts.name' must be a string")
  mod_assert.ok(typeof opts.team_id === 'number' && opts !== null, "arguments 'opts.team_id' must be a number")
  
  
  mod_axios
  .request({
	  method: 'GET',
	  url: `https://${config.get('rapidapi-host')}/players`,
  	params: {
    	search: opts.name,
      team: opts.team_id,
  	},
    headers
  })
  .then(_ => {
    if (_.data.response.length === 0) return cb(null)
    if (_.data.response.length > 1) {
      console.log(`[${_.data.response.length}] possibilities, need a manual intervation for player -> name ${opts.name} :: league_id ${opts.league_id} :: team ${opts.team_id}`)
      return cb(null)
    }
	  return cb(null, _.data.response.pop())
  })
  .catch((error) => {
    mod_assert.fail(error,'Promise error')
  })
}

const getLineUpsByTeam = (opts, cb) => {
  mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function")
  mod_assert.ok(typeof opts === 'object' && opts !== null, "arguments 'opts' must be an object")
  mod_assert.ok(typeof opts.fixture_id === 'number' && opts !== null, "arguments 'opts.fixture_id' must be a number")
  mod_assert.ok(typeof opts.team_id === 'number' && opts !== null, "arguments 'opts.team_id' must be a number")
  
  mod_axios
  .request({
	  method: 'GET',
	  url: `https://${config.get('rapidapi-host')}/fixtures/lineups`,
  	params: {
    	fixture: opts.fixture_id,
      team: opts.team_id,
  	},
    headers
  })
  .then(_ => {
    if (_.data.response.length === 0)
      return cb(null, [])
    
    const data = _.data.response.pop()
	  return cb(null, [].concat(data.startXI, data.substitutes))
  })
  .catch((error) => {
    mod_assert.fail(error,'Promise error')
  })
}

/**
 * Module exports
 * @public
 */
module.exports = {
  setExtraTeamInfos,
	searchTeamByName,
	getFixtureByDate,
  getOddsByFixtureId,
  getInjuriesByTeam,
  getLiveFixtures,
  getFixtureById,
  getExtraPlayerInfos,
  getLineUpsByTeam
}
