/*! showdown-prettify 06-01-2016 */
(function (extension) {
  'use strict';

  if (typeof showdown !== 'undefined') {
    extension(showdown);
  } else if (typeof define === 'function' && define.amd) {
    define(['showdown'], extension);
  } else if (typeof exports === 'object') {
    module.exports = extension(require('showdown'));
  } else {
    throw Error('Could not find showdown library');
  }

}(function (showdown) {
  'use strict';
  showdown.extension('prettify', function () {
    return [{
      type:   'output',
      filter: function (source) {
        return source.replace(/(<pre[^>]*>)?[\n\s]?<code([^>]*)>/gi, function (match, pre, codeClass) {
          if (pre) {
            return '<pre class="prettyprint linenums"><code' + codeClass + '>';
          } else {
            return ' <code class="prettyprint">';
          }
        });
      }
    }];
  });
}));

//# sourceMappingURL=showdown-prettify.js.map