/**
 * Array.prototype.forEach Polyfill
 */

Array.prototype.forEach = function(fun, thisp) {
	"use strict";
	if (this === void 0 || this === null) {
		throw new TypeError();
	}
	var t = Object(this);
	var len = t.length >>> 0;
	if (typeof fun !== "function") {
		throw new TypeError();
	}
	for (var i = 0; i < len; i++) {
		if (i in t) {
			fun.call(thisp, t[i], i, t);
		}
	}
};

/* End of file foreach.js */
