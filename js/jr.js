/*
 * Master Top Global Root Base Special Parent Object.... thingy
 */
var jr = {
	body : null,
	markdownContent: null,
	plugins: {}, // Defined below
	styles : [
		'themes/default.css',
		'//fonts.googleapis.com/css?family=Average',
		'//fonts.googleapis.com/css?family=Roboto:400,700'
	],
	scripts : [
		'js/showdown.js'
		// if you want jQuery or some other library for a plugin
		// '//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js'
	],
};


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
 * The last item we are loading is the assets.js
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


jr.run = function(markdownContent) {

	// Attach an ID (based on URL) to the body container for CSS reasons
	var id = window.location.pathname.replace(/\W+/g, '-').replace(/^\-|\-$/g, '');

	jr.body.id = id || 'index';

	var converter = new Showdown.converter();

	// Convert to HTML
	var html = converter.makeHtml(markdownContent);

	// Basic HTML5 shell wrapped in a div
	jr.body.innerHTML = '<div><main role="main">\
		<article>' + html + '</article>\
	</main><footer></footer></div>';

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

	// Set the title for browser tabs (not Search Engines)
	document.title = document.getElementsByTagName('h1')[0].innerHTML;

	// Load the footer (if any)
	ajax('footer.html', function(x) {
		if(x) {
			document.getElementsByTagName('footer')[0].innerHTML = x;
		}
	});
};

/**
 * Tiny AJAX request Object
 * @see https://github.com/Xeoncross/kb_javascript_framework/blob/master/kB.js#L30
 */
function ajax(url, callback, data)
{
	var x = new(window.ActiveXObject||XMLHttpRequest)('Microsoft.XMLHTTP');
	x.open(data ? 'POST' : 'GET', url, 1);
	x.setRequestHeader('X-Requested-With','XMLHttpRequest');
	x.setRequestHeader('Content-type','application/x-www-form-urlencoded');
	x.onreadystatechange = function() {
		x.readyState > 3 && callback && callback(x.responseText, x);
	};
	x.send(data);
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

	// If you want to see the pritty AJAX-spinner...
	//setTimeout(jr.fireWhenReady, 1000);

})();
