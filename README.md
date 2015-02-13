# jQuery.documentSize

Detects the real width and height of the document.

Works cross-browser, and returns the correct result in even the most exotic scenarios.

## Usage

Using it is trivial. Call `$.documentWidth()` or `$.documentHeight()` to get the results for the global `document`. 

For specific documents e.g. in an embedded iframe or a child window you have access to, pass the document as the argument: `$.documentWidth( myIframe.contentDocument )` or `$.documentHeight( myIframe.contentDocument )`.

## Dependencies and setup

[jQuery][] is the only dependency. Include jquery.documentsize.js after [jQuery][].

The stable version of jQuery.documentSize is available in the `dist` directory ([dev][dist-dev], [prod][dist-prod]), including an AMD build ([dev][dist-amd-dev], [prod][dist-amd-prod]). If you use Bower, fetch the files with `bower install jquery.documentsize`. With npm, it is `npm install jquery.documentsize`.

## Browser support

jQuery.documentSize has been tested with 

- 2015 versions of Chrome, Firefox, Safari, and Opera on the Desktop
- IE8+
- Safari on iOS 8, Chrome on Android 5
- PhantomJS, SlimerJS

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

## License

MIT.

Copyright (c) 2015 Michael Heim.

[dist-dev]: https://raw.github.com/hashchange/jquery.documentsize/master/dist/jquery.documentsize.js "jquery.documentsize.js"
[dist-prod]: https://raw.github.com/hashchange/jquery.documentsize/master/dist/jquery.documentsize.min.js "jquery.documentsize.min.js"
[dist-amd-dev]: https://raw.github.com/hashchange/jquery.documentsize/master/dist/amd/jquery.documentsize.js "jquery.documentsize.js, AMD build"
[dist-amd-prod]: https://raw.github.com/hashchange/jquery.documentsize/master/dist/amd/jquery.documentsize.min.js "jquery.documentsize.min.js, AMD build"

[jQuery]: http://jquery.com/ "jQuery"

[Node.js]: http://nodejs.org/ "Node.js"
[Bower]: http://bower.io/ "Bower: a package manager for the web"
[npm]: https://npmjs.org/ "npm: Node Packaged Modules"
[Grunt]: http://gruntjs.com/ "Grunt: The JavaScript Task Runner"
[Karma]: http://karma-runner.github.io/ "Karma - Spectacular Test Runner for Javascript"
[Jasmine]: http://jasmine.github.io/ "Jasmine: Behavior-Driven JavaScript"
[JSHint]: http://www.jshint.com/ "JSHint, a JavaScript Code Quality Tool"