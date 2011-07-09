var

sys = require('sys'),
url = require('url'),
http = require('http'),
path = require('path'),

// Create the http server
server = http.createServer(function(req, res) {
	
	res.writeHead(200, {
		'Content-Type': 'text/plain'
	});
	res.write('Server is ready.');
	res.end();
	
});

// Start listening
var port = process.env.PORT || 3000;
server.listen(port, function() {
	sys.puts('Listening on port ' + port);
});

/* End of file server.js */
