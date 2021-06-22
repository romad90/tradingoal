'use strict'

'use strict'

/**
 * Module dependencies
 * @private
 */

const _ = require('lodash')
const mod_assert = require('assert').strict
const mod_async = require('async')
const mod_axios = require('axios')
const mod_cheerio = require('cheerio')
const mod_crypto = require('crypto')
const Fuzzyset = require('fuzzyset')
 
/**
 * Module variables
 * @private
 */ 

const WScrapper = require('../src/components/WScrapper')
const FSScraper = require('../src/components/FSScraper')
const knex = require('../src/knex.js')

/**
 * module Handle webscrapping on Transfermarkt
 * @module TransfermarktScrapper
 */

const parseFullNamePlayer = (opts, cb) => {
  mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function")
	mod_assert.ok(typeof opts === 'object' && opts !== null, "argument 'opts' must be an object")
	mod_assert.ok(typeof opts.uri === 'string' && opts.uri !== null, "argument 'opts.uri' must be an string")
    
  const data = []
  
  mod_axios(`https://www.transfermarkt.com${opts.uri}`)
    .then(response => {
      const html = response.data
      const $ = mod_cheerio.load(html)
      const elemSelector = '#main > div:nth-child(17) > div.large-8.columns > div:nth-child(2) > div.row.collapse > div.large-6.large-pull-6.small-12.columns.spielerdatenundfakten > div.spielerdaten > table > tbody > tr:nth-child(1) > td'
      
      const fullName = ($(elemSelector).text()) ? $(elemSelector).text().trim() : null

      return cb(null, fullName)
    })
    .catch((error) => {
      mod_assert.isNotOk(error,'Promise error')
    })
}

/**
 * Use Fuzzy string set, to deal with string comparison.
 */

const isSimilar = (str1 = '', str2 = '') => {
  if (!str1) return false
  if (!str2) return false
      
  if (str1.split(' ').length > 1) {
    str1 = str1.split(' ').sort((a, b) => {
      return a.localeCompare(b, 'en', { sensitivity: 'base', ignorePunctuation: true })
    }).join(' ')
  }
  
  if (str2.split(' ').length > 1) {
    str2 = str2.split(' ').sort((a, b) => {
      return a.localeCompare(b, 'en', { sensitivity: 'base', ignorePunctuation: true })
    }).join(' ')
  }
  
  const _ = Fuzzyset()
  _.add(str1)
  const [[score]] = _.get(str2) || [[0]]
  console.log(`comparison ${str1} ::: ${str2} -> score: ${score}`)
  return score >= 0.85
}

// Number regulation, must be done team by team with precaution.
// 1: launch pan_task, copy the data, and filled missing numbers
// 2: launch updatePlayersNumber, with previous data copied

/**
 * Preset Affectation Number
 */
const pan_task = (cb) => {
  mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function")
  
  const opts = {
    team_id: 1193,
    url_players: '/cuiaba-ec-mt-/startseite/verein/28022/saison_id/2020',
    url_squad_fs:'https://www.flashscore.com/team/cuiaba/zVvjqDOo/squad/',
    _isFullNameEnabled: true
  }

  mod_async.waterfall([
    mod_async.apply(WScrapper.parsePlayer, opts),
    (players, done) => {
      mod_async.map(players, (_, callback) => {
        delete _.last_update
        parseFullNamePlayer({
          uri: _.full_name
        }, (err, full_name) => {
          if (err) return callback(err)
          _.full_name = full_name
          callback(null, _)
        })
      }, done)
    },
    (enrichedPlayers, done) => {
      FSScraper.parsePlayer({
        url: opts.url_squad_fs
      }, (err, squad) => {
        if (err) done (err)
        done(null, [enrichedPlayers, squad])
      })
    },
    (_, done) => {
      const [players, fs_players] = _

      for (let j = 0; j < players.length; j++) { 
        for (let i = 0; i < fs_players.length; i++){
          if (!fs_players[i].name && !fs_players[i].number ) continue 

          if (isSimilar(players[j].name, fs_players[i].name)) {
            players[j].number = fs_players[i].number
            fs_players.splice(i, 1)
            players[j].full_name
            continue
          }

          if (isSimilar(players[j].full_name, fs_players[i].name)) {
            players[j].number = fs_players[i].number
            fs_players.splice(i, 1)
            players[j].full_name
            continue
          }
        }
     }
     console.log(players)
     console.log(fs_players)
     done(null)
    }
  ], (err) => {
    if (err) throw err
    cb(null)
  })
}

/**
 * batch :: Update player information.
 */
const updatePlayersNumber = (players, cb) => {
  mod_assert.ok(Array.isArray(players), "players must be an array")
	mod_assert.ok(players.length > 0, "argument 'players' cannot be empty")
  mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function")
  
  for(let i = 0; i < players.length; i++) {
    players[i].last_update = knex.fn.now()
  }
  
  knex('PLAYER')
    .insert(players)
    .onConflict('team_id', 'name', 'birth_date')
    .merge()
  .then(() => {
    return cb(null, players)
  })
  .catch((error) => {
    console.log(error)
    mod_assert.fail(error,'Promise error')
  })
}

/**
 * batch :: Update player information.
 */
const deletePlayersNumber = (players, cb) => {
  mod_assert.ok(Array.isArray(players), "players must be an array")
	mod_assert.ok(players.length > 0, "argument 'players' cannot be empty")
  mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function")
  
  for(let i = 0; i < players.length; i++) {
    players[i].last_update = knex.fn.now()
  }
  
  knex('PLAYER')
    .delete(players)
    .onConflict('team_id', 'name', 'birth_date')
    .merge()
  .then(() => {
    return cb(null, players)
  })
  .catch((error) => {
    console.log(error)
    mod_assert.fail(error,'Promise error')
  })
}

/**
 * Main
 */
//pan_task(console.info)
//updatePlayersNumber(, console.info)
