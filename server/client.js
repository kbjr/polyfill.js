
var fs          = require('fs');
var path        = require('path');
var config      = require('../config');
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
// 
// 
exports.buildCore = function() {
	var core = cache.lookup('core');

	return core.getSource()
		.then(function(source) {
			// 
		});
};

// -------------------------------------------------------------

// 
// The main Module constructor to be stored in cache
// 
// @param {modules} a list (string, comma delimited) of modules
// 
function Module(modules) {
	this.modules   = (modules === 'core') ? 'core' : modules.split(',');
	this.source    = null;
	this.compiled  = null;
	this.gzipped   = null;
};

// 
// Fetch the fully expanded/annotated source for the modules
// 
// @return promise
// 
Module.prototype.fetchSource = function() {
	var self = this;

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
			});
	}

	return Promise.all(this.modules.map(fetchPolyfillSource))
		.then(function(modules) {
			self.source = modules.join('\n;');
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
