/**
 * Array.prototype.filter Polyfill
 */

Array.prototype.filter = function(fun, thisp) {
	"use strict";
	if (this === void 0 || this === null) {
		throw new TypeError();
	}
	var t = Object(this);
	var len = t.length >>> 0;
	if (typeof fun !== "function") {
		throw new TypeError();
	}
	var res = [ ];
	for (var i = 0; i < len; i++) {
		if (i in t) {
			var val = t[i]; // in case fun mutates this
			if (fun.call(thisp, val, i, t)) {
				res.push(val);
			}
		}
	}
	return res;
};

/* End of file filter.js */
