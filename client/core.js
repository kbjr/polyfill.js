
(function(exports) {

	// The URL used to load resources
	var RESOURCE_URL = '{{ baseurl }}resource';
	
	// The URL used to load polyfills
	var POLYFILL_URL = '{{ baseurl }}polyfill';
	
	// Used for keeping track of requests
	var requests = [ ];
	
	// 
	// The list of polyfills.
	// This is inserted by the compiler from the file ./client/polyfills.js
	//
	var polyfills = {{{ polyfills }}};

// -------------------------------------------------------------
	
	// 
	// Test for support of features and load polyfills as needed
	// 
	// @param {polyfills} the polyfills needed by the app
	// @param {callback} an action to take after loading the polyfills
	// @return void
	// 
	exports.needs = function(polys, callback) {
		if (typeof polys === 'string') {
			polys = polys.split(',');
		}

		if (polys[0] === '*') {
			polys = keys(polyfills);
		}

		var needed = [ ];

		requestPolyfills(polys);

		needed = unique(needed);
		
		if (! needed.length) {
			if (typeof callback === 'function') {
				callback();
			}
			return;
		}

		if (typeof callback === 'function') {
			requests.push({
				needed: needed,
				callback: callback
			});
		}
		
		loadScript(exports.polyfillUrl(needed));

	// -------------------------------------------------------------

		function requestPolyfills(polys) {
			for (var i = 0, c = polys.length; i < c; i++) {
				requestPolyfill(polys[i].toLowerCase());
			}
		}

		function requestPolyfill(name) {
			var polyfill = polyfills[name];

			if (! polyfill) {
				throw new Error('Polyfill "' + name + '" not found');
			}

			switch (polyfill.state) {
				case 'untested':
					if (polyfill.test()) {
						polyfill.state = 'unneeded';
					} else {
						polyfill.state = 'loading';
						needed.push(polyfill.name);
						requestPolyfills(polyfill.prereqs);
					}
				break;
				case 'loading':
					needed.push(polyfill.name);
					requestPolyfills(polyfill.prereqs);
				break;
			}
		}
	};

// -------------------------------------------------------------

	// 
	// Runs when a script finishes loading
	// 
	// @param {poly} the polyfill to mark as loaded
	// @return void
	// 
	exports.loaded = function(poly) {
		polyfills[poly].state = 'loaded';
		exports.testCallbacks();
	};

	// 
	// Runs through the list of waiting requests and determines which ones
	// are ready, then calls those callbacks
	// 
	// @return void
	// 
	exports.testCallbacks = function() {
		for (var i = 0; i < requests.length; i++) {
			var req = requests[i];

			if (exports.areLoaded(req.needed)) {
				requests.splice(i--, 1)[0].callback();
			}
		}
	};

	// 
	// Tests if a given list of polyfills has been loaded
	// 
	// @param {polys} the polyfills to test
	// @return boolean
	// 
	exports.areLoaded = function(polys) {
		for (var i = 0, c = polys.length; i < c; i++) {
			if (polyfills[polys[i]].state !== 'loaded') {
				return false;
			}
		}
		return true;
	};

	//
	// Get the URL for the resource engine
	// 
	// @param {file} the resource file to load
	// @return string
	//
	exports.resourceUrl = function(file) {
		var url = RESOURCE_URL;
		if (file) {
			url += '?f=' + file;
		}
		return url;
	};
	
	//
	// Get the URL for the polyfill engine
	//
	// @param {polys} which polyfills need to be loaded
	// @return string
	//
	exports.polyfillUrl = function(polys) {
		var url = POLYFILL_URL;
		if (polys) {
			url += '?p=' + polys.join(',');
		}
		return url;
	};

	// 
	// IE Version Detection
	//
	exports.ie = (function(){
		var undef;
		var v = 3;
		var div = document.createElement('div');
		var all = div.getElementsByTagName('i');
		while (
			div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
			all[0]
		);
		return v > 4 ? v : undef;
	}());

// -------------------------------------------------------------

	//
	// Properties of the polyfills object below are of this constructor
	//
	var PolyfillObject = function(name, params) {
		this.name = name;

		//
		// The polyfill's current state. Possible states include:
		//   untested - Polyfill.needs() has not been called for this test
		//   unneeded - The test was run and the polyfill is not needed
		//   loading  - The polyfill is being loaded
		//   loaded   - The polyfill has been loaded
		//
		this.state = 'untested';

		//
		// The test function
		//
		this.test = makeTest(params.test);

		//
		// Any other prerequisite polyfills
		//
		this.prereqs = params.prereqs || [ ];
	};

	//
	// A factory for making test functions
	//
	// @param {func} the test function
	// @return function
	//
	function makeTest(func) {
		var flag = null;
		return function() {
			if (flag === null) {
				flag = func();
			}
			return flag;
		};
	};
	
	//
	// Process the list of polyfills
	//
	for (var i in polyfills) {
		if (polyfills.hasOwnProperty(i)) {
			polyfills[i] = new PolyfillObject(i, polyfills[i]);
		}
	}

// -------------------------------------------------------------
	
	// 
	// Quick and dirty Object.keys shim
	// 
	// @param {obj} the object to get keys of
	// @return array
	// 
	function keys(obj) {
		if (Object.keys) {
			return Object.keys(obj);
		}
		var keys = [ ];
		for (var i in obj) {
			if (obj.hasOwnProperty(i)) {
				keys.push(i);
			}
		}
		return keys;
	}

	// 
	// Get a unique copy of an array
	// 
	// @param {arr} the array
	// @return array
	// 
	function unique(arr) {
		var result = [ ];

		for (var i = 0, c = arr.length; i < c; i++) {
			var value = arr[i];

			if (result.indexOf(value) < 0) {
				result.push(value);
			}
		}

		return result;
	}

	// 
	// Inject a <script> tag into the document
	// 
	// @param {source} the src of the script
	// @return void
	// 
	function loadScript(source) {
		var script = document.createElement('script');
		var head = document.getElementsByTagName('head')[0];

		script.type = 'text/javascript';
		script.src = source;

		head.appendChild(script);
	}

}(window.Polyfill = { }));
