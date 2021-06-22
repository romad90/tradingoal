'use strict'

/**
 * Module dependencies
 * @private
 */

const _ = require('lodash')
const mod_assert = require('assert').strict
const mod_axios = require('axios')
const mod_cheerio = require('cheerio')
const mod_crypto = require('crypto')
 
/**
 * Module variables
 * @private
 */ 
const getHash = (s) => {
  mod_assert.ok(s, "argument 's' cannot be null")
  return mod_crypto.createHash('sha256').update(s).digest('hex')
}

/**
 * module Handle webscrapping on Flashscore
 * @module FSScraper
 */

const parsePlayer = (opts, cb) => {
  mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function")
	mod_assert.ok(typeof opts === 'object' && opts !== null, "argument 'opts' must be an object")
	mod_assert.ok(typeof opts.url === 'string' && opts.uri !== null, "argument 'opts.url' must be an string")
    
  const data = []
  
  mod_axios(opts.url)
    .then(response => {
      const html = response.data
      const $ = mod_cheerio.load(html)
      const elemSelector = 'div > div.tableTeam__squadInfo'
      const rawKeys = [
        'number',
        'name'
      ]

      $(elemSelector).each((parentIdx, parentElem) => {
        let keyIdx = 0
        const teamObj = {}
        const uniq = {}

        $(parentElem).children().each((childIdx, childElem) => {
          const tdValue = $(childElem).text().trim()
          
          if(tdValue && !uniq[getHash(tdValue)]) {
            uniq[getHash(tdValue)] = true
            teamObj[rawKeys[keyIdx]] = tdValue
            keyIdx++
          }      
        })
        data.push(teamObj)
      })
      return cb(null, _.uniqWith(data, _.isEqual))
    })
    .catch((error) => {
      console.log(error)
      mod_assert.fail(error,'Promise error')
    })
}

/**
 * Module export
 * @public
 */

module.exports = {
  parsePlayer
}

