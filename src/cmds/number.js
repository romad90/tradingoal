'use strict'

/**
 * Module dependencies
 * @private
 */
const FuzzySet = require('fuzzyset')
const mod_async = require('async')
const config = require('config')

/**
 * Module variables
 * @private
 */
const FSScraper = require('../components/FSScraper')

//  "125": "https://www.flashscore.com/team/america-mg/xUT0Bp8o/squad/",
//  "152": "https://www.flashscore.com/team/esporte-clube-juventude/GS36K259/squad/",
//  "1193": "https://www.flashscore.com/team/cuiaba/zVvjqDOo/squad/"

/**
 * Module export
 * @public
 */
module.exports = (args) => {
  const dataSetFromFS = []
  
	mod_async.map(config.get('patch.player_number'), (_, done) => {
    mod_async.forEachOf(_, (url, team_id, callback) => {
      FSScraper.parsePlayer({
        url: url
      }, (err, data) => {
        if (err) return callback(err)
        dataSetFromFS.push({
          [team_id]: data
        })
        //console.log(dataSetFromFS)
        callback(null)
      })
    }, done)
	}, (err) => {
	  if (err) throw err
    //console.log(JSON.stringify(dataSetFromFS, undefined, 2))
	})
}