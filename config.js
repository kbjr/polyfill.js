
module.exports = {
	
	// The port to run the server on
	port: process.env.PORT || 8000,
	
	// The baseURL of the server, used for secondary requests
	// baseUrl: 'http://localhost:8000/',
	baseUrl: 'http://polyfill.herokuapp.com/',

	// Log a message for each request?
	requestLogging: true,

	// Log messages for client code fetching/uglifying/gzipping?
	compilerLogging: true,

	// Allow responses to be gzipped?
	allowGzip: true
	
};
