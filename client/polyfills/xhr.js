/**
 * XMLHttpRequest Polyfill For IE
 */

(function() {
	
	var AXOs = ['MSXML2.XMLHTTP.6.0', 'MSXML3.XMLHTTP', 'Microsoft.XMLHTTP', 'MSXML2.XMLHTTP.3.0'];
	var correctAXO = null;
	
	window.XMLHttpRequest = function() {
		if (correctAXO === null) {
			var xhr;
			if (window.ActiveXObject) {
				for (var i = 0, c = AXOs.length; i < c; i++) {
					try {
						xhr = new window.ActiveXObject(AXOs[i]);
					} catch (e) { xhr = false; }
					if (xhr) {
						correctAXO = AXOs[i];
						return xhr;
					}
				}
			}
			correctAXO = false;
		}
		if (correctAXO === false) {
			throw new Error('XMLHttpRequest not supported in this browser');
		}
		return new window.ActiveXObject(correctAXO);
	};
	
}());

/* End of file xhr.js */
