/**
 * HTML5 Input Placeholder Polyfill
 */

(function() {
	
	/**
	 * The color to display placeholders in
	 */
	var placeholderColor = '#aaa';
	
	/**
	 * A list of all inputs in the DOM
	 */
	var inputs = document.getElementsByTagName('input');
	
	/**
	 * Are mutation events being used to auto-update?
	 */
	var usingMutation = true;
	
	/**
	 * The placeholder fix object
	 */
	var placeholderFix = {
		
		// Initialize a node for the placeholder fix
		init: function(input) {
			if (input._placeholder) {return;}
			
			input._placeholder = {
				node: createElement('div', {
					style: {
						position: 'absolute',
						display: 'inline-block',
						color: placeholderColor,
						margin: '0',
						padding: '0',
						cursor: 'text'
					}
				}),
				enabled: function() {
					return (input.type === 'text' || input.type === 'password');
				},
				value: null,
				visible: false
			};
			
			// Use a setter to auto-update when the property is changed
			if (defineProperty) {
				defineProperty(input, 'placeholder', {
					set: function(value) {
						input._placeholder.value = value;
						placeholderFix.redraw(input);
						return value;
					},
					get: function(value) {
						return input._placeholder.value;
					}
				});
			}
			
			// Replace getAttribute/setAttribute to add placeholder support
			var proto = input.constructor.prototype;
			input.setAttribute = function(attr, value) {
				if (attr === 'placeholder') {
					input.placeholder = value;
					if (! defineProperty) {
						input._placeholder.value = value;
						placeholderFix.redraw(input);
					}
				}
				return proto.setAttribute.call(input, attr, value);
			};
			input.getAttribute = function(attr) {
				if (attr === 'placeholder') {
					return input._placeholder.value;
				}
				return proto.getAttribute.call(input, attr);
			};
			
			placeholderFix.redraw(input);
			
			// Bind the needed events for show/hide/reposition
			var
			onresize = function() {
				placeholderFix.reposition(input);
			},
			onfocus = function() {
				placeholderFix.hide(input);
				input.focus();
			},
			onblur = function() {
				placeholderFix.show(input);
			};
			addEventSimple(window, 'resize', onresize);
			addEventSimple(input._placeholder.node, 'click', onfocus);
			addEventSimple(input, 'focus', onfocus);
			addEventSimple(input, 'blur', onblur);
		},
		
		// Redraw a placeholder for an input
		redraw: function(input) {
			placeholderFix.init(input);
			
			// Hide the placeholder node
			placeholderFix.hide(input);
			
			// Update the value if needed
			var node = input._placeholder.node;
			node.innerHTML = input.placeholder;
			
			// Update any styles as needed
			setStyle(node, {
				zIndex: (getStyle(input, 'zIndex') || 99999) + 1,
				backgroundColor: getStyle(input, 'backgroundColor'),
				fontStyle: getStyle(input, 'fontStyle'),
				fontVariant: getStyle(input, 'fontVariant'),
				fontWeight: getStyle(input, 'fontWeight'),
				fontSize: getStyle(input, 'fontSize'),
				fontFamily: getStyle(input, 'fontFamily')
			});
			
			// Do any repositioning needed
			placeholderFix.reposition(input);
			
			// Re-show the placeholder node
			placeholderFix.show(input);
		},
		
		// Show the placeholder for an element
		show: function(input) {
			if (! input._placeholder.visible && input._placeholder.enabled()) {
				input.parentNode.appendChild(input._placeholder.node);
				input._placeholder.visible = true;
			}
		},
		
		hide: function(input) {
			if (input._placeholder.visible && input._placeholder.enabled()) {
				input.parentNode.removeChild(input._placeholder.node);
				input._placeholder.visible = false;
			}
		},
		
		reposition: function(input) {
			var offset = getOffset(input);
			setStyle(input._placeholder.node, {
				top: offset.top + 'px',
				left: offset.left + 'px'
			});
		},
		
		autoUpdate: function(evt) {
			evt = evt || window.event;
			var node = evt.target || evt.srcElement;
			if (node.nodeName.toLowerCase() === 'input') {
				placeholderFix.redraw(node):
			}
		}
		
	};
	
	/**
	 * Use mutation events for auto-updating
	 */
	if (document.addEventListener) {
		document.addEventListener('DOMAttrModified', placeholderFix.autoUpdate);
		document.addEventListener('DOMNodeInserted', placeholderFix.autoUpdate);
	}
	/**
	 * Use onpropertychange for auto-updating
	 */
	else if (document.attachEvent && 'onpropertychange' in document) {
		document.attachEvent('onpropertychange', placeholderFix.autoUpdate);
	}
	/**
	 * No event-based auto-update
	 */
	else {
		usingMutation = false;
	}
	
// ----------------------------------------------------------------------------
//  Helper Functions
	
	// Define getters/setters
	var defineProperty = Object.defineProperty;
	if (! defineProperty && '__defineSetter__' in document.createElement('input')) {
		defineProperty = function(obj, prop, accessors) {
			if (accessors.get) {
				obj.__defineGetter__(prop, accessors.get);
			}
			if (accessors.set) {
				obj.__defineSetter__(prop, accessors.set);
			}
		};
	}
	
	// Attaches an event handler
	function addEventSimple(obj, evt, fn) {
		if (obj.addEventListener) {
			obj.addEventListener(evt, fn, false);
		} else if (obj.attachEvent) {
			obj.attachEvent('on' + evt, fn);
		}
	};
	
	// Used internally in getStyle()
	function getStyleValue(elem, prop) {
		if (elem.currentStyle) {
			return elem.currentStyle[prop];
		} else if (window.getComputedStyle) {
			return document.defaultView.getComputedStyle(elem, null)[prop];
		} else if (prop in elem.style) {
			return elem.style[prop];
		}
		return null;
	};
	
	// Get a style property from an element
	function getStyle(elem, prop) {
		var style;
		if (elem.parentNode == null) {
			elem = document.body.appendChild(elem);
			style = getStyleValue(elem, prop);
			elem = document.body.removeChild(elem);
		} else {
			style = getStyleValue(elem, prop);
		}
		return style;
	};
	
	// Set style properties to an element
	function setStyle(elem, props) {
		for (var i = 0, c = props.length; i < c; i++) {
			elem.style[i] = props[i];
		}
	};
	
	// Create an element
	function createElement(tag, props) {
		var elem = document.createElement(tag);
		for (var i in props) {
			if (props.hasOwnProperty(i)) {
				if (i === 'style') {
					setStyle(elem, props[i]);
				} else {
					elem.setAttribute(i, props[i]);
				}
			}
		}
		return elem;
	};
	
	// Find the offset position of a given element
	function getOffset(input) {
		return {
			top: input.offsetTop + parseFloat(getStyle(input, 'paddingTop')),
			left: input.offsetLeft + parseFloat(getStyle(input, 'paddingLeft'))
		};
	}

// ----------------------------------------------------------------------------
//  Start Running
	
	for (var i = 0, c = inputs.length; i < c; i++) {
		placeholderFix.init(inputs[i]);
	}
	
}());

/* End of file placeholder.js */
