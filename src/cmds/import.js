'use strict'

/**
 * Module dependencies
 * @private
 */

const mod_inquirer = require('inquirer')
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

/**
 * Module export
 * @public
 */

module.exports = () => {
  mod_inquirer
    .prompt([
      {
        type: 'list',
        name: 'country',
        message: 'Which country league do you want to import?',
        choices: ['Argentina', 'Belgium', 'Brazil', 'England', 'France', 'Germany', 'Italy', 'Netherlands', 'Portugal', 'Spain', 'Turkey'],
      },
    ])
    .then(answers => {
      const country = answers.country.toLowerCase()
      const spinner = mod_ora().start('Importation in progress...')
      
      throw new Error('A')
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
    			Utils.populatedLeagueTable(country, (err, leagues) => {
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
    })
}