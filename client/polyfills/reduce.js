/**
 * Array.prototype.reduce Polyfill
 */
 
if (! Array.prototype.reduce) {
	Array.prototype.reduce = function reduce(accumlator){
		var i, l = this.length, curr;
		
		if (typeof accumlator !== "function") {// ES5 : "If IsCallable(callbackfn) is false, throw a TypeError exception."
			throw new TypeError("First argument is not callable");
		}

		if ((l == 0 || l === null) && (arguments.length <= 1)) { // == on purpose to test 0 and false.
			throw new TypeError("Array length is 0 and no second argument");
		}
		
		if (arguments.length <= 1) {
			curr = this[0]; // Increase i to start searching the secondly defined element in the array
			i = 1; // start accumulating at the second element
		} else {
			curr = arguments[1];
		}
		
		for (i = i || 0 ; i < l ; ++i) {
			if (i in this) {
				curr = accumlator.call(undefined, curr, this[i], i, this);
			}
		}
		
		return curr;
	};
}

/* End of file reduce.js */
