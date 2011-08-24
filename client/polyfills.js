{
	
// ----------------------------------------------------------------------------
//  JSON/Storage
	
	// JSON
	json: {
		test: function() {
			return (window.JSON && typeof window.JSON.stringify(1) === 'string');
		}
	},
	
	// HTML5 localStorage
	storage: {
		test: function() {
			return (!! window.localStorage);
		},
		prereqs: ['json']
	},

// ----------------------------------------------------------------------------
//  Elements/Attributes
	
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

// ----------------------------------------------------------------------------
//  DOM Methods
	
	// document.querySelectorAll/querySelector
	queryselectorall: {
		test: function() {
			return (!! document.querySelectorAll);
		}
	},

// ----------------------------------------------------------------------------
//  Events
	
	// window.onhashchange Event
	hashchange: {
		test: function() {
			return ('onhashchange' in window);
		}
	},
	
// ----------------------------------------------------------------------------
//  Constructors
	
	// EventSource
	eventsource: {
		test: function() {
			return ('EventSource' in window);
		},
		prereqs: ['xhr']
	},
	
	// XMLHttpRequest
	xhr: {
		test: function() {
			return (!! window.XMLHttpRequest);
		}
	},

// ----------------------------------------------------------------------------
//  Prototype Methods
	
	// Array.prototype.forEach
	foreach: {
		test: function() {
			return (!! Array.prototype.forEach);
		}
	},
	
	// Array.prototype.indexOf
	indexof: {
		test: function() {
			return (!! Array.prototype.indexOf);
		}
	},
	
	// Array.prototype.filter
	filter: {
		test: function() {
			return (!! Array.prototype.filter);
		}
	},
	
	// Array.prototype.map
	map: {
		test: function() {
			return (!! Array.prototype.map);
		}
	},
	
	// Array.prototype.every
	every: {
		test: function() {
			return (!! Array.prototype.every);
		}
	},
	
	// String.prototype.trim
	trim: {
		test: function() {
			return (!! String.prototype.trim);
		}
	},
	
	// Function.prototype.bind
	bind: {
		test: function() {
			return (!! Function.prototype.bind);
		}
	},
	
	// Date.prototype.toISOString
	toisostring: {
		test: function() {
			return (!! Date.prototype.toISOString);
		},
		prereqs: ['dateparse']
	},
	
// ----------------------------------------------------------------------------
//  Other Utilities
	
	// Object.keys
	keys: {
		test: function() {
			return (!! Object.keys);
		}
	},
	
	// Array.isArray
	isarray: {
		test: function() {
			return (!! Array.isArray);
		}
	},
	
	// Date.now
	now: {
		test: function() {
			return (!! Date.now);
		}
	},
	
	// Date.parse
	dateparse: {
		test: function() {
			return (! isNaN(Date.parse("2011-06-15T21:40:05+06:00")));
		}
	},
	
// ----------------------------------------------------------------------------
//  Testing
	
	// A Fake Polyfill Used In Testing
	test: {
		test: function() {
			return false;
		}
	}
	
}
