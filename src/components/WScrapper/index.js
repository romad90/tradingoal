'use strict'

/**
 * Modules dependencies
 * @private
 */

const assert = require('assert').strict
const axios = require('axios')
const cheerio = require('cheerio')

/**
 * Modules variables
 * @private
 */

const logger = require('../../logger')

/**
 *
 */

class WScrapper {
  constructor() {
		logger.info('inside WScrapper')
  }
	
	parseLeague(opts = {name: 'Premier League'}) {
		assert.ok(typeof opts === 'object' && opts !== null, "argument 'opts' must be an object")
		assert.ok(typeof opts.name === 'string' && opts.name !== null, "argument 'opts.name' must be an string")
		
    const url = `https://www.transfermarkt.com/schnellsuche/ergebnis/schnellsuche?query=${opts.name}&x=0&y=0`

    axios(url)
      .then(response => {
        const html = response.data
        const $ = cheerio.load(html)
        const elemSelector = '#yw2 > table > tbody > tr'
        const keys = [
          'src_img',
          'competition',
          'country',
          'clubs',
          'players',
          'total_market_value',
          'mean_market_value',
          'continent'
        ]
        
        $(elemSelector).each((parentIdx, parentElem) => {
          let keyIdx = 0
          const leagueObj = {}

          $(parentElem).children().each((childIdx, childElem) => {
            const tdValue = $(childElem).text()
            
            if (tdValue) {
              leagueObj[keys[keyIdx]] = tdValue
            } else if ($(childElem).find('img.flaggenrahmen').prop('title')) {
              leagueObj[keys[keyIdx]] = $(childElem).find('img.flaggenrahmen').prop('title')
            } else {
              leagueObj[keys[keyIdx]] = $(childElem).find('img').prop('src')
            }
            keyIdx++
          })

          console.log(leagueObj)
        })
      })
      .catch(logger.error)
	}
}

module.exports = new WScrapper()
