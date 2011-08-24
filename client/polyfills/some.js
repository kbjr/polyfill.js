/**
 * Array.prototype.some Polyfill
 */
 
if (! Array.prototype.some) {
	Array.prototype.some = function(fun /*, thisp */) {
		"use strict";

		if (this === void 0 || this === null) {
			throw new TypeError();
		}

		var t = Object(this);
		var len = t.length >>> 0;
		if (typeof fun !== "function") {
			throw new TypeError();
		}

		var thisp = arguments[1];
		for (var i = 0; i < len; i++) {
			if (i in t && fun.call(thisp, t[i], i, t)) {
				return true;
			}
		}

		return false;
	};
}

/* End of file some.js */
