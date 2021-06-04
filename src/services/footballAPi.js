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
const reference_bookmaker_id = config.get('bookmaker').id
const logger = require('../logger')
const headers = {
  'x-rapidapi-host': config.get('rapidapi-host'),
  'x-rapidapi-key': config.get('rapidapi-key')
}

/**
 * Main
 */

const setTeamId = (opts, cb) => {
  mod_assert.ok(typeof cb === 'function')
  mod_assert.ok(typeof opts === 'object' && opts !== null, "opts' must be an string")  
  mod_assert.ok(typeof opts.short_name === 'string' && opts !== null, "argument 'opts.short_name' must be an string")
  mod_assert.ok(typeof opts.country === 'string' && opts !== null, "argument 'opts.country' must be an string")
	
  //Necessary, cause data may differs between two differenys datasets.
  opts.short_name = patch['team_name'][opts.country.toLowerCase()][opts.short_name] || opts.short_name
  const patch_name = patch['team_name'][opts.country.toLowerCase()][opts.short_name]
  
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
      return cb(null, opts)
    })
  .catch(err => {
    return cb(err)
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
		.catch(() => {})
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
		.catch(() => {})
}

const getOddsByFixtureId = (opts, cb) => {
  mod_assert.ok(typeof opts === 'object' && opts !== null, "arguments 'opts' must be an object")
  mod_assert.ok(typeof opts.fixture_id === 'number' && opts !== null, "arguments 'opts.fixture_id' must be a number") 
  
  mod_axios
	  .request({
		  method: 'GET',
		  url: `https://${config.get('rapidapi-host')}/odds`,
		  params: {
        fixture: opts.fixture_id,
        bookmaker: reference_bookmaker_id
		},
		headers
	})
	.then(_ => {
    const bookmakers = _.data.response.bookmakers || []
    if (bookmakers.length === 0) return cb(null, [0, 0])
		return cb(null, bookmakers)
	})
	.catch(() => {})
}

const getInjuriesByTeam = (opts, cb) => {
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
	.catch(() => {})
}

/**
 * Module exports
 * @public
 */
module.exports = {
  setTeamId,
	searchTeamByName,
	getFixtureByDate,
  getOddsByFixtureId,
  getInjuriesByTeam
}
