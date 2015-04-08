// jQuery.documentSize, v1.0.2
// Copyright (c)2015 Michael Heim, Zeilenwechsel.de
// Distributed under MIT license
// http://github.com/hashchange/jquery.documentsize

;( function ( $ ) {
    "use strict";

    // IIFE generating the $.documentWidth and $.documentHeight functions.
    //
    // These functions need to run a feature detection which requires insertion of an iframe. The body element in the
    // main document must be available when that happens (ie, the opening body tag must have been parsed). For that
    // reason, the detection does not run up front - after all, the code might be loaded and run while parsing the head.
    // Instead, detection happens when either $.documentWidth or $.documentHeight is invoked for the first time. Given
    // their purpose, they won't be called until after the opening body tag has been parsed.

    var elementNameForDocSizeQuery,
        useGetComputedStyle = !! window.getComputedStyle;

    $.documentWidth = function ( _document ) {
        _document || ( _document = document );
        if ( elementNameForDocSizeQuery === undefined ) testDocumentScroll();
        return _document[elementNameForDocSizeQuery].scrollWidth;
    };

    $.documentHeight = function ( _document ) {
        _document || ( _document = document );
        if ( elementNameForDocSizeQuery === undefined ) testDocumentScroll();
        return _document[elementNameForDocSizeQuery].scrollHeight;
    };

    // Let's prime $.documentWidth() and $.documentHeight() immediately after the DOM is ready. It is best to do it up
    // front because the test touches the DOM, so let's get it over with before people set up handlers for mutation
    // events and such.
    if ( typeof $ === "function" ) {
        $( function () {
            if ( elementNameForDocSizeQuery === undefined ) testDocumentScroll();
        } );
    }


    /**
     * Detects which element to use for a document size query (body or documentElement).
     *
     * Sandbox
     * -------
     *
     * The detection is sandboxed in an iframe element created for the purpose. If the iframe window can't be
     * accessed because of some obscure policy restriction or browser bug, the main window and document is used
     * as a fallback.
     *
     * The test is designed to minimize the visual and rendering impact in the test window, in case the fallback
     * should ever be used.
     *
     * Test method
     * -----------
     *
     * We can't test directly which call to use (at least not with an even worse amount of intervention than is
     * already the case, which matters if the iframe is not accessible). But we can work by exclusion.
     *
     * In Chrome (desktop and mobile), Safari (also iOS), and Opera, body.scrollWidth returns the true document
     * width. In Firefox and IE, body.scrollWidth responds to the body content size instead. In those browsers,
     * true document width is returned by document.documentElement.scrollWidth.
     *
     * So we test the behaviour of body.scrollWidth by manipulating the body size, while keeping the document size
     * constant.
     *
     * - We prepare for the test by making sure the body does not display its overflow.
     * - Then we inject a small test element into the body and give it a relative position far outside the viewport.
     *
     * The body size is expanded, but the document size remains unaffected because the body hides the overflowing
     * test element (either outright, or by putting it in a hidden part of the scroll pane). Then we check if
     * body.scrollWidth has responded to the change. From that, we infer the right element to use for a document
     * width query.
     *
     * The function does not return anything. It sets the elementNameForDocSizeQuery in the closure instead.
     */
    function testDocumentScroll () {

        var initialDocumentState, _testEl, initialScrollWidth, responds,

            iframe = createTestIframe(),
            _document = iframe && iframe.contentDocument || document,
            _body = _document.body,
            inIframe = _document !== document;

        // Create a test element which will be used to to expand the body content way to the right.
        _testEl = _document.createElement( "div" );
        _testEl.style.cssText = "width: 1px; height: 1px; position: relative; top: 0px; left: 32000px;";

        // Make sure that the body (but not the window) hides its overflow. Only applies if the iframe is not
        // accessible. The iframe document already contains the required styles.
        if ( ! inIframe ) initialDocumentState = prepareGlobalDocument();

        // Inject the test element, then test if the body.scrollWidth property responds
        initialScrollWidth = _body.scrollWidth;
        _body.appendChild( _testEl );
        responds = initialScrollWidth !== _body.scrollWidth;
        _body.removeChild( _testEl );

        // Restore the overflow settings for window and body
        if ( ! inIframe ) restoreGlobalDocument( initialDocumentState );

        // If body.scrollWidth responded, it reacts to body content size, not document size. Default to
        // ddE.scrollWidth. If it did not react, however, it is linked to the (unchanged) document size.
        elementNameForDocSizeQuery = responds ? "documentElement" : "body";

        document.body.removeChild( iframe );

    }

    /**
     * Creates an iframe document with an HTML5 doctype and UTF-8 encoding and positions it off screen. Window size
     * is 500px x 500px. Body and window (document element) are set to overflow: hidden.
     *
     * In case the content document of the iframe can't be accessed for some reason, the function returns undefined.
     * This is unlikely to ever happen, though.
     *
     * @returns {HTMLIFrameElement|undefined}
     */
    function createTestIframe () {
        var iframe = document.createElement( "iframe" ),
            body = document.body;

        iframe.style.cssText = "position: absolute; top: -600px; left: -600px; width: 500px; height: 500px; margin: 0px; padding: 0px; border: none; display: block;";
        iframe.frameborder = "0";

        body.appendChild( iframe );
        iframe.src = 'about:blank';

        if ( !iframe.contentDocument ) return;

        iframe.contentDocument.write( '<!DOCTYPE html><html><head><meta charset="UTF-8"><title></title><style type="text/css">html, body { overflow: hidden; }</style></head><body></body></html>' );

        return iframe;
    }

    /**
     * Makes sure the body (but not the window) hides its overflow. Works with the global document, returns the initial
     * state before manipulation (including properties indicating what has been modified).
     *
     * Used only if iframe creation or access has failed for some reason.
     */
    function prepareGlobalDocument () {
        var ddEStyle, bodyStyle,

            ddE = document.documentElement,
            body = document.body,

            ddEComputedStyles = useGetComputedStyle ? window.getComputedStyle( ddE, null ) : ddE.currentStyle,
            bodyComputedStyles = useGetComputedStyle ? window.getComputedStyle( body, null ) : body.currentStyle,

            ddEOverflowX = ( ddEComputedStyles.overflowX || ddEComputedStyles.overflow || "visible" ).toLowerCase(),
            bodyOverflowX = ( bodyComputedStyles.overflowX || bodyComputedStyles.overflow || "visible" ).toLowerCase(),

            modifyBody = bodyOverflowX !== "hidden",
            modifyDocumentElement = ddEOverflowX === "visible",

            initialState = {
                documentElement: {
                    modified: modifyDocumentElement
                },
                body: {
                    modified: modifyBody
                }
            };

        if ( modifyDocumentElement ) {
            ddEStyle = ddE.style;
            initialState.documentElement.styleOverflowX = ddEStyle.overflowX;
            ddEStyle.overflowX = "auto";
        }

        if ( modifyBody ) {
            bodyStyle = body.style;
            initialState.body.styleOverflowX = bodyStyle.overflowX;
            bodyStyle.overflowX = "hidden";
        }

        return initialState;

    }

    /**
     * Restores the body and documentElement styles to their initial state, which is passed in as an argument. Works
     * with the global document.
     *
     * Used only if iframe creation or access has failed for some reason.
     *
     * @param {Object} previousState  the initial state, as returned by prepareGlobalDocument()
     */
    function restoreGlobalDocument ( previousState ) {

        if ( previousState.documentElement.modified ) document.documentElement.style.overflowX = previousState.documentElement.styleOverflowX;
        if ( previousState.body.modified ) document.body.style.overflowX = previousState.body.styleOverflowX;

    }

}(
    typeof jQuery !== "undefined" ? jQuery :
    typeof Zepto !== "undefined" ? Zepto :
    $
));