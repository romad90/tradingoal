'use strict'

/**
 * Module dependencies
 * @private
 */

const mod_ora = require('ora')
const mod_async = require('async')
const mod_process = require('process')

/**
 * Module variables
 * @private
 */
const Utils = require('../utils')
const knex = require('../knex.js')
const footballAPi = require('../services/footballAPi.js')
const regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/

module.exports = (args) => {
	const opts = {} 
  	
	if (!args.d && !args.date) {
			console.log('-d or --date is mandatory.')
	    mod_process.exit(0) 
	}
  
	if (!args.l && !args.league) {
			console.log('-l or --league is mandatory.')
	    mod_process.exit(0) 
	}
  
	if (!args.a && !args.action) {
			console.log('-a or --action is mandatory.')
	    mod_process.exit(0) 
	}
  
	if (args.a || args.action) {
		opts.action = args.a || args.action
		if (typeof opts.action !== 'string') {
			console.log('-a or --action must be a string.')
			mod_process.exit(0)
		}
    
    if (opts.action !== 'add' && opts.action !== 'ls') {
			console.log(`-a or --action :: ${opts.action} must be add or ls`)
	    mod_process.exit(0) 
    }
  }
  
	if (args.d || args.date) {
		opts.date = args.d || args.date
		if (typeof opts.date !== 'string') {
			console.log('-l or --league must be a string.')
			mod_process.exit(0)
		}
    
    if (!regex.test(opts.date)) {
			console.log('date must be a string as YYYY-mm-dd')
			mod_process.exit(0)
    }
	}
  
	if (args.l || args.league) {
		opts.league_id = args.l || args.league
		if (typeof opts.league_id !== 'number') {
			console.log('-l or --league must be a number.')
			mod_process.exit(0)
		} 
	}
  
  const spinner = mod_ora().start(`Fixtures on ${opts.date}, league:${opts.league_id}, season:2021 in searching... `)
  
  if (opts.action === 'add') {
    mod_async.waterfall([
      mod_async.apply(footballAPi.getFixtureByDate, {
        league: opts.league_id,
  			date: opts.date,
        season: 2021
      }),
      (_, done) => {
        mod_async.map(_, (fixture, cb) => {
          return cb(null, Utils.prepFixture(fixture))
        }, done)
      },
      (_, done) => {
			  knex('FIXTURE')
				.insert(_)
				.then(res => {
				  return done(null)
				})
				.catch(() => {})	
      }
    ], (err) => {
      if (err) {
        spinner.fail(`An error occured, fixtures on ${opts.date}, league:${opts.league_id}, season:2021. `)
        mod_process.exit(0)
      }
      spinner.succeed(`Fixtures on ${opts.date}, league:${opts.league_id}, season:2021 added!`)
  		mod_process.exit() 
    })
  } else if (opts.action === 'ls') {
      console.log('not implemented yet')
  } else {
			console.log(`-a or --action :: ${opts.action} must be add or ls`)
  }
}