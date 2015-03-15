# polyfill.js

<a href='https://pledgie.com/campaigns/28605'><img alt='Click here to lend your support to: Polyfill.js and make a donation at pledgie.com !' src='https://pledgie.com/campaigns/28605.png?skin_name=chrome' border='0' ></a>

Version: 2.0.0

Copyright 2015 James Brumond

Licensed under ISC

### A JavaScript Polyfill Framework

polyfill.js is a *very lightweight* JavaScript framework for replacing missing features in outdated browsers. It can be loaded simply by adding the following script tag to your document:

```html
<script type="text/javascript" src="http://polyfill.herokuapp.com/core"></script>
```

The core for polyfill.js is extremely small and you only have to load the polyfills you need. For example, if you want to use localStorage, EventSource, and Array.prototype.forEach in your application, you tell polyfill.js that you need them, it checks if you already have them, and then loads only what you need. You would do this by using the `Polyfill.needs()` method, like this:

```javascript
Polyfill.needs(['localstorage', 'eventsource', 'foreach'], function() {
    
    // Do something with those functionalities
    	
});
```

Now, let's assume that your browser has localStorage, but not EventSource or forEach. polyfill.js figures this out and dynamically includes a script that loads polyfills for just those features. That request would look like this:

```
http://polyfill.herokuapp.com/polyfill?p=eventsource,foreach&id=1
```

That loaded script is a compacted (using [uglify-js](https://github.com/mishoo/UglifyJS)) and gzipped package containing your polyfills. Nothing extra. No waste.

### Available Polyfills

* hashchange (window.onhashchange)
* json (window.JSON/*.prototype.toJSON)
* storage (window.localStorage)
* placeholder (HTML5 input placeholder attribute)
* queryselectorall (document.querySelector[All])
* xhr (window.XMLHttpRequest)
* eventsource (window.EventSource)
* promise (window.Promise)
* trim (String.prototype.trim)
* filter (Array.prototype.filter)
* foreach (Array.prototype.foreach)
* indexof (Array.prototype.indexOf)
* map (Array.prototype.map)
* every (Array.prototype.every)
* some (Array.prototype.some)
* reduce (Array.prototype.reduce)
* reduceright (Array.prototype.reduceRight)
* lastindexof (Array.prototype.lastIndexOf)
* bind (Function.prototype.bind)
* toisostring (Date.prototype.toISOString)
* setimmediate (window.setImmediate)
* keys (Object.keys)
* isarray (Array.isArray)
* now (Date.now)
* dateparse (Date.parse)
* requestanimationframe (window.requestAnimationFrame)
* classlist (element.classList)

### Contributing A New Polyfill

I am still looking for more polyfills to add to this collection. If you have built a polyfill and would like it added, feel free to open an issue with more information, or send a pull request (but please stick to the conventions already in use in the code). Also, any polyfills should run completely automatically (they should require *no* extra action by developers to use) and should follow the appropriate specification as closely as possible.

### Special Thanks To

* [Remy Sharp](http://remysharp.com/) - EventSource polyfill based on https://github.com/remy/polyfills/blob/master/EventSource.js
* [Douglas Crockford](http://www.crockford.com/) - JSON Polyfill from his work
* [John Resig](http://ejohn.org/) - querySelectorAll polyfill built on top of "Sizzle":http://sizzlejs.com/
* [Kris Kowal](https://github.com/kriskowal) - Date.parse and Date.toISOString based on https://github.com/kriskowal/es5-shim
* [Paul Irish](http://paulirish.com/) - requestAnimationFrame from http://paulirish.com/2011/requestanimationframe-for-smart-animating/
* [Eli Grey](http://eligrey.com) - classList from http://purl.eligrey.com/github/classList.js

