'use strict'

/**
 * Module dependencies
 * @private
 */

const mod_assert = require('assert').strict
const mod_axios = require('axios')
const mod_cheerio = require('cheerio')
const mod_crypto = require('crypto')

/**
 * Module variables
 * @private
 */

const footballAPi = require('../../services/footballAPi.js')
const logger = require('../../logger')
const knex = require('../../knex')

const getHash = (s) => {
  mod_assert.ok(s, "argument 's' cannot be null")
  return mod_crypto.createHash('sha256').update(s).digest('hex')
}

const formatBirthDate = (birth_date) => {
  if (birth_date && birth_date.search(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{1,2}\,\s\d{4}\s\(\d{2}\)/g) === -1) {
    return '1970-01-01'
  }
  const months = {
    'Jan': '01',
    'Feb': '02',
    'Mar': '03',
    'Apr': '04',
    'May': '05',
    'Jun': '06',
    'Jul': '07',
    'Aug': '08',
    'Sep': '09',
    'Oct': '10',
    'Nov': '11',
    'Dec': '12',
  }
  const match = birth_date.split(',')
  const first = match[0].split(' ')
  const month = months[first[0]]
  const year = match[1].match(/\b\d{4}\b/g)
  const day = first[1]
  
  return `${year}-${month}-${day}`
}

const postDeduction = (str) => {
  if (str.search(/goalkeeper/i) > -1) {
    return 'G'
  } else if (str.search(/back/i) > -1) {
    return 'D'
  } else if (str.search(/midfield/i) > -1) {
    return 'M'
  }
  else if (str.search(/winger|forward/i) > -1) {
    return 'F'
  } else {
    return 'NC.'
  }
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
  opts.value = parseFloat(opts.value) || 0
	
	if (opts.value === 0) {
		opts['unit']= 'm'
		opts['currency'] = '€'
	}
  return opts
}

/**
 * module Handle webscrapping on Transfermarkt
 * @module WScrapper
 */

class WScrapper {
  constructor() {}
	
	parseLeague(opts, cb) {
		mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function")
		mod_assert.ok(typeof opts === 'object' && opts !== null, "argument 'opts' must be an object")
		mod_assert.ok(typeof opts.name === 'string' && opts.name !== null, "argument 'opts.name' must be an string")
		mod_assert.ok(typeof opts.league_id === 'number' && opts.league_id !== null, "argument 'opts.league_id' must be a number")
		
    const rDataAsExpected = (_) => {
      mod_assert.ok(typeof _ === 'object' && _ !== null, "argument '_' must be an object")
      mod_assert.ok(_.url_logo && _.url_logo !== null, "argument '_.url_logo' cannot be null")
      mod_assert.ok(_.league_name && _.league_name !== null, "argument '_.league_name' cannot be null")
      mod_assert.ok(_.url_teams && _.url_teams !== null, "argument '_.url_teams' cannot be null")
      mod_assert.ok(_.country && _.country !== null, "argument '_.country' cannot be null")
      mod_assert.ok(_.url_country_flag, "argument '_.url_country_flag' cannot be null")
      mod_assert.ok(_.clubs && _.clubs !== null, "argument '_.clubs' cannot be null")
      mod_assert.ok(_.players && _.players !== null, "argument '_.players' cannot be null")
      mod_assert.ok(_.total_market_value && _.total_market_value !== null, "argument '_.total_market_value' cannot be null")
      mod_assert.ok(_.mean_market_value && _.mean_market_value !== null, "argument '_.mean_market_value' cannot be null")
      
      const {value:total_market_value, unit:total_market_value_unit, currency:total_market_value_currency} = rValueAsExpected({value:_.total_market_value}) 
      const {value:mean_market_value, unit:mean_market_value_unit, currency:mean_market_value_currency} = rValueAsExpected({value:_.mean_market_value})
						
      return {
				league_id: opts.league_id,
        league_name: _.league_name.trim(),
        country: _.country.trim(),
        url_flag_country: _.url_country_flag,
        clubs: _.clubs,
        players: _.players,
        total_market_value,
        total_market_value_unit,
        total_market_value_currency,
        mean_market_value,
        mean_market_value_unit,
        mean_market_value_currency,
        continent: _.continent,
        url_teams: _.url_teams,
				url_logo: _.url_logo
      }
    }
		const filterLeague = opts.filter
    const url = `https://www.transfermarkt.com/schnellsuche/ergebnis/schnellsuche?query=${opts.name}&x=0&y=0`
    const data = []
		const funnelingData = (elm) => {
			if (filterLeague) {
				for (const k in filterLeague) {
					if (filterLeague.hasOwnProperty(k)) {
						if (filterLeague[k] !== elm[k]) return false
				  }
				}
			}
			return true
		}
		
		if (opts.filter) { delete opts.filter } 
		
    mod_axios(url)
      .then(response => {
        const html = response.data
        const $ = mod_cheerio.load(html)
        const elemSelector = 'table > tbody > tr'
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
        return cb(null, data.filter(funnelingData))
      })
      .catch((error) => {
        mod_assert.isNotOk(error,'Promise error')
      })
	}
  
  parseTeam(opts, cb) {
		mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function")
    mod_assert.ok(typeof opts === 'object' && opts !== null, "argument 'opts' must be an object")
		mod_assert.ok(opts.league_id, "argument 'opts.league_id' cannot be null")
		mod_assert.ok(opts.url_teams, "argument 'opts.url_teams' cannot be null")
		mod_assert.ok(typeof opts.url_teams === 'string', "argument 'opts.url_teams' must be a string")
      
    const rDataAsExpected = (_) => {
      mod_assert.ok(typeof _ === 'object' && _ !== null, "argument 'opts' must be an object")
      mod_assert.ok(_.url_players && _.url_players !== null, "argument 'opts.url_players' cannot be null")
      mod_assert.ok(_.url_logo && _.url_logo !== null, "argument 'opts.url_logo' cannot be null") 
      mod_assert.ok(_.name && _.name !== null, "argument 'opts.name' cannot be null")
      mod_assert.ok(_.short_name && _.short_name !== null, "argument 'opts.short_name' cannot be null")
      mod_assert.ok(_.squad && _.squad !== null, "argument 'opts.squad' cannot be null")
      mod_assert.ok(_.average_age && _.average_age !== null, "argument 'opts.average_age' cannot be null")
      mod_assert.ok(_.foreigners && _.foreigners !== null, "argument 'opts.foreigners' cannot be null")
      mod_assert.ok(_.total_market_value && _.total_market_value !== null, "argument 'opts.total_market_value' cannot be null")
      mod_assert.ok(_.mean_market_value && _.mean_market_value !== null, "argument 'opts.mean_market_value' cannot be null")

      const {value:total_market_value, unit:total_market_value_unit, currency:total_market_value_currency} = rValueAsExpected({value:_.total_market_value}) 
      const {value:average_market_value_player, unit:average_market_value_player_unit, currency:average_market_value_player_currency} = rValueAsExpected({value:_.mean_market_value})

      return {
				league_id: opts.league_id,
				country: opts.country.trim(),
				team_id: null,
        name: _.name.trim(),
        short_name: _.short_name.trim(),
        total_market_value,
        total_market_value_unit,
        total_market_value_currency,
        average_market_value_player,
        average_market_value_player_unit,
        average_market_value_player_currency,
        url_logo: _.url_logo,
        url_players: _.url_players,
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
          'mean_market_value',
          'total_market_value',
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
      .catch((error) => {
        mod_assert.isNotOk(error,'Promise error')
      })
  }

  parsePlayer(opts, cb) {
    mod_assert.ok(typeof cb === 'function', "argument 'cb' must be a function")
    mod_assert.ok(typeof opts === 'object' && opts !== null, "argument 'opts' must be an object")
		mod_assert.ok(typeof opts.url_players === 'string' && opts.url_players !== null, "argument 'opts.players' must be an string")
		mod_assert.ok(typeof opts.team_id === 'number' && opts.team_id !== null, "argument 'opts.team_id' must be an string")

    const rDataAsExpected = (_) => {
      mod_assert.ok(typeof _ === 'object' && _ !== null, "argument 'opts' must be an object")
      mod_assert.ok(_.number && _.number !== null, "argument 'opts.number' cannot be null")
      mod_assert.ok(_.irrelevant && _.irrelevant !== null, "argument 'opts.irrelevant' cannot be null")
      mod_assert.ok(_.name && _.name !== null, "argument 'opts.name' cannot be null") 
      mod_assert.ok(_.birth_date && _.birth_date !== null, "argument 'opts.birth_date' cannot be null")
			      
			if (_.market_value === null) {
				_.market_value = '€0.0m'
			}
      
      const {value:market_value, unit:market_value_unit, currency:market_value_currency} = rValueAsExpected({value:_.market_value}) 
      
      return {
        team_id: opts.team_id,
        name: _.name.trim(),
        number: _.number.trim(),
        position: postDeduction(_.irrelevant.trim()),
        birth_date: formatBirthDate(_.birth_date.trim()),
        market_value,
        market_value_unit,
        market_value_currency,
        last_update: knex.fn.now()
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
          'number',
          'irrelevant',
          'name',
          'birth_date',
          'market_value',
          'sdfsdf'
        ]

        $(elemSelector).each((parentIdx, parentElem) => {
          let keyIdx = 0
          const playerObj = {}
          const uniq = {}

          $(parentElem).children().each((childIdx, childElem) => {
            const tdValue = $(childElem).text()
            const tdValueDivNumber = $(childElem).find('td.zentriert.rueckennummer.bg_Torwart > div').text()
            
            if(tdValue && !uniq[getHash(tdValue)]) {
              uniq[getHash(tdValue)] = true
              playerObj[rawKeys[keyIdx]] = tdValue.trim()
              keyIdx++
            }
            
            if(tdValueDivNumber && !uniq[getHash(tdValueDivNumber)]) {
              uniq[getHash(tdValueDivNumber)] = true
              playerObj[rawKeys[keyIdx]] = tdValueDivNumber.trim()
              keyIdx++
            }
          })
          data.push(rDataAsExpected(playerObj))
        })
        
        return cb(null, data)
      })
      .catch((error) => {
        console.log(error)
        mod_assert.isNotOk(error,'Promise error')
      })
  }
}

/**
 * Module export
 * @public
 */

module.exports = new WScrapper()
