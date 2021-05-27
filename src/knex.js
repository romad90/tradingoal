'use strict'

/**
 * Modules dependencies
 * @private
 *
 */
const propertiesReader = require('properties-reader')
const properties = propertiesReader('properties.file')
const opts = {
	client: 'mysql2',
	connection: {
		connectionLimit: properties.get('mysql.connectionLimit'),
		host : properties.get('mysql.host'),
		port : properties.get('mysql.port'),
		user : properties.get('mysql.user'),
		password : properties.get('mysql.password'),
		database : properties.get('mysql.database')
	}
}
	
module.exports = require('knex')(opts)
