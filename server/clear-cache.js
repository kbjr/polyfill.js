module.exports = function() {
	
	/**
	 * Deletes all precompiled cache files
	 */
	
	var fs = require('fs');
	var path = require('path');

	// Get the needed paths
	var CLIENT_PATH = path.join(__dirname, '../client');
	var POLYFILL_CACHE_PATH = path.join(CLIENT_PATH, 'polyfill-cache');
	
	// Delete the core files
	var coreJs = path.join(CLIENT_PATH, 'core.js');
	fs.unlink(coreJs + '.min');
	fs.unlink(coreJs + '.min.gz');
	
	// Delete the polyfill files
	fs.readdir(POLYFILL_CACHE_PATH, function(err, files) {
		if (! err) {
			for (var i = 0, c = files.length; i < c; i++) {
				var file = path.join(POLYFILL_CACHE_PATH, files[i]);
				fs.unlink(file);
			}
		}
	});
	
};
