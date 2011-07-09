window.Polyfill = (function() {
	var self = { };
	
	var tests = {
		
		json: function() {
			return (window.JSON && window.JSON.stringify('1') === '"1"');
		}
		
	};
	
	
	
	return self;
}());

/* End of file core.js */
