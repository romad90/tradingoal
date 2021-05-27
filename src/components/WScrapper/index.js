'use strict'

/**
 * Modules dependencies
 * @private
 */

const mod_assert = require('assert').strict
const mod_axios = require('axios')
const mod_cheerio = require('cheerio')
const mod_crypto = require('crypto')

/**
 * Modules variables
 * @private
 */

const logger = require('../../logger')
const getHash = (s) => {
  mod_assert.ok(s, "argument 's' cannot be null")
  return mod_crypto.createHash('sha256').update(s).digest('hex')
}
const rValueAsExpected = (opts) => {
  mod_assert.ok(typeof opts === 'object' && opts !== null, "argument 'opts' cannot be null")
  mod_assert.ok(typeof opts.value === 'string' && opts.value !== null, "argument 'opts.value' cannot be null")
  
  opts['currency'] = opts.value.charAt(0)
  switch (opts.value.slice(-1)){
    case 'n':
      opts['unit'] = 'bn'
    break
    case 'h':
    case '.':
      opts['unit'] = 'th'
      break
    default:
      opts['unit']= 'm'
  }
  opts.value = opts.value.replace(opts['unit'], '')
  opts.value = opts.value.replace(opts['currency'], '')
  opts.value = parseFloat(opts.value)
  return opts
}

/**
 *
 */

class WScrapper {
  constructor() {}
	
	parseLeague(opts, cb) {
		mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function")
		mod_assert.ok(typeof opts === 'object' && opts !== null, "argument 'opts' must be an object")
		mod_assert.ok(typeof opts.name === 'string' && opts.name !== null, "argument 'opts.name' must be an string")
	  
    const rDataAsExpected = (opts) => {
      mod_assert.ok(typeof opts === 'object' && opts !== null, "argument 'opts' must be an object")
      mod_assert.ok(opts.url_logo && opts.url_logo !== null, "argument 'opts.url_logo' cannot be null")
      mod_assert.ok(opts.league_name && opts.league_name !== null, "argument 'opts.league_name' cannot be null")
      mod_assert.ok(opts.url_teams && opts.url_teams !== null, "argument 'opts.url_teams' cannot be null")
      mod_assert.ok(opts.country && opts.country !== null, "argument 'opts.country' cannot be null")
      mod_assert.ok(opts.url_country_flag, "argument 'opts.url_country_flag' cannot be null")
      mod_assert.ok(opts.clubs && opts.clubs !== null, "argument 'opts.clubs' cannot be null")
      mod_assert.ok(opts.players && opts.players !== null, "argument 'opts.players' cannot be null")
      mod_assert.ok(opts.total_market_value && opts.total_market_value !== null, "argument 'opts.total_market_value' cannot be null")
      mod_assert.ok(opts.mean_market_value && opts.mean_market_value !== null, "argument 'opts.mean_market_value' cannot be null")
      
      const {value:total_market_value, unit:total_market_value_unit, currency:total_market_value_currency} = rValueAsExpected({value:opts.total_market_value}) 
      const {value:mean_market_value, unit:mean_market_value_unit, currency:mean_market_value_currency} = rValueAsExpected({value:opts.mean_market_value})

      return {
        league_name: opts.league_name.trim(),
        country: opts.country.trim(),
        url_flag_country: opts.url_country_flag,
        clubs: opts.clubs,
        players: opts.players,
        total_market_value,
        total_market_value_unit,
        total_market_value_currency,
        mean_market_value,
        mean_market_value_unit,
        mean_market_value_currency,
        continent: opts.continent,
        url_teams: opts.url_teams,
      }
    }
    const url = `https://www.transfermarkt.com/schnellsuche/ergebnis/schnellsuche?query=${opts.name}&x=0&y=0`
    const data = []

    mod_axios(url)
      .then(response => {
        const html = response.data
        const $ = mod_cheerio.load(html)
        const elemSelector = '#yw2 > table > tbody > tr'
        const rawLeagueObj = {}
       
        $(elemSelector).each((parentIdx, parentElem) => {
          let keyIdx = 0
          const uniq = {}
          const rawKeys = [
            'url_logo',
            'league_name',
            'url_teams',
            'country',
            'url_country_flag',
            'clubs',
            'players',
            'total_market_value',
            'mean_market_value',
            'continent' 
          ]
 
          $(parentElem).children().each((childIdx, childElem) => {
            const tdValue = $(childElem).text()
            const tdValueImgTitle = $(childElem).find('img.flaggenrahmen').prop('title')
            const tdValueAHref = $(childElem).find('a').prop('href')
            const tdValueImgSrc =  $(childElem).find('img').prop('src')
            
            if (tdValue && !uniq[getHash(tdValue)]) {
              uniq[getHash(tdValue)] = true
              rawLeagueObj[rawKeys[keyIdx]] = tdValue
              keyIdx++
            }
            
            if (tdValueImgTitle && !uniq[getHash(tdValueImgTitle)]) {
              uniq[getHash(tdValueImgTitle)] = true
              rawLeagueObj[rawKeys[keyIdx]] = tdValueImgTitle
              keyIdx++
            }

            if (tdValueAHref && !uniq[getHash(tdValueAHref)]) {
              uniq[getHash(tdValueAHref)] = true
              rawLeagueObj[rawKeys[keyIdx]] = tdValueAHref
              keyIdx++
            }
            
            if (tdValueImgSrc && !uniq[getHash(tdValueImgSrc)]) {
              uniq[getHash(tdValueImgSrc)] = true
              rawLeagueObj[rawKeys[keyIdx]] = tdValueImgSrc
              keyIdx++
            }
          })
          data.push(rDataAsExpected(rawLeagueObj))
        })
        return cb(null, data)
      })
      .catch(console.error)
	}
  
  parseTeam(opts, cb) {
		mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function")
    mod_assert.ok(typeof opts === 'object' && opts !== null, "argument 'opts' must be an object")
		mod_assert.ok(opts.url_teams, "argument 'opts.url_teams' cannot be null")
		mod_assert.ok(typeof opts.url_teams === 'string', "argument 'opts.url_teams' must be a string")
      
    const rDataAsExpected = (opts) => {
      mod_assert.ok(typeof opts === 'object' && opts !== null, "argument 'opts' must be an object")
      mod_assert.ok(opts.url_players && opts.url_players !== null, "argument 'opts.url_players' cannot be null")
      mod_assert.ok(opts.url_logo && opts.url_logo !== null, "argument 'opts.url_logo' cannot be null") 
      mod_assert.ok(opts.name && opts.name !== null, "argument 'opts.name' cannot be null")
      mod_assert.ok(opts.short_name && opts.short_name !== null, "argument 'opts.short_name' cannot be null")
      mod_assert.ok(opts.squad && opts.squad !== null, "argument 'opts.squad' cannot be null")
      mod_assert.ok(opts.average_age && opts.average_age !== null, "argument 'opts.average_age' cannot be null")
      mod_assert.ok(opts.foreigners && opts.foreigners !== null, "argument 'opts.foreigners' cannot be null")
      mod_assert.ok(opts.total_market_value && opts.total_market_value !== null, "argument 'opts.total_market_value' cannot be null")
      mod_assert.ok(opts.mean_market_value && opts.mean_market_value !== null, "argument 'opts.mean_market_value' cannot be null")

      const {value:total_market_value, unit:total_market_value_unit, currency:total_market_value_currency} = rValueAsExpected({value:opts.total_market_value}) 
      const {value:average_market_value, unit:average_market_value_unit, currency:average_market_value_currency} = rValueAsExpected({value:opts.mean_market_value})

      return {
        name: opts.name.trim(),
        short_name: opts.short_name.trim(),
        total_market_value,
        total_market_value_unit,
        total_market_value_currency,
        average_market_value,
        average_market_value_unit,
        average_market_value_currency,
        url_logo: opts.url_logo,
        url_players: opts.url_players,
      }
    }
    const data = []
    const url = `https://www.transfermarkt.com${opts.url_teams}`
    
    mod_axios(url)
      .then(response => {
        const html = response.data
        const $ = mod_cheerio.load(html)
        const elemSelector = '#yw1 > table > tbody > tr'
        const rawKeys = [
          'url_players',
          'url_logo',
          'name',
          'short_name',
          'squad',
          'unknow',
          'average_age',
          'foreigners',
          'total_market_value',
          'mean_market_value'
        ]

        $(elemSelector).each((parentIdx, parentElem) => {
          let keyIdx = 0
          const teamObj = {}
          const uniq = {}

          $(parentElem).children().each((childIdx, childElem) => {
            const tdValue = $(childElem).text()
            const tdValueHref = $(childElem).find('a').prop('href')
            const tdValueImgSrc = $(childElem).find('a img.tiny_wappen').prop('src')
            
            if(tdValue && !uniq[getHash(tdValue)]) {
              uniq[getHash(tdValue)] = true
              teamObj[rawKeys[keyIdx]] = tdValue
              keyIdx++
            }
            
             if(tdValueHref && !uniq[getHash(tdValueHref)]) {
              uniq[getHash(tdValueHref)] = true
              teamObj[rawKeys[keyIdx]] = tdValueHref
              keyIdx++
            }
            
            if(tdValueImgSrc && !uniq[getHash(tdValueImgSrc)]) {
              uniq[getHash(tdValueImgSrc)] = true
              teamObj[rawKeys[keyIdx]] = tdValueImgSrc
              keyIdx++
            }
          })
          data.push(rDataAsExpected(teamObj))
        })
        return cb(null, data)
      })
      .catch(console.error)
  }

  parsePlayer(opts, cb) {
    mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function")
    mod_assert.ok(typeof opts === 'object' && opts !== null, "argument 'opts' must be an object")
		mod_assert.ok(typeof opts.url_players === 'string' && opts.url_players !== null, "argument 'opts.players' must be an string")

    const rDataAsExpected = (opts) => {
      mod_assert.ok(typeof opts === 'object' && opts !== null, "argument 'opts' must be an object")
      mod_assert.ok(opts.numbers && opts.numbers !== null, "argument 'opts.numbers' cannot be null")
      mod_assert.ok(opts.irrelevant && opts.irrelevant !== null, "argument 'opts.irrelevant' cannot be null")
      mod_assert.ok(opts.name && opts.name !== null, "argument 'opts.name' cannot be null") 
      mod_assert.ok(opts.irrelevant1 && opts.irrelevant1 !== null, "argument 'opts.irrelevant1' cannot be null")
      mod_assert.ok(opts.market_value && opts.market_value !== null, "argument 'opts.market_value' cannot be null")

      const {value:market_value, unit:market_value_unit, currency:market_value_currency} = rValueAsExpected({value:opts.market_value}) 

      return {
        name: opts.name.trim(),
        market_value,
        market_value_unit,
        market_value_currency,
      }
    }

    const data = []
    const url = `https://www.transfermarkt.com${opts.url_players}`
 
    mod_axios(url)
      .then(response => {
        const html = response.data
        const $ = mod_cheerio.load(html)
        const elemSelector = '#yw1 > table > tbody > tr'
        const rawKeys = [
          'numbers',
          'irrelevant',
          'name',
          'irrelevant1',
          'market_value',
        ]

        $(elemSelector).each((parentIdx, parentElem) => {
          let keyIdx = 0
          const playerObj = {}
          const uniq = {}

          $(parentElem).children().each((childIdx, childElem) => {
            const tdValue = $(childElem).text()
            
            if(tdValue && !uniq[getHash(tdValue)]) {
              uniq[getHash(tdValue)] = true
              playerObj[rawKeys[keyIdx]] = tdValue
              keyIdx++
            }
          })
          data.push(rDataAsExpected(playerObj))
        })
        return cb(null, data)
      })
      .catch(console.error)
  }
}

module.exports = new WScrapper()
