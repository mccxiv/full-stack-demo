/**
 * Saves access logs to the database.
 * Logs all top level endpoints
 */

var logger = require('express').Router();
var db;

// Log all top level endpoints, including /logs
logger.get('/:endpoint', log);

function log(req, res, next) {
	// Save the param here as it is no longer accessible inside the `end` event.
	var endpoint = req.params.endpoint;
	req.on('end', function() {
		var key = 'endpoint:'+endpoint;
		var value = JSON.stringify({
			ip: req.ip || req.headers['x-forwarded-for'],
			timestamp: Math.floor(new Date() / 1000),
			status: res.statusCode
		});
		db.rpush(key, value);
	});
	next();
}

module.exports = function(redisClient) {
	db = redisClient;
	return logger;
};