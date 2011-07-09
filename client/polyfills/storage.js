/**
 * HTML5 localStorage Polyfill
 */

if (! window.localStorage) {
	
	var
	
	read, write, del, clear, storage,
	
	/**
	 * Check for the globalStorage model
	 */
	hasGlobalStorage = (function() {
		try {
			return ('globalStorage' in window && window.globalStorage && window.globalStorage[window.location.hostname]);
		} catch (e) { return false; }
	}()),
	
	/**
	 * Check for the MSIE userData model
	 */
	hasUserData = (function() {
		try {
			return (typeof document.documentElement.addBehavior === 'function');
		} catch (e) { return false; }
	}());

// ----------------------------------------------------------------------------
//  External Interface

	window.Storage = function(name) {
		
		var
		name = name,
		data = read(name)
		
		this.length = 0;
		
		this.clear = function() {
			clear();
			this.length = 0;
		};
		
		this.getItem = function(key) {
		
		};
		
		this.key = function(key) {
			var c = 0;
			for (var i in data) {
				if (c === key) {
					return key;
				}
				c++;
			}
			return null;
		};
		
		this.removeItem = function() {
		
		};
		
		this.setItem = function() {
		
		};
		
	};

	window.localStorage = new Storage('localStorage');
	
// ----------------------------------------------------------------------------
//  Internals
	
	/**
	 * Build the globalStorage model
	 */
	if (hasGlobalStorage) {
		
		
		
	}
	
	/**
	 * Build the MSIE userData model
	 */
	else if (hasUserData) {
		
		
		
	}
	
	/**
	 * Build the cookie model
	 */
	else {
		
		
		
	}
	
}

/* End of file storage.js */
