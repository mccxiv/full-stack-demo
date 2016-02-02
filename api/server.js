var redis = require('redis');
var express = require('express');
var args = require('yargs').argv;

var API_VERSION = 'v1';

var app = express();
var db = redis.createClient(args['redis-port'], args['redis-address']);
var api = require('./lib/api.js');             // Serve data
var logger = require('./lib/logger.js')(db);   // Log requests
var logs = require('./lib/logs.js')(db);       // Serve access logs
var base = '/' + API_VERSION;

// TODO https
app.listen(80);
app.use(base, [logger, logs, api]);
app.get('/', (req, res) => res.send('API located at ' + base));