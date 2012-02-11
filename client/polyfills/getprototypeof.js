/**
 * Object.getPrototypeOf Polyfill
 */

Object.getPrototypeOf = function(obj) {
	var proto = obj.__proto__;
	if (! proto) {
		proto = (obj.constructor ? obj.constructor.prototype : Object.prototype);
	}
	return proto;
};

/* End of file getprototypeof.js */
