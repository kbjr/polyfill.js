/**
 * Date.prototype.toISOString Polyfill
 *
 * This function taken with minor changes from https://github.com/kriskowal/es5-shim
 */

Date.prototype.toISOString = function toISOString() {
	var result, length, value;
	if (! isFinite(this)) {
		throw new RangeError();
	}

	// the date time string format is specified in 15.9.1.15.
	result = [this.getUTCFullYear(), this.getUTCMonth() + 1, this.getUTCDate(),
		this.getUTCHours(), this.getUTCMinutes(), this.getUTCSeconds()];

	length = result.length;
	while (length--) {
		value = result[length];
		// pad months, days, hours, minutes, and seconds to have two digits.
		if (value < 10) {
			result[length] = '0' + value;
		}
	}
	// pad milliseconds to have three digits.
	return result.slice(0, 3).join('-') + 'T' + result.slice(3).join(':') + '.' +
		('000' + this.getUTCMilliseconds()).slice(-3) + 'Z';
};

/* End of file toisostring.js */
