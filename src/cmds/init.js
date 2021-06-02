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

const knex = require('../knex.js')
const WScrapper = require('../components/WScrapper')
const footballAPi = require('../services/footballAPi.js')
const Utils = require('../utils')
const logger = require('../logger')

module.exports = (args) => {
	let opts
	
	if (!args.a && !args.all && !args.c) mod_process.exit(0) 
	if (args.a || args.all) {
		opts = null
	}
	if (args.c || args.country) {
		opts = args.c || args.country
		if (typeof opts !== 'string') {
			console.log('country is mandatory')
			mod_process.exit(1)
		} 
	}
  
  const spinner = mod_ora().start('Importation in progress...')
	  
	mod_async.waterfall([
		(done) => {
			Utils.isMySQLUp((err) => {
				if (err) {
					return done(err)
				}
				return done(null)
			})
		},
		(done) => {
			Utils.isDatabaseExists((err) => {
				if (err) {
					return done(err)
				}
				return done(null)
			})
		},
		(done) => {
			Utils.populatedLeagueTable(opts, (err, leagues) => {
				if (err) {
					return done(err)
				}
				return done(null, leagues)
			})
		},
		(_, done) => {
      mod_async.map(_, 
        (league, cb) => {
          Utils.populatedTeamTable(league, (err, teams) => {
  				  if (err) return cb(err)
  				  return cb(null, teams)
          })
      }, (err, teams) => {
        if (err) {
          return done(err)
        }
  			return done(null, teams)
      })		
		},
		(_, done) => {
      mod_async.map(_.flat(), (team, cb) => {
  			Utils.populatedPlayer(team, (err, players) => {
  				if (err) return cb(err)
  				return cb(null, players)
  			})
      }, (err, players) => {
				if (err) {
					return done(err)
				}
				return done(null, players)
      })
		},
	], (err) => {
		if(err) {
      spinner.fail('Importation failed!')
			throw err
		}
    spinner.succeed('Importation successful!')
		mod_process.exit() 
	})
}