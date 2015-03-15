
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
				baseurl: config.baseUrl,
				memory: JSON.stringify(process.memoryUsage(), null, '  ')
			});

			request.ok('text/html', content);
		break;

		// Load the client core
		case '/core':
			var gzip = request.supportsGzip();
			client.getCore({ gzip: gzip })
				.then(function(core) {
					request.ok('application/javascript', core.content, {
						gzipped: gzip,
						etag: core.hash
					});
				})
				.catch(function(err) {
					console.error(err && err.stack);
				});
		break;

		// Compile and return a polyfill package
		case '/polyfill':
			var gzip = request.supportsGzip();
			var polyfills = request.url.query.p.split(',');

			if (polyfills.some(isNotAlpha)) {
				return request.badRequest('Bad polyfill list format');
			}

			polyfills = unique(polyfills);

			client.getPolyfills(polyfills, { gzip: gzip })
				.then(function(polyfills) {
					request.ok('application/javascript', polyfills.content, {
						gzipped: gzip,
						etag: polyfills.hash
					});
				})
				.catch(function(err) {
					console.error(err && err.stack);
					if (err.message.indexOf('ENOENT, open') >= 0) {
						request.notfound();
					}
				});
		break;

		// Load a resource file
		case '/resource':
			// 
			// NOTE
			//   I may add this feature back if it ends up being needed for some polyfills,
			//   but for now, I don't see the need.
			// 
		break;

		// Send a 404
		default:
			request.notfound();
		break;
	}
};

// -------------------------------------------------------------

var notAlpha = /[^a-zA-Z]/;
function isNotAlpha(string) {
	return notAlpha.test(string);
}

function unique(arr) {
	var result = [ ];

	arr.forEach(function(value) {
		if (result.indexOf(value) < 0) {
			result.push(value);
		}
	});

	return result;
}
