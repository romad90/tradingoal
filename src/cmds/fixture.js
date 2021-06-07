'use strict'

/**
 * Module dependencies
 * @private
 */

const mod_async = require('async')
const mod_inquirer = require('inquirer')
const mod_ora = require('ora')
const mod_process = require('process')

/**
 * Module variables
 * @private
 */
const Utils = require('../utils')
const knex = require('../knex.js')
const footballAPi = require('../services/footballAPi.js')
const regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/

/**
 * Module export
 * public
 */

module.exports = () => {
  
  const _ = {
    'Copa de la Liga Profesional de Futbol - Argentina': 128,
    'Jupiler Pro League - Belgium': 144, 
    'Campeonato Brasileiro Serie A - Brazil': 71,
    'Premier League - England': 39,
    'Championship - England': 40,
    'Ligue 1 - France': 61, 
    'Bundesliga - Germany': 78, 
    'Serie A - Italy': 135, 
    'Eredivisie - Netherlands': 88, 
    'Liga NOS - Portugal': 94, 
    'LaLiga - Spain': 140, 
    'Super Lig - Turkey': 203
  }
  const dt = new Date()

  mod_inquirer
    .prompt([
      {
        name: 'season',
        message: 'Please enter the season ?',
        default: `${dt.getFullYear()}`
      },
      {
        name: 'date',
        message: 'Please enter the date of the fixture?',
        default: `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`
      },
      {
        type: 'checkbox',
        name: 'leagues',
        message: 'Which league do you want the fixtures?',
        choices: [
          'Copa de la Liga Profesional de Futbol - Argentina', 
          'Jupiler Pro League - Belgium',
          'Campeonato Brasileiro Serie A - Brazil',
          'Premier League - England',
          'Championship - England',
          'Ligue 1 - France', 
          'Bundesliga - Germany', 
          'Serie A - Italy', 
          'Eredivisie - Netherlands',
          'Liga NOS - Portugal',
          'LaLiga - Spain', 
          'Super Lig - Turkey'
        ]
      }
    ])
    .then(answers => {
      const { date, leagues, season} = answers
      const leagues_ids = []
  
      if (!regex.test(date)) {
		    console.log(`date must be a string as YYYY-mm-dd :: ${date}`)
		    mod_process.exit(0)
      }
  
      for (const [key, value] of Object.entries(_)) {
        leagues.forEach((n) => {
          if (n === key) leagues_ids.push(value)
        })
      }
  
      mod_async.map(leagues_ids, (league_id, callback) => {
        const spinner = mod_ora().start(`Fixtures on ${date}, leagues:${league_id}, season:${season} in searching...`)
    
        mod_async.waterfall([
          mod_async.apply(footballAPi.getFixtureByDate, {
            league: league_id,
  			    date: date,
            season: parseInt(season)
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
				    .catch(cb)	
          }
        ], (err) => {
          if (err) {
            spinner.fail(`An error occured, fixtures on ${date}, league:${league_id}, season:${season}.`)
            return callback(err)
          }
          spinner.succeed(`Fixtures :: ${date} , league :: ${league_id}, season :: ${season} added!`)
          return callback(null)
        })
      }, function(err) {
        if(err) throw err
        const spinner = mod_ora().succeed(`Finished!`)
        mod_process.exit(1)
      })
    })
}