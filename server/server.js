var

// Needed modules
fs = require('fs'),
sys = require('sys'),
url = require('url'),
http = require('http'),
path = require('path'),
gzip = require('gzip'),
uglify = require('uglify-js'),

// File path constants
CLIENT_PATH = path.join(__dirname, '../client'),
POLYFILL_PATH = path.join(CLIENT_PATH, 'polyfills'),
POLYFILL_CACHE_PATH = path.join(CLIENT_PATH, 'polyfill-cache'),
CORE_FILE = 'core.js',
MIN_EXT = '.min',
GZIP_EXT = '.gz',

// Create the http server
server = http.createServer(function(req, res) {
	
	var handle = {
		req: req,
		res: res,
		url: (function() {
			var urlData = url.parse(req.url, true);
			if (urlData.pathname === '') {
				urlData.pathname = '/';
			}
			urlData.segments = urlData.pathname.split('/');
			return urlData;
		}()),
		responseHeaders: {
			'content-type': 'text/plain'
		},
		isJavaScript: function() {
			handle.responseHeaders['content-type'] = 'application/javascript';
		},
		gzipSupport: null,
		isGzip: function() {
			handle.gzipSupport = true;
			handle.responseHeaders['content-encoding'] = 'gzip';
		},
		error: function(err, msg) {
			handleError(handle, err, msg);
		}
	};
	
	switch (handle.url.segments[1]) {
		case '':
			server.ok(handle, [
				'Server is ready.',
				'',
				'To use polyfill.js, load http://polyfill.herokuapps.com/core in your website, eg.',
				'',
				'  <script type="text/javascript" src="http://polyfill.herokuapps.com/core"></script>',
				'',
				'Then, in your JavaScript, tell the system which features you need, like so:',
				'',
				'  Polyfill.needs("json", "placeholder", "storage");',
				'',
				'You can call Polyfill.needs multiple times, but each call will create a new HTTP request,',
				'so combining them into a single call is most efficient.',
				'',
				'Alternately, you can also load ALL appropriate polyfills for the current browser by calling',
				'Polyfill.needs("*"), but this is not suggested as it may load code you do not need.',
				'',
				'Enjoy using polyfill.js :)'
			].join('\n'));
		break;
		
		// Handle loading the core
		case 'core':
			loadJavaScriptFile(handle, CORE_FILE, CLIENT_PATH, CLIENT_PATH, function(err, data) {
				if (err) {
					handle.error(err[0], err[1]);
				}
				handle.isJavaScript();
				server.ok(handle, data);
			}); 
		break;
		
		// Handle loading polyfills
		case 'polyfill':
			var neededPolyfills = (urlData.query.which || '').split(',');
			server.ok(handle, 'application/javascript', [
				'/*',
				'  Loading the following polyfills:',
				'    ' + (urlData.query.which || ''),
				' */'
			].join('\n'));
		break;
		
		// Unknown route
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

// Check if the client supports gziping
function supportsGzip(handle) {
	if (handle.gzipSupport === null) {
		(function() {
			var encodings = handle.req.headers['accept-encoding'] || '';
			encodings = encodings.split(',');
			for (var i = 0, c = encodings.length; i < c; i++) {
				if (encodings[i].trim() === 'gzip') {
					handle.gzipSupport = true;
					return;
				}
			}
			handle.gzipSupport = false;
		}());
	}
	return handle.gzipSupport;
};

// Log an error
function logError(error) {
	sys.puts('[E ' + Date() + '] ' + error);
};

// Log an error and respond to the client
function handleError(handle, error, msg) {
	logError(error);
	server.internalError(handle, msg);
};

// Load a JavaScript file
function loadJavaScriptFile(handle, file, sourceDir, cacheDir, after) {
	// File paths
	var srcFile = path.join(sourceDir, file);
	var minFile = path.join(cacheDir, file) + MIN_EXT;
	var gzFile  = minFile + GZIP_EXT;
	// Check if the minified file already exists
	path.exists(minFile, function(exists) {
		var ugly;
		// Minify the original source if not yet done...
		if (! exists) {
			try {
				var orig = fs.readFileSync(srcFile);
				ugly = uglify(String(orig));
				fs.writeFileSync(minFile, ugly);
			} catch (err) {
				return after([err, 'Error: Could not uglify core.js']);
			}
		}
		// ...or read the already minified source
		else {
			try {
				ugly = fs.readFileSync(minFile);
			} catch (err) {
				return after([err, 'Error: Could not read core.js.min']);
			}
		}
		// If it needs gzip, handle that...
		if (supportsGzip(handle)) {
			path.exists(gzFile, function(exists) {
				if (! exists) {
					// Gzip the source
					gzip(ugly, 9, function(err, data) {
						if (err) {
							return after([err, 'Error: Could not gzip source code']);
						}
						after(null, String(data));
					});
				} else {
					fs.readFile(gzFile, function(err, data) {
						if (err) {
							return after([err, 'Error: Could not read core.js.min.gz']);
						}
						after(null, String(data));
					});
				}
			});
		}
		// ...otherwise, continue with basic minified
		else {
			after(null, ugly);
		}
	});
};

// ----------------------------------------------------------------------------
//  Shortcut functions for sending server responses

// Sends an HTTP response
server.respond = function(res, status, headers, body) {
	res.writeHead(status, headers);
	res.write(body);
	res.end();
};

// Sends a 200 OK
server.ok = function(handle, body) {
	server.respond(handle.res, 200, handle.responseHeaders, body);
};

// Sends a 404 Not Found
server.notFound = function(handle, body) {
	server.respond(handle.res, 404, handle.responseHeaders, body);
};

// Sends a 500 Internal Server Error
server.internalError = function(handle, body) {
	server.respond(handle.res, 500, handle.responseHeaders, body);
};

/* End of file server.js */
