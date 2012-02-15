// Clear old cache files
(require('./clear-cache')());

var

// Needed modules
fs = require('fs'),
url = require('url'),
ejs = require('ejs'),
util = require('util'),
http = require('http'),
path = require('path'),
gzip = require('gzip'),
mime = require('mime'),
crypto = require('crypto'),
uglify = require('uglify-js'),
bufferjs = require('bufferjs'),

// Load the config
conf = require('./config'),

// File path constants
CLIENT_PATH = path.join(__dirname, '../client'),
POLYFILL_PATH = path.join(CLIENT_PATH, 'polyfills'),
POLYFILL_CACHE_PATH = path.join(CLIENT_PATH, 'polyfill-cache'),
RESOURCE_PATH = path.join(CLIENT_PATH, 'resources');
CORE_FILE = 'core.js',
MIN_EXT = '.min',
GZIP_EXT = '.gz',

// The request handle ID
nextId = 1000,

// Create the http server
server = http.createServer(function(req, res) {
	
	var handle = {
		id: nextId++,
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
	
	// Log the request
	util.puts('[' + handle.id + '] HTTP ' + req.method + ' ' + req.url + ' (for ' + req.client.remoteAddress + ')');
	
	switch (handle.url.segments[1]) {
		case '':
			fs.readdir(POLYFILL_PATH, function(err, files) {
				if (err) {
					return handle.error(err);
				}
				var welcome = path.join(__dirname, 'welcome.ejs');
				fs.readFile(welcome, function(err, data) {
					if (err) {
						return handle.error(err);
					}
					var body = ejs.render(String(data), {
						locals: {
							files: files
						}
					});
					handle.responseHeaders['Content-Type'] = 'text/html';
					server.ok(handle, body);
				});
			});
		break;
		
		// Handle loading the core
		case 'core':
			var parseVars = {
				baseurl: conf.baseUrl,
				polyfills: fs.readFileSync(
					path.join(CLIENT_PATH, 'polyfills.js')
				)
			};
			loadJavaScriptFile(CORE_FILE, CLIENT_PATH, CLIENT_PATH, parseVars, function(err, data) {
				if (err) {
					return handle.error(err[0], err[1]);
				}
				// Get the ETag value
				var etag = hash('sha1', data).substring(0, 7);
				// Send a 304 if no changes were made
				var ifNoneMatch = handle.req.headers['if-none-match'] || null;
				if (ifNoneMatch === etag) {
					return server.notModified(handle);
				}
				// If there were changes, send a new ETag header
				handle.responseHeaders['ETag'] = etag;
				// If it needs gzip, handle that...
				if (supportsGzip(handle)) {
					gzipJavaScriptFile(data, CORE_FILE, CLIENT_PATH, function(err, data) {
						if (err) {
							return handle.error(err[0], err[1]);
						}
						handle.isJavaScript();
						server.ok(handle, data);
					});
				} else {
					handle.isJavaScript();
					server.ok(handle, data);
				}
			}); 
		break;
		
		// Handle loading polyfills
		case 'polyfill':
			if (! (handle.url.query.p && handle.url.query.p.length)) {
				return server.notFound(handle, '// Error 404: Not Found\n// No polyfills given');
			}
			var id = handle.url.query.id;
			var polyfills = handle.url.query.p.split(',').sort();
			var cacheFile = polyfills.join(',') + '.js';
			var content = '';
			(function getNext() {
				var next = safePath(polyfills.shift());
				if (! path.existsSync(path.join(POLYFILL_PATH, next) + '.js')) {
					return server.notFound(handle, '// Error 404: Not Found\n// Polyfill "' + next + '" does not exist');
				}
				loadJavaScriptFile(next + '.js', POLYFILL_PATH, POLYFILL_CACHE_PATH, function(err, data) {
					if (err) {
						return handle.error(err[0], err[1]);
					}
					content += String(data) + ';Polyfill.loaded("' + next + '");';
					if (polyfills.length) {
						getNext();
					} else {
						content += ';Polyfill.done(' + id + ');';
						// Get the ETag value
						var etag = hash('sha1', content).substring(0, 7);
						// Send a 304 if no changes were made
						var ifNoneMatch = handle.req.headers['if-none-match'] || null;
						if (ifNoneMatch === etag) {
							return server.notModified(handle);
						}
						// If there were changes, send a new ETag header
						handle.responseHeaders['ETag'] = etag;
						// Compress the content
						content = uglify(content);
						if (supportsGzip(handle)) {
							gzipJavaScriptFile(content, cacheFile, POLYFILL_CACHE_PATH, function(err, data) {
								if (err) {
									return handle.error(err[0], err[1]);
								}
								handle.isJavaScript();
								server.ok(handle, data);
							});
						} else {
							handle.isJavaScript();
							server.ok(handle, content);
						}
					}
				});
			}());
		break;
		
		// Resource file
		case 'resource':
			if (! handle.url.query.f) {
				return server.notFound(handle, 'Error 404: Not Found\nNo file given');
			}
			var file = path.join(RESOURCE_PATH, safePath(handle.url.query.f));
			fs.readFile(file, function(err, data) {
				if (err) {
					return handle.error(err);
				}
				var etag = hash('sha1', data.toString('base64')).substring(0, 7);
				var ifNoneMatch = handle.req.headers['if-none-match'] || null;
				if (ifNoneMatch === etag) {
					return server.notModified(handle);
				}
				handle.responseHeaders['Content-Type'] = mime.lookup(file);
				handle.responseHeaders['ETag'] = etag;
				if (supportsGzip(handle)) {
					gzip(data, 9, function(err, data) {
						if (err) {
							return handle.error(err, 'Error: Could not gzip resource');
						}
						server.ok(handle, data);
					});
				} else {
					server.ok(handle, data);
				}
			});
		break;
		
		// Unknown route
		default:
			server.notFound(handle, 'Unknown route ' + handle.url.pathname);
		break;
	}
	
});

// Start listening
server.listen(conf.port, function() {
	util.puts('Listening on port ' + conf.port);
});

// ----------------------------------------------------------------------------
//  Helpers

// Check if the client supports gziping
function supportsGzip(handle) {
	if (! conf.gzip) {
		handle.gzipSupport = false;
	}
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

// Make sure a path contains no ..
function safePath(file) {
	return file.split('/').filter(function(segment) {
		return (segment !== '..');
	}).join('/');
};

// Log an error
function logError(error) {
	util.puts('[E] ' + error);
	console.trace();
};

// Log an error and respond to the client
function handleError(handle, error, msg) {
	logError(error);
	server.internalError(handle, msg);
};

// Do file gzipping and storage
function gzipJavaScriptFile(ugly, file, cacheDir, after) {
	// File paths
	var gzFile = path.join(cacheDir, file) + MIN_EXT + GZIP_EXT;
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
			fs.readFile(gzFile, function(err, data) {
				if (err) {
					return after([err, 'Error: Could not read ' + file + '.min.gz']);
				}
				after(null, data);
			});
		}
	});
}

// Load a JavaScript file
function loadJavaScriptFile(file, sourceDir, cacheDir, parseVars, after) {
	// File paths
	var srcFile = path.join(sourceDir, file);
	var minFile = path.join(cacheDir, file) + MIN_EXT;
	// Check for variables given
	if (after === void(0)) {
		after = parseVars;
		parseVars = null;
	}
	// Check if the minified file already exists
	path.exists(minFile, function(exists) {
		var ugly;
		// Minify the original source if not yet done...
		if (! exists) {
			try {
				var orig = String(
					fs.readFileSync(srcFile)
				);
				// Parse the data if needed
				if (parseVars) {
					orig = ejs.render(orig, {
						locals: parseVars
					});
				}
				ugly = uglify(orig);
				// Write to the cache file
				if (! path.existsSync(cacheDir)) {
					fs.mkdirSync(cacheDir, 0777);
				}
				fs.writeFileSync(minFile, ugly);
			} catch (err) {
				return after([err, 'Error: Could not uglify ' + file]);
			}
		}
		// ...or read the already minified source
		else {
			try {
				ugly = fs.readFileSync(minFile);
			} catch (err) {
				return after([err, 'Error: Could not read ' + file + '.min']);
			}
		}
		after(null, ugly);
	});
};

// Hash a string
function hash(alg, str) {
	var hashsum = crypto.createHash(alg);
	// Add the string data
	hashsum.update(str);
	return hashsum.digest('hex');
};

// ----------------------------------------------------------------------------
//  Shortcut functions for sending server responses

// Sends an HTTP response
server.respond = function(handle, status, body) {
	handle.res.writeHead(status, handle.responseHeaders);
	if (status < 300 || status >= 400) {
		handle.res.write(body);
	}
	handle.res.end();
	// Log the response
	util.puts('[' + handle.id + ']  Response - HTTP ' + status);
};

// Sends a 200 OK
server.ok = function(handle, body) {
	server.respond(handle, 200, body);
};

// Sends a 304 Not Modified
server.notModified = function(handle) {
	server.respond(handle, 304);
};

// Sends a 404 Not Found
server.notFound = function(handle, body) {
	server.respond(handle, 404, body);
};

// Sends a 500 Internal Server Error
server.internalError = function(handle, body) {
	server.respond(handle, 500, body);
};

/* End of file server.js */
