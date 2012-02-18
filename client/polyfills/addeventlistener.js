/**
 * addEventListener/removeEventListener/dispatchEvent Polyfill
 *
 * Adds the aforementioned methods to window, document, and elements
 * according to the DOM 2 specification by extending IEs attachEvent,
 * detachEvent, and fireEvent.
 */

if (document.attachEvent && (window.Node || window.Element)) {
	(function() {
		var Node = window.Node || window.Element;
		
	// ------------------------------------------------------------------
	//  The Polyfill Methods
		
		function addEventListener(target, type, listener, useCapture) {
			return target.attachEvent('on' + type, listener);
		}
		
		function removeEventListener(target, type, listener, useCapture) {
			return target.detachEvent('on' + type, listener);
		}
		
		function dispatchEvent(target, event) {
			return target.fireEvent(event.type, createEventFrom(event));
		}
	
	// ------------------------------------------------------------------
	//  document.createEvent
		
		function createEventFrom(obj) {
			var evt = document.createEventObject();
			extend(evt, obj);
			return evt;
		}
		
	// Event
		
		function Event() {
			this.currentTarget  = null;
			this.returnValue    = true;
			this.srcElement     = null;
			this.target         = null;
			this.timestamp      = (new Date()).getTime();
		}
		
		Event.prototype.initEvent = function(type, bubbles, cancelable) {
			this.type        =   type;
			this.bubbles     =!! bubbles;
			this.cancelable  =!! cancelable;
		};
	
	// UIEvent
		
		function UIEvent() {
			Event.call(this);
			this.view    = null;
			this.detail  = 0;
		}
		
		UIEvent.prototype = new Event();
		UIEvent.prototype.initUIEvent = function(type, bubbles, cancelable, view, detail) {
			this.initEvent.apply(this, arguments);
			this.view    = view;
			this.detail  = detail;
		};
	
	// MutationEvent
		
		function MutationEvent() {
			Event.call(this);
			this.relatedNode  = null;
			this.prevValue    = '';
			this.newValue     = '';
			this.attrName     = '';
			this.attrChange   = 0;
		}
		
		MutationEvent.prototype = new Event();
		MutationEvent.prototype.initMutationEvent =
			function(type, bubbles, cancelable, relatedNode, prevValue, newValue, attrName, attrChange) {
				this.initEvent.apply(this, arguments);
				this.relatedNode  = relatedNode;
				this.prevValue    = prevValue;
				this.newValue     = newValue;
				this.attrName     = attrName;
				this.attrChange   = attrChange;
			};
		
		extend(MutationEvent, {
			MODIFICATION: 1,
			ADDITION: 2,
			REMOVAL: 3
		});
		
	// MouseEvent
		
		function MouseEvent() {
			Event.call(this);
			this.view           = null;
			this.detail         = 0;
			this.screenX        = 0;
			this.screenY        = 0;
			this.clientX        = 0;
			this.clientY        = 0;
			this.ctrlKey        = false;
			this.altKey         = false;
			this.shiftKey       = false;
			this.metaKey        = false;
			this.button         = 0;
			this.relatedTarget  = null;
		}
		
		MouseEvent.prototype = new Event();
		MouseEvent.prototype.initMouseEvent =
			function(type, bubbles, cancelable, view, detail, screenX, screenY, clientX,
			         clientY, ctrlKey, altKey, shiftKey, metaKey, button, relatedTarget) {
				this.initEvent.apply(this, arguments);
				this.view           = view;
				this.detail         = detail;
				this.screenX        = screenX;
				this.screenY        = screenY;
				this.clientX        = clientX;
				this.clientY        = clientY;
				this.ctrlKey        = ctrlKey;
				this.altKey         = altKey;
				this.shiftKey       = shiftKey;
				this.metaKey        = metaKey;
				this.button         = button;
				this.relatedTarget  = relatedTarget;
			};
		
	// document.createEvent
		
		document.createEvent = (function() {
			var constructors = {
				Events:          Event,
				HTMLEvents:      Event,
				UIEvents:        UIEvent,
				MutationEvents:  MutationEvent,
				MouseEvents:     MouseEvent
			};
			return function(type) {
				if (constructors.hasOwnProperty(type)) {
					return new constructors[type]();
				} else {
					throw new DOMException(9);
				}
			};
		}());
		
	// ------------------------------------------------------------------
	//  DOMException Constructor
		
		function DOMException(code) {
			this.code = code;
			this.name = (function() {
				for (var i in domExceptionCodes) {
					if (domExceptionCodes[i] === code) {
						return i;
					}
				}
			}());
			this.message = this.name + ': DOM Exception ' + this.code;
		}
		
		var domExceptionCodes = {
			ABORT_ERR: 20
			DATA_CLONE_ERR: 25
			DOMSTRING_SIZE_ERR: 2
			HIERARCHY_REQUEST_ERR: 3
			INDEX_SIZE_ERR: 1
			INUSE_ATTRIBUTE_ERR: 10
			INVALID_ACCESS_ERR: 15
			INVALID_CHARACTER_ERR: 5
			INVALID_MODIFICATION_ERR: 13
			INVALID_NODE_TYPE_ERR: 24
			INVALID_STATE_ERR: 11
			NAMESPACE_ERR: 14
			NETWORK_ERR: 19
			NOT_FOUND_ERR: 8
			NOT_SUPPORTED_ERR: 9
			NO_DATA_ALLOWED_ERR: 6
			NO_MODIFICATION_ALLOWED_ERR: 7
			QUOTA_EXCEEDED_ERR: 22
			SECURITY_ERR: 18
			SYNTAX_ERR: 12
			TIMEOUT_ERR: 23
			TYPE_MISMATCH_ERR: 17
			URL_MISMATCH_ERR: 21
			VALIDATION_ERR: 16
			WRONG_DOCUMENT_ERR: 4
		};
		
		function extend(host, donor) {
			for (var i in donor) {
				try {
					host[i] = donor[i];
				} catch(e) { }
			}
		}
		
		extend(DOMException.prototype, domExceptionCodes);
		
	// ------------------------------------------------------------------
	//  Expose
		
		Polyfill._correctAddEventListener = function(obj) {
			if (! obj.addEventListener) {
				obj.addEventListener = function(type, listener, useCapture) {
					return addEventListener(obj, type, listener, useCapture);
				};
				obj.removeEventListener = function(type, listener, useCapture) {
					return removeEventListener(obj, type, listener, useCapture);
				};
				obj.dispatchEvent = function(event) {
					return dispatchEvent(obj, event);
				};
			}
		};
		
		var toPolyfill = [ window, document, Node.prototype ];
		for (var i = 0, c = toPolyfill.length; i < c; i++) {
			Polyfill._correctAddEventListener(toPolyfill[i]);
		}
		
	}());
}

/* End of file addeventlistener.js */
