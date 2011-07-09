window.Polyfill = (function() {
	var self = { };
	
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
		var needed = [ ];
		for (var i = 0, c = args.length; i < c; i++) {
			var polyfill = polyfills[args[i]];
			if (! polyfill) {
				throw new Error('No such polyfill "' + test + '"');
			}
			if (polyfill.state === 'untested') {
				if (polyfill.test()) {
					polyfill.state = 'unneeded';
				} else {
					polyfill.state = 'loading';
					needed.push(polyfill.name);
					needed.push.apply(polyfill.prereqs);
				}
			}
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
