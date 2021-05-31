'use strict'

/**
 * Module dependencies
 * @private
 */

const mod_async = require('async')
const mod_assert = require('assert').strict
const mod_axios = require('axios')

/**
 * Module variables
 * @private
 */
const logger = require('../logger')
const headers = {
  'x-rapidapi-host': 'v3.football.api-sports.io',
  'x-rapidapi-key': 'a9f6d46c4598107951d83d8aeb3f7d36'
}

/**
 * Main
 */

const setTeamId = (opts, cb) => {
  mod_assert.ok(typeof cb === 'function')
  mod_assert.ok(typeof opts === 'object' && opts !== null, "opts' must be an string")  
  mod_assert.ok(typeof opts.short_name === 'string' && opts !== null, "argument 'opts.short_name' must be an string")
  mod_assert.ok(typeof opts.country === 'string' && opts !== null, "argument 'opts.country' must be an string")
	
  mod_axios
    .request({
      method: 'GET',
      url:'https://v3.football.api-sports.io/teams',
      params: {
        name: opts.short_name,
				country: opts.country
      },
      headers
    })
    .then(response => {
      const res = response.data.response
      if (res.length !== 1) {
				logger.warn(`team_id could not be associated a single team. Params: [ name: ${opts.name}, short_name: ${opts.short_name},, country: ${opts.country}]`)
				opts.team_id = -1
        return cb(null, opts)
      }
      const _ = res.pop()
			opts.team_id = _.team.id
      return cb(null, opts)
    })
  .catch(err => {
		logger.error(err)
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
    	url:'https://v3.football.api-sports.io/teams',
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
		.catch(err => {
  		return cb(err)
		})
}


const nextRoundAvailable = (opts, cb) => {
	mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function")
	mod_assert.ok(typeof opts === 'object' && opts !== null, "argument 'opts' must be an object")  
	mod_assert.ok(typeof opts.league_id === 'number' && opts !== null, "argument 'opts.league_id' must be a number")
	mod_assert.ok(typeof opts.season === 'number' && opts !== null, "argument 'opts.season' must be an string")
	
	mod_axios
		.request({
  		method: 'GET',
  		url:'https://v3.football.api-sports.io/fixtures',
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
		.catch(err => {
			return cb(err)
		})
}
/**
 * Module exports
 * @public
 */
module.exports = {
  setTeamId,
	searchTeamByName,
	nextRoundAvailable
}
