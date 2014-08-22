# Welcome to Jr! (v1.2)

A static, static content generator that moves the "generator" part to the browser.
This site is pure text files with a single Javascript included on each page that renders
the theme and assets as needed.

Each page is written in markdown with a single `<script>` tag that includes Jr.js. Once you have created your pages then simply upload the system to your website and enjoy.

Jr includes a [post editor](http://xeoncross.github.io/jr/editor.html) you can use to write your posts using a live preview of the rendered markdown. It uses `localStorage` to persist your writings even if you lose power.

## [Visit the Demo](http://xeoncross.github.io/jr)

## Getting Started

1. [Download](http://github.com/Xeoncross/Jr) `Jr`
2. Create an `[article-name].html` file
3. Paste the following code at the bottom of the page:  
	<code>&lt;script src=&quot;jr.js&quot;&gt;&lt;/script&gt;</code>  
4. `git commit` the new article or (sad face) SFTP it up to your web host

...and you're done! Rinse and repeat.

## Degrading gracefully in the absence of JavaScript

If you want the MarkDown content to appear as human-readable MarkDown text in browsers without JavaScript (instead of as an undelimited blob), add a line like this at the top of your documents:

\[enable JavaScript to render MarkDown\]: \<pre\>

This is a MarkDown comment that will not be rendered, but HTML renderers will see the \<pre\> tag and act accordingly.

## Background Images

For those of you who like to include photo mastheads or body background images on your posts. Simply add Markdown images tag with the name of the DOM element (prefixed with an underscore).

	![_header](http://example.com/image.jpg)
	![_footer](http://example.com/image.jpg)

MIT License with ♡ from [David Pennington](http://davidpennington.me)

[Donate Stellar](https://www.stellar.org) to xeoncross
