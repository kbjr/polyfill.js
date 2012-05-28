/**
 * Adds the DOM4 CustomEvent API
 */

(function(window, document) {
	var Node = window.Node || window.Element || window.HTMLElement;
	if (window.addEventListener && Node) {
		
		var CustomEvent = window.CustomEvent = function(type, data) {
			data = data || { };
			
			this.type        = type;
			this.bubbles     = (typeof data.bubbles === 'boolean') ? data.bubbles : true;
			this.cancelable  = (typeof data.cancelable === 'boolean') ? data.cancelable : true;
			this.detail      = data.detail || { };
		};
		
		CustomEvent.toString = function() {
			return 'function CustomEvent() { [native code] }';
		};
		
		var toPatch = [ window, document, Node.prototype ];
		for (var i = 0, c = toPatch.length; i < c; i++) {
			patchObject(toPatch[i]);
		}
		
	}
	
// ------------------------------------------------------------------
		
	function wrap(obj, func, replacement) {
		var orig = obj[func];
		obj[func] = function() {
			var ret = replacement.apply(this, arguments);
			return (ret == null) ? orig.apply(this, arguments) : ret;
		};
		obj[func].toString = function() {
			return String(orig);
		};
	}
	
	function patchObject(obj) {
		if (obj.addEventListener) {
			wrap(obj, 'addEventListener', function(type, callback, capture) {
				this._customEvents = this._customEvents || { };
				this._customEvents[type] = this._customEvents[type] || [ ];
				this._customEvents[type].push([ callback, capture ]);
			});
			
			wrap(obj, 'removeEventListener', function(type, callback, capture) {
				if (! this._customEvents || ! this._customEvents[type]) {return;}
				
				var events = this._customEvents[type];
				for (var i = 0, c = events.length; i < c; i++) {
					if (events[i][0] === callback && events[i][1] === capture) {
						events.splice(i--, 1);
					}
				}
			});
			
			wrap(obj, 'dispatchEvent', function(customEvent) {
				if (! customEvent instanceof CustomEvent) {return null;}
				if (! this._customEvents || ! this._customEvents[type]) {return true;}
				
				var event = document.createEvent('Events');
				event.initEvent(customEvent.type, customEvent.bubbles, customEvent.cancelable);
				
				var events = this._customEvents[event.type];
				for (var i = 0, c = events.length; i < c; i++) {
					events[0].call(this, event);
				}
				
				return 
			});
		}
	}
	
}(window, document));

/* End of file customevent.js */
