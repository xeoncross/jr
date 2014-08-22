/*
 * Master Top Global Root Base Special Parent Object.... thingy
 */
var jr = {
	/*
	 * You can define content blocks to display in your theme
	 */
	blocks : {
		'footer.html' : 'footer',
		//'header.html' : 'header'
	},
	styles : [
		// Choose a theme CSS
		'themes/default.css',
		//'themes/simple.css',
		// Plus the code CSS if you have a programming blog
		'themes/code.css',
	],
	scripts : [
		'js/showdown.js',
		'js/prettify.js'
		// if you want jQuery or some other library for a plugin
		// '//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js'
	],

	// Set to "true" if you want to use photo mastheads in your articles
	masthead: true,
};


// Plugins are defined below
jr.body = null;
jr.markdownContent = null;
jr.plugins = {}

/**
 * Jr. Plugins go here
 */
jr.plugins.date = function(value) {
	try {
		var date = new Date(Date.parse(value));
		if(date) {
			return date.toLocaleDateString("i");
		}
	} catch (e) {
		console.log(e);
	}
}

jr.plugins.time = function(value) {
	try {
		var date = new Date(Date.parse(value));
		if(date) {
			return date.toLocaleTimeString("i");
		}
	} catch (e) {
		console.log(e);
	}
}

jr.plugins.gist = function(gistId, element){
	var callbackName = "gist_callback";
	window[callbackName] = function (gistData) {
		
		delete window[callbackName];
		var html = '<link rel="stylesheet" href="' + gistData.stylesheet + '"></link>';
		html += gistData.div;

		var gistContainer = document.createElement('div');
		gistContainer.innerHTML = html;

		element.parentNode.replaceChild(gistContainer, element);
	};

	var script = document.createElement("script");
	script.setAttribute("src", "https://gist.github.com/" + gistId + ".json?callback=" + callbackName);
	document.body.appendChild(script);
}


/**
 * CAREFUL WITH THE MAGIC BELOW ↓
 * @todo cleanup
 */

/**
 * Used to replace short codes in articles with strings or DOM elements
 */
jr.traverseChildNodes = function(node) {
	var next;

	if (node.nodeType === 1) {

		// (Element node)
		if (node = node.firstChild) {
			do {
				// Recursively call traverseChildNodes on each child node
				next = node.nextSibling;
				jr.traverseChildNodes(node);
			} while(node = next);
		}

	} else if (node.nodeType === 3) {

		// (Text node)
		node.data.replace(/\[(\w+):([^\]]+)\]/g, function(match, plugin, value) {
		
			if(jr.plugins[plugin]) {

				if(value = jr.plugins[plugin](value, node)) {
					if(typeof value === "string") {
						node.data = node.data.replace(match, value);
					} else if(typeof value === "Node") {
						node.parentNode.insertBefore(value, node);
						node.parentNode.removeChild(node);
					}
				}
			}
		});
	}
};

/*
 * The last item we are loading is the showdown.js
 * file which contains the Showdown parser. So,
 * keep testing for it until it loads!
 *
 * This isn't quite a good idea... but it works.
 */
jr.fireWhenReady = function() {
	var timeout, b=4;

	if (typeof window.Showdown != 'undefined') {
		jr.run(jr.markdownContent);
	} else {
		timeout = setTimeout(jr.fireWhenReady, 100);
	}
};

// Also: http://stackoverflow.com/a/7719185/99923
jr.loadScript = function(src) {
	var s = document.createElement('script');
	s.type = 'text/javascript';
	s.async = true;
	s.src = src;
	var head = document.getElementsByTagName('head')[0];
	head.appendChild(s);
};

jr.loadStyle = function(href, media) {
	var s = document.createElement('link');
	s.type = 'text/css';
	s.media = media || 'all';
	s.rel = 'stylesheet';
	s.href = href;
	var head = document.getElementsByTagName('head')[0];
	head.appendChild(s);
};

jr.loadBlock = function(file, selector) {
	ajax(file, function(html) {
		if( ! html) {
			html = 'error loading ' + file;
		}

		if(selector.substring(0,1) == '.') {
			// IE 8+ = document.querySelector(selector);
			var el = document.getElementsByClassName(selector.substring(1))[0];
		} else {
			var el = document.getElementsByTagName(selector)[0];
		}

		var e = document.createElement('div');
		e.innerHTML = html;
		while(e.firstChild) { el.appendChild(e.firstChild); }
	});
}

jr.run = function(markdownContent) {

	// Attach an ID (based on URL) to the body container for CSS reasons
	var id = window.location.pathname.replace(/\W+/g, '-').replace(/^\-|\-$/g, '');

	jr.body.id = id || 'index';

	var converter = new Showdown.converter({extensions: ['github', 'prettify', 'table'] });

	var masthead = null;

	if(jr.masthead) {
		// The image should be at the top of the file somewhere
		var re = /^[\d\D]{0,100}(\!\[[^\]]+\]\(([^\)]+)\))/; 

		var match = markdownContent.match(re);
		
		if(match && match[2]) {
			masthead = match[2];
			markdownContent = markdownContent.replace(match[1], '');
		}

		// @note: another approach
		// markdownContent.replace(re, function(match) {
		// 	document.getElementsByTagName('header')[0].style.backgroundImage = 'url(' + match[2] + ')';
		// 	return match[1];
		// });
	}

	// Convert to HTML
	var html = converter.makeHtml(markdownContent);

	// Basic HTML5 shell wrapped in a div
	jr.body.innerHTML = '<div class="wrapper">\
		<header></header>\
		<main role="main">\
			<article>' + html + '</article>\
		</main>\
		<footer></footer>\
	</div>';

	// By-the-way, if we found a masthead...
	if(masthead) {
		var header = document.getElementsByTagName('header')[0];
		header.style.backgroundImage = 'url(' + match[2] + ')';
		header.className = 'masthead';
	}

	// Load content blocks and inject them where needed
	for (var file in jr.blocks) {
		jr.loadBlock(file, jr.blocks[file]);
	}

	// Allow plugins to process shortcode embeds
	jr.traverseChildNodes(jr.body);

	// Look for dates in Header elements
	for (var x in {'h2':0,'h3':0,'h4':0,'h5':0}) {
		var headers = document.getElementsByTagName(x);
		for (var i = headers.length - 1; i >= 0; i--) {
			if(Date.parse(headers[i].innerHTML.replace(/(th|st|nd|rd)/g, ''))) {
				headers[i].className += ' date';
			}
		}
	}

	// Look for a master header image and place it in the header
	// if(jr.masthead) {
	// 	var main = document.getElementsByTagName("main")[0];
	// 	var masthead = main.getElementsByTagName("img");
	// 	if(masthead[0]) {
	// 		masthead[0].className = 'masthead';
	// 		//document.getElementsByTagName('header')[0].appendChild(masthead[0]);
	// 		document.getElementsByTagName('header')[0].style.backgroundImage = 'url(' + masthead[0].src + ')';
	// 		masthead[0].parentNode.removeChild(masthead[0]);
	// 	}
	// }


	// Set the title for browser tabs (not Search Engines)
	var el = document.getElementsByTagName('h1');
	if(el.length && el[0]) {
		document.title = el[0].innerHTML;
	}

	// Highlight any code out there (wait for it to load)
	setTimeout(function() { prettyPrint(); }, 500);
};

/**
 * Tiny AJAX request Object
 * @see https://github.com/Xeoncross/kb_javascript_framework/blob/master/kB.js#L30
 */
function ajax(url, callback, data)
{
	//try {
		var x = new(window.ActiveXObject||XMLHttpRequest)('Microsoft.XMLHTTP');
		x.open(data ? 'POST' : 'GET', url, 1);
		x.setRequestHeader('X-Requested-With','XMLHttpRequest');
		x.setRequestHeader('Content-type','application/x-www-form-urlencoded');
		x.onreadystatechange = function() {
			x.readyState > 3 && callback && callback(x.responseText, x);
		};
		x.send(data);
	//} catch (e) { console.log(e); }
};


/*
 * Get this party started!
 */
(function () {

	// Load the article
	jr.body = document.getElementsByTagName("body")[0];

	// Save the markdown for after we load the parser
	jr.markdownContent = jr.body.innerHTML;

	// Empty the content in case it takes a while to parse the markdown (leaves a blank screen)
	jr.body.innerHTML = '<div class="spinner"></div>';

	// Load styles first
	for (var i = jr.styles.length - 1; i >= 0; i--) {
		jr.loadStyle(jr.styles[i]);
	}

	for (var i = jr.scripts.length - 1; i >= 0; i--) {
		jr.loadScript(jr.scripts[i]);
	}

	jr.fireWhenReady();

	// If you want to *see* the pritty AJAX-spinner do this instead...
	//setTimeout(jr.fireWhenReady, 1000);

})();
