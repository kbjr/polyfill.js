
var fs          = require('fs');
var path        = require('path');
var zlib        = require('zlib');
var crypto      = require('crypto');
var config      = require('../config');
var uglify      = require('uglify-js');
var handlebars  = require('handlebars');
var Promise     = require('promise-es6').Promise;

// 
// The in-memory cache for compiled client code
// 
var cache = { };

// 
// We store a list of all registered polyfills here
// 
var polyfills = null;

// 
// Lookup a module in the cache, or, failing that, create a new module instance
// 
// @param {modules} the modules to look for
// @return object
// 
exports.lookup = function(modules) {
	modules.sort();
	modules = modules.join(',');

	if (! cache[modules]) {
		cache[modules] = new Module(modules);
	}

	return cache[modules];
};

// 
// Get a list of all registered polyfills available in the system
// 
// @return array
// 
exports.listPolyfills = function() {
	if (! polyfills) {
		polyfills = fs.readdirSync(clientPath('polyfills'));
		polyfills = polyfills.map(function(file) {
			return file.split('.').slice(0, -1).join('.');
		});
	}

	return polyfills;
};

// -------------------------------------------------------------

// 
// Get the client core code
// 
// @param {opts} options
// @return promise
// 
exports.getCore = function(opts) {
	return exports.getPolyfills(['core'], opts);
};

// 
// Get polyfill code
// 
// @param {polyfills} an array of polyfill names
// @param {opts} options
// @return promise
// 
exports.getPolyfills = function(polyfills, opts) {
	var module = exports.lookup(polyfills);
	var content = opts.gzip ? module.getGzipped() : module.getCompiled();

	return content.then(function(content) {
		return {
			hash: module.hash,
			content: content
		};
	});
};

// -------------------------------------------------------------

// 
// The main Module constructor to be stored in cache
// 
// @param {modules} a list (string, comma delimited) of modules
// 
function Module(modules) {
	this.modules     = (modules === 'core') ? 'core' : modules.split(',');
	this.moduleList  = modules;
	this.source      = null;
	this.compiled    = null;
	this.gzipped     = null;
	this.hash        = null;
};

// 
// Fetch the fully expanded/annotated source for the modules
// 
// @return promise
// 
Module.prototype.fetchSource = function() {
	var self = this;

	log('Fetching source for ' + this.moduleList);

	if (this.modules === 'core') {
		return Promise.all([ fetchSourceFile('core.js'), fetchSourceFile('polyfills.js') ])
			.then(function(content) {
				var core = content[0];
				var roster = content[1];

				core = handlebars.compile(core);

				// Compile variables into core
				self.source = core({
					baseurl: config.baseUrl,
					polyfills: roster
				});
				self.hash = hash(self.source);
			});
	}

	return Promise.all(this.modules.map(fetchPolyfillSource))
		.then(function(modules) {
			modules = modules.map(function(source, index) {
				return source + ';Polyfill.loaded("' + self.modules[index] + '");';
			});

			self.source = modules.join('\n;');
			self.hash = hash(self.source);
		});
};

// 
// Get the fully expanded/annotated source for the modules
// 
// @return promise
// 
Module.prototype.getSource = function() {
	var self = this;

	if (this.source) {
		return Promise.resolve(this.source);
	}

	return this.fetchSource()
		.then(function() {
			return self.source;
		});
};

// 
// Compile the source code using uglify-js
// 
// @return promise
// 
Module.prototype.compile = function() {
	var self = this;

	log('Compiling source for ' + this.moduleList);
	return this.getSource()
		.then(function(source) {
			self.compiled = uglify.minify(source, { fromString: true }).code;
		});
};

// 
// Get the compiled source for the modules
// 
// @return promise
// 
Module.prototype.getCompiled = function() {
	var self = this;

	if (this.compiled) {
		return Promise.resolve(this.compiled);
	}

	return this.compile()
		.then(function() {
			return self.compiled;
		});
};

// 
// Gzip the compiled code to get a final product
// 
// @return promise
// 
Module.prototype.gzip = function() {
	var self = this;

	log('Gzipping compiled source for ' + this.moduleList);
	return this.getCompiled()
		.then(function(compiled) {
			return gzip(compiled);
		})
		.then(function(gzipped) {
			self.gzipped = gzipped;
		});
};

// 
// Get the gzipped source for the modules
// 
// @return promise
// 
Module.prototype.getGzipped = function() {
	var self = this;

	if (this.gzipped) {
		return Promise.resolve(this.gzipped);
	}

	return this.gzip()
		.then(function() {
			return self.gzipped;
		});
};

// -------------------------------------------------------------

// 
// 
// 
function clientPath(file) {
	return path.join(__dirname, '../client', file);
}

// 
// 
// 
function fetchSourceFile(file) {
	return new Promise(function(resolve, reject) {
		fs.readFile(clientPath(file), 'utf8', function(err, content) {
			if (err) {
				return reject(err);
			}

			resolve(content);
		});
	});
}

// 
// 
// 
function fetchPolyfillSource(polyfill) {
	return fetchSourceFile('polyfills/' + polyfill + '.js');
}

// 
// Gzip a content string
// 
// @param {content} the content to gzip
// @return promise
// 
function gzip(content) {
	return new Promise(function(resolve, reject) {
		zlib.gzip(content, { level: 9 }, function(err, result) {
			if (err) {
				return reject(err);
			}

			resolve(result);
		});
	});
}

// 
// Hash the given content using SHA1
// 
// @param {content} the string to hash
// @return string
// 
function hash(content) {
	var shasum = crypto.createHash('sha1');

	shasum.update(content);
	return shasum.digest('hex');
}

// 
// 
// 
function log(message) {
	if (config.compilerLogging) {
		console.log('[COMP] ' + message);
	}
}
