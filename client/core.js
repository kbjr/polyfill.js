window.Polyfill = (function() {
	var self = { };
	
	// The URL used to load resources
	var RESOURCE_URL = '<%- baseurl %>resource';
	
	// The URL used to load polyfills
	var POLYFILL_URL = '<%- baseurl %>polyfill';
	
	// Used for keeping track of requests
	var nextId = 1;
	var requests = { };
	
	/**
	 * The list of polyfills.
	 * This is inserted by the compiler from the file ./client/polyfills.js
	 */
	var polyfills = <%- polyfills %>;
	
// ----------------------------------------------------------------------------
//  External Interface
	
	/**
	 * Test for support of features and load polyfills as needed
	 *
	 * @access  public
	 * @param   array     the polyfills
	 * @return  void
	 */
	self.needs = function(polys, after) {
		after = after || function() { };
		if (typeof polys === 'string') {
			polys = [polys];
		}
		if (polys[0] === '*') {
			polys = [ ];
			for (var i in polyfills) {
				if (polyfills.hasOwnProperty(i)) {
					polys.push(i);
				}
			}
		}
		var needed = [ ];
		function handlePolyfill(name) {
			var polyfill = polyfills[name];
			if (! polyfill) {
				throw new Error('No such polyfill "' + name + '"');
			}
			if (polyfill.state === 'untested') {
				if (polyfill.test()) {
					polyfill.state = 'unneeded';
				} else {
					polyfill.state = 'loading';
					if (polyfill.prereqs) {
						for (var i = 0, c = polyfill.prereqs.length; i < c; i++) {
							handlePolyfill(polyfill.prereqs[i]);
						}
					}
					needed.push(polyfill.name);
				}
			}
		};
		for (var i = 0, c = polys.length; i < c; i++) {
			handlePolyfill(polys[i].toLowerCase());
		}
		needed = unique(needed);
		if (needed.length) {
			loadScript(self.polyfillUrl(needed), function() {
				after();
			});
		} else {
			after();
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
	 * Used internally, tells the system that a polyfill script is done
	 *
	 * @access  public
	 * @param   number    the request id
	 * @return  void
	 */
	self.done = function(id) {
		if (typeof requests[id] === 'function') {
			requests[id]();
		}
	};
	
	/**
	 * Get the URL for the resource engine
	 */
	self.resourceUrl = function(file) {
		var url = RESOURCE_URL;
		if (file) {
			url += '?f=' + file;
		}
		return url;
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
	
	/**
	 * IE Version Detection
	 *
	 * @access  public
	 * @type    number
	 */
	self.ie = (function(){
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
	var loadScript = function(source, after) {
		var id = nextId++;
		var script = document.createElement('script');
		var head = document.getElementsByTagName('head')[0];
		requests[id] = after;
		script.type = 'text/javascript';
		script.src = source + '&id=' + id;
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
	 * Process the list of polyfills
	 */
	for (var i in polyfills) {
		if (polyfills.hasOwnProperty(i)) {
			polyfills[i] = new PolyfillObject(i, polyfills[i]);
		}
	}
	
	return self;
}());

/* End of file core.js */
