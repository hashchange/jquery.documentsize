// !!!!!!!!!!!!!!!!!!!!!!!!!!
// Depends on basic-utils.js
// !!!!!!!!!!!!!!!!!!!!!!!!!!

/**
 * Creates a child window, including a document with an HTML 5 doctype, UFT-8 charset, head, title, and body tags.
 * Returns the handle, or undefined if window creation fails.
 *
 * Optionally accepts a jQuery Deferred. The deferred is resolved when the document in the child window is ready and the
 * window has expanded to its intended size. If the child window can't be created, the deferred is rejected. (For this,
 * jQuery needs to be loaded, obviously.)
 *
 * The size can also be specified. If so, the new window is opened with minimal browser chrome (no menu, location, and
 * status bars) and is positioned at the top left of the viewport. By default, the window is opened with the default
 * settings of the browser (usually with browser chrome, and not exactly in the top left corner).
 *
 * If the child window can't be created, a pop-up blocker usually prevents it. Pop-up blockers are active by default in
 * most browsers - Chrome, for instance.
 *
 * @param   {jQuery.Deferred} [readyDfd]
 * @param   {Object|string}   [size]          "parent" (same size as parent window), or size object
 * @param   {number}          [size.width]
 * @param   {number}          [size.height]
 *
 * @returns {Window|undefined}                the window handle
 */
function createChildWindow ( readyDfd, size ) {
    var childWindow, width, height,
        sizedDefaultProps = ",top=0,left=0,location=no,menubar=no,status=no,toolbar=no,resizeable=yes,scrollbars=yes";

    if ( size ) {

        width = size === "parent" ? window.document.documentElement.clientWidth : size.width;
        height = size === "parent" ? window.document.documentElement.clientHeight : size.height;

        childWindow = window.open( "", "", "width=" + width + ",height=" + height + sizedDefaultProps );

    } else {

        childWindow = window.open();

    }

    if ( childWindow ) {

        // Setting the document content (using plain JS - jQuery can't write an entire HTML document, including the
        // doctype and <head> tags).
        childWindow.document.open();
        childWindow.document.write( '<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n<title></title>\n</head>\n<body>\n</body>\n</html>' );
        childWindow.document.close();

    }

    if ( readyDfd ) {
        if ( ! varExists( $ ) ) throw new Error( "`$` variable is not available. For using a readyDfd, jQuery (or a compatible library) must be loaded" );

        if (  childWindow && childWindow.document ) {
            $( childWindow.document ).ready ( function () {
                windowSizeReady( childWindow, readyDfd );
            } );
        } else {
            readyDfd.reject();
        }
    }

    return childWindow;
}

/**
 * Creates an iframe with an HTML5 doctype and UTF-8 encoding. Appends it to the body, or to another specified parent
 * element. Alternatively, the iframe can be prepended to the parent.
 *
 * @param   {Object}             [opts]
 * @param   {HTMLElement|jQuery} [opts.parent=document.body]  the parent element to which the iframe is appended
 * @param   {boolean}            [opts.prepend=false]         if true, the iframe gets prepended to the parent, rather than appended
 * @returns {HTMLIFrameElement}
 */
function createIframe ( opts ) {
    var parent = ( opts && opts.parent ) ? ( varExists( $ ) && opts.parent instanceof $ ) ? opts.parent[0] : opts.parent : document.body,
        _document = parent.ownerDocument,
        iframe = _document.createElement( "iframe" );

    iframe.frameborder = "0";

    if ( opts && opts.prepend ) {
        parent.insertBefore( iframe, parent.firstChild );
    } else {
        parent.appendChild( iframe );
    }

    iframe.src = 'about:blank';
    createIframeDocument( iframe );

    return iframe;
}

/**
 * Creates an iframe document with an HTML5 doctype and UTF-8 encoding.
 *
 * The iframe element MUST have been appended to the DOM by the time this function is called, and it must be a
 * descendant of the body element. A document inside an iframe can only be created when these conditions are met.
 *
 * @param   {HTMLIFrameElement|jQuery}  iframe
 * @returns {Document}
 */
function createIframeDocument ( iframe ) {
    if ( varExists( $ ) && iframe instanceof $ ) iframe = iframe[0];

    if ( ! iframe.ownerDocument.body.contains( iframe ) ) throw new Error( "The iframe has not been appended to the DOM, or is not a descendant of the body element. Can't create an iframe content document." );
    if ( ! iframe.contentDocument ) throw new Error( "Cannot access the iframe content document. Check for cross-domain policy restrictions." );

    iframe.contentDocument.write( '<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n<title></title>\n</head>\n<body>\n</body>\n</html>' );

    return iframe.contentDocument;
}

/**
 * Waits for the size of a window to become stable, in case it is undergoing a change. Returns a deferred which resolves
 * when the window size is stable.
 *
 * Optionally accepts an external jQuery deferred to act on, which is then returned instead.
 *
 * This check can be used to determine when the process of resizing a window has ended. It should also be used when a
 * new window is created.
 *
 * Technique
 * ---------
 *
 * In most cases, it would be enough to set a timeout of 0 and then resolve the deferred. The timeout frees the UI and
 * allows the window to assume its eventual size before the deferred is resolved.
 *
 * Unfortunately, the success rate of this approach is close to, but not quite, 100%. So instead, we check the reported
 * window size in regular intervals, so we know for sure when it is stable.
 *
 * @param {Window|jQuery}   queriedWindow   the window to observe, also accepted inside a jQuery `$( window )` wrapper
 * @param {jQuery.Deferred} [readyDfd]
 * @param {number}          [interval=100]  the interval for checking the window size, in ms
 *
 * @returns {jQuery.Deferred}
 */
function windowSizeReady ( queriedWindow, readyDfd, interval ) {

    if ( !varExists( $ ) ) throw new Error( "This method uses jQuery deferreds, but the $ variable is not available" );

    if ( queriedWindow instanceof $ ) queriedWindow = queriedWindow[0];

    readyDfd || ( readyDfd = $.Deferred() );

    $( queriedWindow.document ).ready( function () {

        var documentElement = queriedWindow.document.documentElement,
            lastSize = { width: documentElement.clientWidth, height: documentElement.clientHeight },

            repeater = setInterval( function () {

                var width = documentElement.clientWidth,
                    height = documentElement.clientHeight,
                    isStable = width > 0 && height > 0 && width === lastSize.width && height === lastSize.height;

                if ( isStable ) {
                    clearInterval( repeater );
                    readyDfd.resolve();
                } else {
                    lastSize = { width: width, height: height };
                }

            }, interval || 100 );

    } );

    return readyDfd;

}

/**
 * Makes sure a window is as at least as large as the specified minimum. If the window is too small, an error
 * is thrown.
 *
 * Optionally, it can be validated that the window matches the expected size exactly.
 *
 * @param {Object}  expected
 * @param {number}  expected.width
 * @param {number}  expected.height
 * @param {Object}  [opts]
 * @param {Object}  [opts.window=window]  a window handle, defaults to the global `window`
 * @param {boolean} [opts.exactly=false]
 */
function validateWindowSize ( expected, opts ) {
    var msg = "",
        documentElement = ( opts && opts.window || window ).document.documentElement,
        width = documentElement.clientWidth,
        height = documentElement.clientHeight;

    if ( opts && opts.exactly ) {
        if ( width !== expected.width ) msg = " Window width is " + width + "px (expected: " + expected.width + "px).";
        if ( height !== expected.height ) msg += " Window height is " + height + "px (expected: " + expected.height + "px).";
    } else {
        if ( width < expected.width ) msg = " Window width is " + width + "px (expected minimum: " + expected.width + "px).";
        if ( height < expected.height ) msg += " Window height is " + height + "px (expected minimum: " + expected.height + "px).";
    }

    if ( msg !== "" ) throw new Error( "The browser window does not match the expected size." + msg );
}

/**
 * Feature-tests that an iframe expands to show its content, even if given an explicit width and height. This is the
 * case on iOS.
 *
 * For some background on expanding iframes in iOS, see
 * http://dev.magnolia-cms.com/blog/2012/05/strategies-for-the-iframe-on-the-ipad-problem/
 *
 * @returns {boolean}
 */
function testIframeExpands () {
    var _document, _documentElement, expands,
        iframe = createIframe();

    iframe.style.cssText = "width: 50px; height: 50px; padding: 0px; border: none; margin: 0px;";

    _document = iframe.contentDocument;
    _documentElement = _document.documentElement;

    _document.body.style.cssText = "width: 100px; height: 100px;";

    expands = parseFloat( _documentElement.clientWidth ) > 50 || parseFloat( _documentElement.clientHeight ) > 50;

    document.body.removeChild( iframe );

    return expands;
}

/**
 * Detects if the browser is on iOS. Works for Safari as well as other browsers, say, Chrome on iOS.
 *
 * Required for some iOS behaviour which can't be feature-detected in any way.
 *
 * @returns {boolean}
 */
function isIOS () {
    return /iPad|iPhone|iPod/g.test( navigator.userAgent );
}
