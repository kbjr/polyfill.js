/**
 * HTML5 localStorage Polyfill
 */

if (! window.localStorage) {
	
	var
	
	storage, read, write, del,
	
	/**
	 * If using the cookie model, cookies should last how long?
	 */
	cookieStorageExpiration = 1000 * 60 * 60 * 24 * 365;
	
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
	}()),
	
	/**
	 * Encode a value for storage
	 */
	encode = function(value, cookieMode) {
		value = JSON.stringify(value);
		if (cookieMode) {
			value = value.replace(/[;\r\n= %]/g, function(ch) {
				return "%" + ";\r\n= %".indexOf(ch);
			});
		}
		return value;
	},
	
	/**
	 * Decode a value from storage
	 */
	decode = function(value, cookieMode) {
		if (cookieMode) {
			value = value.replace(/%[0-5]/g, function(ch) {
				return ";\r\n= %".charAt(parseFloat(ch.slice(1)));
			});
		}
		value = JSON.parse(value);
		return value;
	};

// ----------------------------------------------------------------------------
//  External Interface

	window.Storage = function(name) {
		
		var
		name = name,
		data = read(name);
		
		this.length = 0;
		
		this.clear = function() {
			this.length = 0;
			data = { };
			del(name);
		};
		
		this.getItem = function(key) {
			data = read(name);
			return data[key];
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
		
		this.removeItem = function(key) {
			data = read(name);
			delete data[key];
			write(name, data);
		};
		
		this.setItem = function(key, value) {
			data = read(name);
			data[key] = value;
			write(name, data);
		};
		
	};

	window.localStorage = new Storage('localStorage');
	
// ----------------------------------------------------------------------------
//  Internals
	
	/**
	 * Build the globalStorage model
	 */
	if (hasGlobalStorage) {
		
		storage = window.globalStorage[window.location.hostname];
		
		write = function(key, value) {
			storage[key] = encode(value);
		};
		
		read = function(key) {
			var value = storage[key] && storage[key].value;
			if (value) {
				value = value;
			}
			return decode(value);
		};
		
		del = function(key) {
			delete storage[key];
		};
		
	}
	
	/**
	 * Build the MSIE userData model
	 */
	else if (hasUserData) {
		
		storage = document.createElement('div');

		var withStore = function(func) {
			return function() {
				document.body.appendChild(storage);
				storage.addBehavior('#default#userData');
				storage.load('Storage');
				var args = Array.prototype.slice.call(arguments, 0);
				args.unshift(storage);
				result = func.apply(win, args);
				storage.parentNode.removeChild(storage);
				return result;
			};
		};

		write = withStore(function(storage, name, value) {
			storage.setAttribue(name, encode(value));
			storage.save('Storage');
		});

		read = withStore(function(storage, name) {
			return decode(storage.getAttribute(name));
		});

		del = withStore(function(storage, name) {
			storage.removeAttribute(name);
			storage.save('Storage');
		});
		
	}
	
	/**
	 * Build the cookie model
	 */
	else {
		
		var
		
		readCookie = function(name) {
			var
			nameEQ = name + "=",
			ca = document.cookie.split(';');
			for (var i = 0, len = ca.length; i < len; i++) {
				var c = ca[i];
				while (c.charAt(0)==' ') {
					c = c.substring(1,c.length);
				}

				if (c.indexOf(nameEQ) == 0) {
					return c.substring(nameEQ.length,c.length);
				}
			}
			return null;
		},
		
		writeCookie = function(name, value, expires) {
			if (expires) {
				var date = new Date();
				date.setTime(date.getTime() + expires);
				expires = '; expires=' + date.toGMTString();
			} else {
				expires = '';
			}
			document.cookie = name + '=' + value + expires + '; path=/';
		};
		
		write = function(key, value) {
			value = encode(value, true);
			writeCookie(key, value, cookieStorageExpiration);
		};
		
		read = function(key) {
			var value = readCookie(key);
			return decode(value, true);
		};
		
		del = function(key) {
			writeCookie(key, '', -1);
		};
		
	}
	
}

/* End of file storage.js */
