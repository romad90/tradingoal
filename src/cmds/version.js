'use strict'

/**
 * Module dependencies
 * @private
 */
const { version } = require('../../package.json')

/**
 * Module export
 * @public
 */
module.exports = (args) => {
	console.log(`v${version}`)
}