var

sys = require('sys'),
url = require('url'),
http = require('http'),
path = require('path'),

// Create the http server
server = http.createServer(function(req, res) {
	
	var urlData = url.parse(req.url, true);
	if (urlData.pathname === '') {
		urlData.pathname = '/';
	}
	var uriSegments = urlData.pathname.split('/');
	
	switch (uriSegments[1]) {
		case '':
			server.ok(res, null, 'Server is ready.');
		break;
		// Handle loading the core
		case 'core':
			var headers = {
				'Content-Type': 'application/javascript'
			};
			server.ok(res, headers, '/* Loading the polyfill.js core. */');
		break;
		// Handle loading polyfills
		case 'polyfill':
			var headers = {
				'Content-Type': 'application/javascript'
			};
			server.ok(res, headers, [
				'/*',
				'  Loading the following polyfills:',
				'    ' + (urlData.querystring.which || ''),
				' */'
			].join('\n');
		break;
		default:
			server.notFound(res, null, 'Unknown route ' + urlData.pathname);
		break;
	}
	
});

// Start listening
var port = process.env.PORT || 3000;
server.listen(port, function() {
	sys.puts('Listening on port ' + port);
});

// ----------------------------------------------------------------------------
//  Helpers

function createHeadersObject(headers) {
	var result = {
		'Content-Type': 'text/plain'
	};
	if (headers) {
		for (var i in headers) {
			if (headers.hasOwnProperty(i)) {
				result[i] = headers[i];
			}
		}
	}
	return result;
};

// Sends an HTTP response
server.respond = function(res, status, headers, body) {
	res.writeHead(status,
		createHeadersObject(headers)
	);
	res.write(body);
	res.end();
};

// Sends a 200 OK
server.ok = function(res, headers, body) {
	server.respond(res, 200, headers, body);
};

// Sends a 404 Not Found
server.notFound = function(res, headers, body) {
	server.respond(res, 404, headers, body);
};

/* End of file server.js */
