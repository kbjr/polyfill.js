
var client     = require('./client');
var config     = require('../config');
var Request    = require('./request');
var templates  = require('./templates');

// 
// The main request handler
// 
// @param {req} the request object
// @param {res} the response object
// @return void
// 
exports = module.exports = function(req, res) {
	var request = new Request(req, res);

	switch (request.url.pathname) {
		// Show the welcome message
		case '/':
			var polyfills = client.listPolyfills();
			var content = templates.render('welcome', {
				polyfills: polyfills,
				baseurl: config.baseUrl
			});

			request.ok('text/html', content);
		break;

		// 
		case '/core':
			// 
		break;

		// 
		case 'polyfill':
			// 
		break;

		// 
		case 'resource':
			// 
		break;

		// Send a 404
		default:
			request.notfound();
		break;
	}
};
