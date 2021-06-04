'use strict'

/**
 * Module dependencies
 * @private
 *
 */

const config = require('config')

/**
 * Module variables
 * @private
 */

const opts = {
	client: 'mysql2',
	connection: {
		connectionLimit: config.get('mysql.connectionLimit'),
		host : config.get('mysql.host'),
		port : config.get('mysql.port'),
		user : config.get('mysql.user'),
		password : config.get('mysql.password'),
		database : config.get('mysql.database'),
		dateStrings: [
			'DATE',
		  'DATETIME'
		]
	},
	pool: {
		afterCreate: function (conn, done) {
			conn.query('SET time_zone="UTC";', function (err) {
				if (err) {
					return done(err, conn)
	      } 
				done(null, conn)
			})
		}
	}
}

/**
 * Module exports
 * @public
 */
module.exports = require('knex')(opts)
