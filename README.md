# jQuery.documentSize

Detects the real width and height of the document.

Works cross-browser, and returns the correct result in even the most exotic scenarios. 

And actually, because jQuery.documentSize is written in pure Javascript, you can use it [without jQuery][setup], too.

## Usage

Call `$.documentWidth()` or `$.documentHeight()` to get the results for the global `document`.

For specific documents, e.g. in an embedded iframe or a child window you have access to, pass the document as an argument: `$.documentWidth( myIframe.contentDocument )` or `$.documentHeight( myIframe.contentDocument )`.

## What does it do that jQuery doesn't?

You might wonder why you'd even need such a plugin. After all, jQuery can detect the dimensions of the document out of the box, just by calling `$(document).width()` and `$(document).height()`. Right?

Well, yes, but jQuery resorts to guesswork. It queries five properties and simply picks the largest one. That approach works in most cases, but it is not reliable across the board.

- Results are inaccurate in IE < 11 when there is a scroll bar on one axis, but not on the other. jQuery erroneously adds the width of the scroll bar to the document.
- Results are downright unpredictable in Firefox and IE when both the documentElement and the body are set to anything other than `overflow: visible`.

jQuery.documentSize does not have these limitations. Unlike jQuery, it tests the actual behaviour of the browser. Based on that test, it queries the right property for the document dimensions.

## Dependencies and setup

There are no hard dependencies. Despite its name, jQuery.documentSize doesn't even rely on [jQuery][] – it just needs a namespace variable to attach itself to. It will look for jQuery, [Zepto][], or just a simple `$` variable when it is loaded. Include jquery.documentsize.js when your library of choice, or your `$` variable, is ready for use.

The stable version of jQuery.documentSize is available in the `dist` directory ([dev][dist-dev], [prod][dist-prod]), including an AMD build ([dev][dist-amd-dev], [prod][dist-amd-prod]). If you use Bower, fetch the files with `bower install jquery.documentsize`. With npm, it is `npm install jquery.documentsize`.

**In case you don't use jQuery**, there are a few things you should know:

- If you install jQuery.documentSize with Bower or npm, jQuery is downloaded as a dependency (any version, defaults to the latest). Feel free to ignore it and replace it with your own choice.
- If you don't use jQuery or Zepto, you must provide a `$` variable of some sort. It can be another library, or just a plain object.
- If that `$` variable happens to be a function, it will be passed a callback and is expected to run it on DOM-ready.
- If you use the AMD/UMD build of jQuery.documentSize, you must provide a 'jquery' dependency. Fake it as needed ([see example][demo-amd-zepto]).

## Browser support

jQuery.documentSize has been tested with 

- 2015 versions of Chrome, Firefox, Safari, and Opera on the Desktop
- IE8+
- Safari on iOS 8, Chrome on Android 5
- PhantomJS, SlimerJS

## Performance

Is there a performance penalty for the added accuracy jQuery.documentSize provides, compared to plain jQuery calls? The answer is twofold, but the short version is "no".

When the component loads, it tests the browser – jQuery doesn't. The test touches the DOM and takes some extra time. How much exactly, depends on browser and platform, but it is negligible. The test usually takes between 5 and 25 milliseconds, even in IE8 and on mobile devices.

Once that is done, jQuery.documentSize is actually faster than the equivalent jQuery call.

## How is the document size defined?

The document width and height are not defined in the spec. But even though the terms are absent, the concept is there. The W3C [refers to it][w3c-docsize] as "the area of the canvas on which the document is rendered". Nothing is said about the size of that area, except that "rendering generally occurs within a finite region of the canvas, established by the user agent".

According to the spec, if the viewport is smaller than that area, "[the user agent should offer a scrolling mechanism][w3c-docsize]". This is the most implicit of definitions, but there you have it: the document size is equal to the area which you can access by scrolling the viewport. In the terminology of Javascript, document width and height are identical to the scrollWidth and scrollHeight of the viewport.

This definition, as well as the description by the W3C, allows us to fill in the details.

- "The canvas on which the document is rendered" is at least as large as the viewport. The viewport sets the minimum width and height of the document, even if the document content does not take up that much space.

- The user agent _should_ offer a scrolling mechanism, but it doesn't have to. If the browser denies you the actual scroll bars to get to some parts of the content, that doesn't shrink the document. In other words, if window scroll bars are suppressed with `overflow: hidden`, the document size is unaffected. This is in line with the behaviour of scrollWidth and scrollHeight for ordinary HTML elements.

- If scrolling is enabled but content is still out of reach, that content does not enlarge the document. Elements positioned out of view, ie above or to the left of the (0,0) coordinate of the viewport, don't matter for the document size.

- It's all about scrolling, but only that of the viewport. When content is tucked away inside a scrolling div, it doesn't expand the document, no matter how large it is.

- The size of the document is not the same as that of the documentElement (root element). If it were, margins set on the documentElement would be ignored, even though they increase the scrollable area. 

  Also, you can style the documentElement in ways which affect its size differently from that of the document. The documentElement can be set to an explicit `width` and `height` while still allowing its content to overflow. It can be positioned absolutely, creating extra space to the top and left which is part of the scrollable area. (I am not suggesting that those a particularly good ideas.) The sizes of document and documentElement are related, but not even strictly linked.

## Build process and tests

If you'd like to fix, customize or otherwise improve jQuery.documentSize: here are your tools.

### Setup

[npm][] and [Bower][] set up the environment for you. 

- The only thing you've got to have on your machine is [Node.js]. Download the installer [here][Node.js].
- Open a command prompt in the project directory.
- Run `npm install`. (Creates the environment.)
- Run `bower install`. (Fetches the dependencies of the script.)

Your test and build environment is ready now.

### Running tests, creating a new build

#### Considerations for testing

To run the tests on remote clients (mobile devices), start a web server with `grunt interactive` and visit `http://[your-host-ip]:9400/web-mocha/` with the client browser. Running the tests in the browser like this takes a _long_ time, so it makes sense to disable the power-save/sleep/auto-lock timeout on the mobile device. 

#### Tool chain and commands

The test tool chain: [Grunt][] (task runner), [Karma][] (test runner), [Jasmine][] (test framework). But you don't really need to worry about any of this.

A handful of commands manage everything for you:

- Run the tests in a terminal with `grunt test`.
- Run the tests in a browser interactively, live-reloading the page when the source or the tests change: `grunt interactive`.
- If the live reload bothers you, you can also run the tests in a browser without it: `grunt webtest`.
- Build the dist files (also running tests and linter) with `grunt build`, or just `grunt`.
- Build continuously on every save with `grunt ci`.
- Change the version number throughout the project with `grunt setver --to=1.2.3`. Or just increment the revision with `grunt setver --inc`. (Remember to rebuild the project with `grunt` afterwards.)
- `grunt getver` will quickly tell you which version you are at.

Finally, if need be, you can set up a quick demo page to play with the code. First, edit the files in the `demo` directory. Then display `demo/index.html`, live-reloading your changes to the code or the page, with `grunt demo`. Libraries needed for the demo/playground should go into the Bower dev dependencies, in the project-wide `bower.json`, or else be managed by the dedicated `bower.json` in the demo directory.

_The `grunt interactive` and `grunt demo` commands spin up a web server, opening up the **whole project** to access via http._ So please be aware of the security implications. You can restrict that access to localhost in `Gruntfile.js` if you just use browsers on your machine.

### Changing the tool chain configuration

In case anything about the test and build process needs to be changed, have a look at the following config files:

- `karma.conf.js` (changes to dependencies, additional test frameworks)
- `Gruntfile.js`  (changes to the whole process)
- `web-mocha/_index.html` (changes to dependencies, additional test frameworks)

New test files in the `spec` directory are picked up automatically, no need to edit the configuration for that.

## Release Notes

### v1.0.2

- Guarded against inherited display styles for the browser test iframe
- Removed redundant boilerplate from build environment

### v1.0.1

- Added missing copyright notice to Leche test helper
- Fixed minor test suite bugs
- Improved documentation

### v1.0.0

- Added Zepto support
- Made the browser test run on DOM-ready
- Completed documentation
- Added an AMD demo, using Zepto

### v0.2.0

- Removed jQuery version range restriction
- Fixed use with plain `$` variable
- Improved tests
- Added basic documentation

### v.0.1.0

- Initial public release

## License

MIT.

Copyright (c) 2015 Michael Heim.

Code in the data provider test helper: (c) 2014 Box, Inc., Apache 2.0 license. [See file][data-provider.js].

[dist-dev]: https://raw.github.com/hashchange/jquery.documentsize/master/dist/jquery.documentsize.js "jquery.documentsize.js"
[dist-prod]: https://raw.github.com/hashchange/jquery.documentsize/master/dist/jquery.documentsize.min.js "jquery.documentsize.min.js"
[dist-amd-dev]: https://raw.github.com/hashchange/jquery.documentsize/master/dist/amd/jquery.documentsize.js "jquery.documentsize.js, AMD build"
[dist-amd-prod]: https://raw.github.com/hashchange/jquery.documentsize/master/dist/amd/jquery.documentsize.min.js "jquery.documentsize.min.js, AMD build"

[setup]: #dependencies-and-setup "Setup"

[jQuery]: http://jquery.com/ "jQuery"
[Zepto]: http://zeptojs.com/ "Zepto.js"

[w3c-docsize]: http://www.w3.org/TR/CSS2/visuren.html#viewport "W3C – Visual formatting model, 9.1.1: The viewport"
[demo-amd-zepto]: https://github.com/hashchange/jquery.documentsize/blob/master/demo/amd/amd.js "Demo: AMD setup with Zepto"

[data-provider.js]: https://github.com/hashchange/jquery.documentsize/blob/master/spec/helpers/data-provider.js "Source code of data-provider.js"

[Node.js]: http://nodejs.org/ "Node.js"
[Bower]: http://bower.io/ "Bower: a package manager for the web"
[npm]: https://npmjs.org/ "npm: Node Packaged Modules"
[Grunt]: http://gruntjs.com/ "Grunt: The JavaScript Task Runner"
[Karma]: http://karma-runner.github.io/ "Karma – Spectacular Test Runner for Javascript"
[Jasmine]: http://jasmine.github.io/ "Jasmine: Behavior-Driven JavaScript"
[JSHint]: http://www.jshint.com/ "JSHint, a JavaScript Code Quality Tool"