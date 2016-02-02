/**
 * Serves logs for every API endpoint, as well as the root
 */

var logs = require('express').Router();
var db;

logs.get('/:endpoint?/logs', getLogs);

function getLogs(req, res) {
	if (req.params.endpoint) {
		single('endpoint:'+req.params.endpoint, function(data) {
			res.json(data);
		});
	}

	else {
		all(function(data) {
			res.json(data);
		});
	}
}

function single(key, cb) {
	db.lrange(key, 0, -1, function(err, reply) {
		if (!err) {
			cb({logs: reply.map(function(stringified) {
				return JSON.parse(stringified);
			})});
		}
	});
}

function all(cb) {
	endpoints(function(keys) {
		var result = {logset: []};
		var counter = 0;

		keys.forEach(function(key) {
			single(key, function(single) {
				result.logset.push({
					endpoint: keyToEndpoint(key),
					logs: single.logs
				});
				count();
			});
		});

		function count() {
			// Could also use a promise library instead of a counter
			counter++;
			if (counter === keys.length) cb(result);
		}
	});
}

function keyToEndpoint(key) {
	return key.replace('endpoint:', '');
}

function endpoints(cb) {
	var cursor = 0;
	var keys = [];

	scan();

	function scan() {
		db.scan(cursor, 'MATCH', 'endpoint:*', 'COUNT', '1000', function(err, res) {
			if (err) throw err;
			cursor = res[0];

			if (res[1].length > 0) {
				keys = keys.concat(res[1]);
			}

			if (cursor !== '0') scan();
			// TODO make sure they're unique
			else cb(keys);
		});
	}
}

module.exports = function(redisClient) {
	db = redisClient;
	return logs;
};