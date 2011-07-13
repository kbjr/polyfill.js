{
		
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
	
	// document.querySelectorAll/querySelector
	querySelectorall: {
		test: function() {
			return (!! document.querySelectorAll);
		}
	},
	
	// window.onhashchange Event
	hashchange: {
		test: function() {
			return ('onhashchange' in window);
		}
	},
	
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
	
	// A Fake Polyfill Used In Testing
	test: {
		test: function() {
			return false;
		}
	}
	
}
