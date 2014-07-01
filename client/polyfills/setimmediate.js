/**
 * window.setImmediate Polyfill
 */

window.setImmediate = function(func) {
	var args = Array.prototype.slice.call(arguments, 1);
	
	if (args.length) {
		return setTimeout(function() {
			func.apply(this, args);
		}, 0);
	}
	
	return setTimeout(func, 0);
};

window.clearImmediate = function(handle) {
	return clearTimeout(handle);
};

/* End of file setimmediate.js */
