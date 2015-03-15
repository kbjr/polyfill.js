
var fs          = require('fs');
var path        = require('path');
var handlebars  = require('handlebars');

var cache = { };

exports.render = function(template, data) {
	template = getCompiledTemplate(template);

	return template(data);
};

function getCompiledTemplate(template, callback) {
	if (! cache[template]) {
		var file = path.join(__dirname, '/../templates/', template + '.hbs');
		var content = fs.readFileSync(file, 'utf8');
		cache[template] = handlebars.compile(content);
	}

	return cache[template];
}

// -------------------------------------------------------------

handlebars.registerHelper('prism', function(lang, title, opts) {
	if (typeof title !== 'string') {
		opts = title;
		title = null;
	}

	var result = '<pre><code class="language-' + lang + '">' + processCode(opts.fn()) + '</code></pre>';
	if (title) {
		result = '<h4 class="code-title">' + title + '</h4>' + result;
	}

	return result;
});

var leftWhitespace = /^(\s+)/;
var rightWhitespace = /(\s+)$/;

function processCode(code) {
	var indent = '';
	
	// Break the code into lines
	code = code.split('\n');

	// Remove any empty lines from the beginning
	while (code.length && ! trim(code[0])) {
		code = code.slice(1);
	}

	// Make sure we still have something left
	if (! code.length) {
		return '';
	}

	// Determine the correct indentation
	indent = leftWhitespace.exec(code[0])[1];
	indent = new RegExp('^' + indent);

	// And remove it from each line
	code = code.map(function(line) {
		return line.replace(indent, '');
	});

	return code.join('\n');
}

function trim(str) {
	return str.replace(leftWhitespace, '').replace(rightWhitespace, '');
}
