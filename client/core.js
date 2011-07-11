window.Polyfill = (function() {
	var self = { };
	
	// The URL used to load polyfills
	var POLYFILL_URL = '<%- BASEURL %>polyfill';
	
// ----------------------------------------------------------------------------
//  External Interface
	
	/**
	 * Test for support of features and load polyfills as needed
	 *
	 * @access  public
	 * @param   string    ...
	 * @return  void
	 */
	self.needs = function() {
		var args = Array.prototype.slice.call(arguments);
		if (args[0] === '*') {
			args = [ ];
			for (var i in polyfills) {
				if (polyfills.hasOwnProperty(i)) {
					args.push(i);
				}
			}
		}
		var needed = [ ];
		while (args.length) {
			var polyfill = polyfills[args.shift()];
			if (! polyfill) {
				throw new Error('No such polyfill "' + test + '"');
			}
			if (polyfill.state === 'untested') {
				if (polyfill.test()) {
					polyfill.state = 'unneeded';
				} else {
					polyfill.state = 'loading';
					needed.push(polyfill.name);
					args.push.apply(args, polyfill.prereqs);
				}
			}
		}
		needed = unique(needed);
		if (needed.length) {
			loadScript(self.polyfillUrl(needed));
		}
	};
	
	/**
	 * Used internally, tells the system that a polyfill has loaded
	 *
	 * @access  public
	 * @param   string    the polyfill name
	 * @return  void
	 */
	self.loaded = function(polyfill) {
		polyfills[polyfill] = 'loaded';
	};
	
	/**
	 * Get the URL for the polyfill engine
	 *
	 * @access  public
	 * @param   array     which polyfills to load
	 * @return  string
	 */
	self.polyfillUrl = function(polys) {
		var url = POLYFILL_URL;
		if (polys) {
			url += '?p=' + polys.join(',');
		}
		return url;
	};

// ----------------------------------------------------------------------------
//  Internals
	
	/**
	 * A factory for making test functions
	 *
	 * @access  private
	 * @param   function   the test function
	 * @return  function
	 */
	var makeTest = function(func) {
		var flag = null;
		return function() {
			if (flag === null) {
				flag = func();
			}
			return flag;
		};
	};
	
	/**
	 * Tests if an array contains a value
	 */
	var contains = (function() {
		if (Array.prototype.indexOf) {
			return function(arr, item) {
				return (arr.indexOf(item) > -1);
			};
		} else {
			return function(arr, item) {
				for (var i = 0, c = arr.length; i < c; i++) {
					if (arr[i] === item) {
						return true;
					}
				}
				return false;
			};
		}
	}());
	
	/**
	 * Filters an array, leaving only unique values
	 */
	var unique = function(arr) {
		var result = [ ];
		for (var i = 0, c = arr.length; i < c; i++) {
			if (! contains(result, arr[i])) {
				result.push(arr[i]);
			}
		}
		return result;
	};
	
	/**
	 * Loads a JavaScript file by url
	 */
	var loadScript = function(source) {
		var script = document.createElement('script');
		var head = document.getElementsByTagName('head')[0];
		script.type = 'text/javascript';
		script.src = source;
		head.appendChild(script);
	};
	
	/**
	 * Properties of the polyfills object below are of this constructor
	 */
	var PolyfillObject = function(name, params) {
		this.name = name;
		/**
		 * The polyfill's current state. Possible states include:
		 *   untested - Polyfill.needs() has not been called for this test
		 *   unneeded - The test was run and the polyfill is not needed
		 *   loading  - The polyfill is being loaded
		 *   loaded   - The polyfill has been loaded
		 */
		this.state = 'untested';
		/**
		 * The test function
		 */
		this.test = makeTest(params.test);
		/**
		 * Any other prerequisite polyfills
		 */
		this.prereqs = params.prereqs || [ ];
	};
	
	/**
	 * The list of polyfills
	 */
	var polyfills = {
		
		// JSON
		json: {
			test: function() {
				return (window.JSON && window.JSON.stringify('1') === '"1"');
			}
		},
		
		// HTML5 localStorage
		storage: {
			test: function() {
				return (!! window.localStorage);
			},
			prereqs: ['json']
		},
		
		// HTML5 Input Placeholder Attribute
		placeholder: {
			test: function() {
				var elem = document.createElement('input');
				elem.type = 'text';
				var result = ('placeholder' in elem);
				elem = null;
				return result;
			}
		},
		
		// A Fake Polyfill
		test: {
			test: function() {
				return false;
			}
		}
		
	};
	for (var i in polyfills) {
		if (polyfills.hasOwnProperty(i)) {
			polyfills[i] = new PolyfillObject(i, polyfills[i]);
		}
	}
	
	return self;
}());

/* End of file core.js */
