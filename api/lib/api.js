/**
 * Currently only serves /hello-world
 */

var api = require('express').Router();

api.get('/', root);
api.get('/hello-world', helloWorld);
api.get('/*', error);

function root(req, res) {
	res.json({});
}

function helloWorld(req, res) {
	res.json({message: 'hello world'});
}

function error(req, res) {
	res.status(404).json({error: 'Not Found'});
}

module.exports = api;