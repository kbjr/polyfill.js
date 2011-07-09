// Clear old cache files
(require('./clear-cache')());

var

// Needed modules
fs = require('fs'),
sys = require('sys'),
url = require('url'),
http = require('http'),
path = require('path'),
gzip = require('gzip'),
uglify = require('uglify-js'),
bufferjs = require('bufferjs'),

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
			'Content-Type': 'text/plain'
		},
		isJavaScript: function() {
			handle.responseHeaders['Content-Type'] = 'application/javascript';
		},
		gzipSupport: null,
		isGzip: function() {
			handle.gzipSupport = true;
			handle.responseHeaders['Content-Encoding'] = 'gzip';
		},
		error: function(err, msg) {
			handleError(handle, err, msg);
		}
	};
	
	switch (handle.url.segments[1]) {
		case '':
			var body = [
				'Server is ready.',
				'',
				'To use polyfill.js, load http://polyfill.herokuapp.com/core in your website, eg.',
				'',
				'  <script type="text/javascript" src="http://polyfill.herokuapp.com/core"></script>',
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
				'Enjoy using polyfill.js :)',
				'',
				'',
				'Available Polyfills:',
				''
			];
			fs.readdir(POLYFILL_PATH, function(err, files) {
				if (! err) {
					for (var i = 0, c = files.length; i < c; i++) {
						var file = files[i].split('.');
						file.pop();
						body.push(' + ' + file);
					}
				}
				server.ok(handle, body.join('\n'));
			});
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
			var polyfills = (urlData.query.p || '').split(',').sort();
			var cacheFile = polyfills.join(',') + '.js';
			var content = null;
			(function getNext() {
				var next = polyfills.shift();
				loadJavaScriptFiles(handle, next + '.js', POLYFILL_PATH, POLYFILL_CACHE_PATH, function(err, data) {
					if (err) {
						handle.error(err[0], err[1]);
					} else {
						data = Buffer.concat(new Buffer(
							'Polyfill.loaded("' + next + '");'
						));
						if (content) {
							content = data;
						} else {
							content = Buffer.concat(content, data);
						}
					}
				});
			}());
		break;
		
		// Unknown route
		default:
			server.notFound(handle, 'Unknown route ' + handle.url.pathname);
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
					handle.isGzip();
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

// Shortcut for reading a file and casting to string
function readFile(file, after) {
	if (typeof after === 'function') {
		fs.readFile(file, function(err, data) {
			return after(err, data);
		});
	} else {
		return fs.readFileSync(file);
	}
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
				var orig = String(readFile(srcFile));
				ugly = uglify(orig);
				fs.writeFileSync(minFile, ugly);
			} catch (err) {
				return after([err, 'Error: Could not uglify core.js']);
			}
		}
		// ...or read the already minified source
		else {
			try {
				ugly = readFile(minFile);
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
						fs.writeFile(gzFile, data);
						after(null, data);
					});
				} else {
					// Read cached gzip source file
					readFile(gzFile, function(err, data) {
						if (err) {
							return after([err, 'Error: Could not read core.js.min.gz']);
						}
						after(null, data);
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
