/**
 * Array.isArray Polyfill
 */

Array.isArray = (function() {

	var toString = Object.prototype.toString;

	return function(arg) {
		return toString.call(arg) === '[object Array]';
	};

}());

/* End of file isarray.js */
