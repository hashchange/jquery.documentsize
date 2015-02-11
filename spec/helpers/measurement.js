var browserBehaviour;

function measureDocumentScrollSize ( $html, $body, $content, reachableAreaOnly ) {

    var rightWindowContentEdge, bottomWindowContentEdge,
        htmlRect, bodyRect, contentRect,
        htmlBottomEdge, bodyBottomEdge,

        html = $html[0],
        body = $body[0],
        content = $content[0],

        _document = html.ownerDocument,
        _window = _document.defaultView || _document.parentWindow,
        $window = $( _window ),

        htmlMarginBottom = parseFloat( $html.css( "marginBottom" ) ),
        bodyMarginBottom = parseFloat( $body.css( "marginBottom" ) ),
        contentMarginBottom = parseFloat( $content.css( "marginBottom" ) ),

        htmlPosition = $html.css( "position" ),
        bodyPosition = $body.css( "position" ),
        contentPosition = $content.css( "position" ),

        appliedOverflows = getAppliedViewportOverflows(
            $html.css( [ "overflow", "overflowX", "overflowY" ] ),
            $body.css( [ "overflow", "overflowX", "overflowY" ] )
        );

    // Make sure we have tested the behaviour of the browser
    if ( browserBehaviour === undefined ) browserBehaviour = testBrowserBehaviour();

    // Make sure everything is scrolled to the top before taking measurements
    html.scrollTop = body.scrollTop = content.scrollTop = 0;

    // Because we have control of the scroll, we can establish the absolute right and bottom boundaries with
    // getBoundingClientRect, saving us from fussy calculations based on position and offsets.
    htmlRect = getBoundingClientRectCompat( document.documentElement );
    bodyRect = getBoundingClientRectCompat( body );
    contentRect = getBoundingClientRectCompat( content );

    // Handle special cases for the bottom edge of the body, and of the documentElement.
    bodyBottomEdge = getBottomEdge( $body, bodyRect, bodyPosition, bodyMarginBottom, browserBehaviour.element );
    htmlBottomEdge = getBottomEdge( $html, htmlRect, htmlPosition, htmlMarginBottom, browserBehaviour.documentElement );

    // Horizontal dimension
    if ( appliedOverflows.window.overflowHiddenX && reachableAreaOnly ) {

        // Nothing is shown beyond the edge of the window. The style `html { overflow: hidden; }` is applied to the
        // window, not the html element. That matters if the html element is larger than the window, e.g. with
        // `html { width: 120%; }`. Content is unreachable beyond the window edge (and not just beyond the html
        // edge).
        //
        // This limit does **not** affect the scrollWidth of the document because scrollWidth captures the size of the
        // content even if it is hidden. Only relevant if we want to know the size of the "reachable area".
        rightWindowContentEdge = $window.width();

    } else {

        if ( appliedOverflows.body.overflowVisibleX || bodyPosition === "static" && contentPosition === "absolute" ) {

            // Overflowing content is not constrained by the limits of the body
            rightWindowContentEdge = Math.max(
                // Right body content edge
                contentRect.right,
                // Right edge of body element
                bodyRect.right,
                // Right edge of the html element (document element)
                htmlRect.right
            );

        } else {

            // Overflowing content is hidden outside the limits of the body, or tucked away in a scrollable area - ignore
            rightWindowContentEdge = Math.max(
                // Right body edge
                bodyRect.right,
                // Right edge of the html element (document element)
                htmlRect.right
            );

        }
    }

    // Vertical dimension
    if ( appliedOverflows.window.overflowHiddenY && reachableAreaOnly ) {

        // Nothing is shown beyond the edge of the window. The style `html { overflow: hidden; }` is applied to the
        // window, not the html element. That matters if the html element is larger than the window, e.g. with
        // `html { width: 120%; }`. Content is unreachable beyond the window edge (and not just beyond the html
        // edge).
        //
        // This limit does **not** affect the scrollHeight of the document because scrollHeight captures the size of the
        // content even if it is hidden. Only relevant if we want to know the size of the "reachable area".
        bottomWindowContentEdge = $window.width();

    } else {

        if ( appliedOverflows.body.overflowVisibleY || bodyPosition === "static" && contentPosition === "absolute" ) {

            // Overflowing content is not constrained by the limits of the body
            bottomWindowContentEdge = Math.max(
                // Bottom body content edge
                contentRect.bottom + contentMarginBottom,
                // Bottom edge of body element
                bodyBottomEdge,
                // Bottom edge of the html element (document element)
                htmlBottomEdge
            );

        } else {

            // Overflowing content is hidden outside the limits of the body, or tucked away in a scrollable area - ignore
            bottomWindowContentEdge = Math.max(
                // Bottom body edge
                bodyBottomEdge,
                // Bottom edge of the html element (document element)
                htmlBottomEdge
            );

        }
    }

    return {

        width: Math.max(
            rightWindowContentEdge,
            // Right window edge, in case the document is smaller than the window
            $window.width()
        ),

        height: Math.max(
            bottomWindowContentEdge,
            // Bottom window edge, in case the document is smaller than the window
            $window.height()
        )

    };
}

/**
 * Returns the bounding client rect, including width and height properties. For compatibility with IE8, which
 * supports getBoundingClientRect but doesn't calculate width and height.
 *
 * Use only when width and height are actually needed.
 *
 * Will be removed when IE8 support is dropped entirely.
 *
 * @param   {HTMLElement} elem
 * @returns {ClientRect}
 */
function getBoundingClientRectCompat ( elem ) {
    var elemRect = elem.getBoundingClientRect();

    if ( elemRect.width === undefined || elemRect.height === undefined ) {
        // Fix for IE8
        elemRect = {
            top: elemRect.top,
            left: elemRect.left,
            bottom: elemRect.bottom,
            right: elemRect.right,
            width:  elemRect.right - elemRect.left,
            height: elemRect.bottom - elemRect.top
        };
    }

    return elemRect;
}

/**
 * Determines the effective overflow setting of an element, separately for each axis, based on the `overflow`,
 * `overflowX` and `overflowY` properties of the element which must be passed in as a hash.
 *
 * Returns a hash of the computed results for overflowX, overflowY. Also adds boolean status properties to the hash
 * if the createBooleans flag is set. These are properties for mere convenience. They signal if a particular
 * overflow type applies (e.g. overflowHiddenX = true/false).
 *
 * ATTN The method does not take the special relation of body and documentElement into account. That is handled by
 * the more specific getAppliedViewportOverflows() function.
 *
 * The effective overflow setting is established as follows:
 *
 * - If a computed value for `overflow(X/Y)` exists, it gets applied to the axis.
 * - If not, the computed value of the general `overflow` setting gets applied to the axis.
 * - If there is no computed value at all, the overflow default gets applied to the axis. The default is
 *   "visible" in seemingly every browser out there. Falling back to the default should never be necessary,
 *   though, because there always is a computed value.
 *
 * @param {Object}        props            hash of element properties (computed values)
 * @param {string}        props.overflow
 * @param {string}        props.overflowX
 * @param {string}        props.overflowY
 * @param {boolean=false} createBooleans   if true, create the full set of boolean status properties, e.g.
 *                                         overflowVisibleX (true/false), overflowHiddenY (true/false) etc
 * @returns {AppliedOverflow}              hash of the computed results: overflowX, overflowY, optional boolean
 *                                         status properties
 */
function getAppliedOverflows ( props, createBooleans ) {
    var status = {};

    // Establish the applied overflow (e.g. overflowX: "scroll")
    status.overflowX = props.overflowX || props.overflow || "visible";
    status.overflowY = props.overflowY || props.overflow || "visible";

    // Create the derived boolean status properties (e.g overflowScrollX: true)
    if ( createBooleans ) {
        $.each( [ "Visible", "Auto", "Scroll", "Hidden" ], function ( index, type ) {
            var lcType = type.toLowerCase();
            status["overflow" + type + "X"] = status.overflowX === lcType;
            status["overflow" + type + "Y"] = status.overflowY === lcType;
        } );
    }

    return status;
}

/**
 * Determines the effective overflow setting of the viewport and body, separately for each axis, based on the
 * `overflow`, `overflowX` and `overflowY` properties of the documentElement and body which must be passed in as a
 * hash.
 *
 * Returns the results for viewport and body in an aggregated `{ window: ..., body: ...}` hash.
 *
 * For the basic resolution mechanism, see getAppliedOverflows(). When determining the effective overflow, the
 * peculiarities of viewport and body are taken into account:
 *
 * - Viewport and body overflows are interdependent. If the nominal viewport overflow for a given axis is "visible",
 *   the viewport inherits the body overflow for that axis, and the body overflow is set to "visible". Curiously,
 *   that transfer is _not_ reflected in the computed values, it just manifests in behaviour.
 *
 * - Once that is done, if the viewport overflow is still "visible" for an axis, it is effectively turned into
 *   "auto". Scroll bars appear when the content overflows the viewport (ie, "auto" behaviour). Hence, this function
 *   will indeed report "auto". Again, the transformation is only manifest in behaviour, not in the computed values.
 *
 * - In iOS, if the effective overflow setting of the viewport is "hidden", it is ignored and treated as "auto".
 *   Content can still overflow the viewport, and scroll bars appear as needed.
 *
 *   Now, the catch. This behaviour is impossible to feature-detect. The computed values are not at all affected by
 *   it, and the results reported eg. for clientHeight, offsetHeight, scrollHeight of body and documentElement do
 *   not differ between Safari on iOS and, say, Chrome. The numbers don't give the behaviour away.
 *
 *   So we have to resort to browser sniffing here. It sucks, but there is literally no other option.
 *
 * NB Additional status properties (see getAppliedOverflows) are always generated here.
 *
 * @param {Object} documentElementProps            hash of documentElement properties (computed values)
 * @param {string} documentElementProps.overflow
 * @param {string} documentElementProps.overflowX
 * @param {string} documentElementProps.overflowY
 *
 * @param {Object} bodyProps                       hash of body properties (computed values)
 * @param {string} bodyProps.overflow
 * @param {string} bodyProps.overflowX
 * @param {string} bodyProps.overflowY
 *
 * @returns {{window: AppliedOverflow, body: AppliedOverflow}}
 */
function getAppliedViewportOverflows ( documentElementProps, bodyProps ) {
    var _window = getAppliedOverflows( documentElementProps, false ),
        body = getAppliedOverflows( bodyProps, false ),
        consolidated = { window: {}, body: {} };

    // Handle the interdependent relation between body and window (documentElement) overflow
    if ( _window.overflowX === "visible" ) {
        // If the window overflow is set to "visible", body props get transferred to the window, body changes to
        // "visible". (Nothing really changes if both are set to "visible".)
        consolidated.body.overflowX = "visible";
        consolidated.window.overflowX = body.overflowX;
    } else {
        // No transfer of properties.
        // - If body overflow is "visible", it remains that way, and the window stays as it is.
        // - If body and window are set to properties other than "visible", they keep their divergent settings.
        consolidated.body.overflowX = body.overflowX;
        consolidated.window.overflowX = _window.overflowX;
    }

    // Repeat for overflowY
    if ( _window.overflowY === "visible" ) {
        consolidated.body.overflowY = "visible";
        consolidated.window.overflowY = body.overflowY;
    } else {
        consolidated.body.overflowY = body.overflowY;
        consolidated.window.overflowY = _window.overflowY;
    }

    // window.overflow(X/Y): "visible" actually means "auto" because scroll bars appear as needed; transform
    if ( consolidated.window.overflowX === "visible" ) consolidated.window.overflowX = "auto";
    if ( consolidated.window.overflowY === "visible" ) consolidated.window.overflowY = "auto";

    // In iOS, window.overflow(X/Y): "hidden" actually means "auto"; transform
    if ( isIOS() ) {
        if ( consolidated.window.overflowX === "hidden" ) consolidated.window.overflowX = "auto";
        if ( consolidated.window.overflowY === "hidden" ) consolidated.window.overflowY = "auto";
    }

    // Add the boolean status properties to the result
    consolidated.window = getAppliedOverflows( consolidated.window, true );
    consolidated.body = getAppliedOverflows( consolidated.body, true );

    return consolidated;
}

/**
 * Handles the special cases when determining the bottom edge of the body or the documentElement, based on the results
 * of the relevant browser behaviour test (either the one for the documentElement, or the one for all other elements).
 *
 * The following rules apply:
 *
 * - Generally, the edge is the bottom margin edge.
 * - Some browsers always collapse the bottom margin when it pushes against the document boundary, so the edge of the
 *   element is the bottom border edge.
 * - Some browsers collapse the bottom margin if the element is positioned absolutely.
 * - Some browsers collapse the bottom margin if the element is positioned relatively.
 * - If the element is positioned relatively, some browsers keep the bottom margin intact, but do not reposition it.
 *   The margin creates space in its original location. As a result, the bottom edge of the element is either at its
 *   unpositioned margin edge, or at the border edge of the repositioned element - whichever is further down.
 *
 * NB The function uses the ClientRect of the element, which is relative to the window. The calculation is only
 * correct if the container (usually, the window) is NOT scrolled down (scrollTop = 0).
 *
 * @param   {jQuery}           $element             body or documentElement
 * @param   {ClientRect}       elementRect
 * @param   {string}           elementPosition
 * @param   {number}           elementMarginBottom
 * @param   {BrowserBehaviour} browserBehaviour
 * @returns {number}
 */
function getBottomEdge ( $element, elementRect, elementPosition, elementMarginBottom, browserBehaviour ) {

    var bottomEdge,

        noMargin = ( elementPosition === "static" && !browserBehaviour.static.pushingDocumentEdge.keepsBottomMargin ) ||
                   ( elementPosition === "absolute" && !browserBehaviour.absolute.keepsBottomMargin ) ||
                   // Doesn't even keep the margin if the element stays in its original place, margin always collapses.
                   ( elementPosition === "relative" && !browserBehaviour.relative.inPlace.keepsBottomMargin );


    if ( noMargin ) {

        bottomEdge = elementRect.bottom;

    } else if ( elementPosition === "relative" && !browserBehaviour.relative.shifted.keepsBottomMargin ) {

        // Even though the margin doesn't collapse, it stays in its original place and doesn't shift its position
        // together with the documentElement (IE)
        bottomEdge = Math.max(
            elementRect.bottom,
            elementRect.bottom - parseFloat( $element.css( "top" ) ) + elementMarginBottom
        );

    } else {

        // Normal behaviour
        bottomEdge = elementRect.bottom + elementMarginBottom;

    }

    return bottomEdge;

}

/**
 * Tests the browser behaviour with regard to bottom margins and returns the results in an object.
 *
 * @returns {{ documentElement: BrowserBehaviour, element: BrowserBehaviour }}
 */
function testBrowserBehaviour () {
    var behaviour = {
            documentElement: testHtmlKeepsBottomMargin(),
            element: testElementKeepsBottomMargin()
        };

    log(
        "Browser features, as detected:\n" +
        'documentElement, position: "static". Bottom margin is preserved: ' + behaviour.documentElement.static.pushingDocumentEdge.keepsBottomMargin + "\n" +
        'documentElement, position: "absolute". Bottom margin is preserved: ' + behaviour.documentElement.absolute.keepsBottomMargin + "\n" +
        'documentElement, position: "relative", left in its original position. Bottom margin is preserved: ' + behaviour.documentElement.relative.inPlace.keepsBottomMargin + "\n" +
        'documentElement, position: "relative", shifted downwards from its original position. Bottom margin is preserved (moves with the element): ' + behaviour.documentElement.relative.shifted.keepsBottomMargin + "\n\n" +
        'Normal HTML element (including body), position: "static". Bottom margin is preserved: ' + behaviour.element.static.pushingElementEdge.keepsBottomMargin + "\n" +
        'Normal HTML element (including body), position: "static", pushing against the bottom document edge. Bottom margin is preserved: ' + behaviour.element.static.pushingDocumentEdge.keepsBottomMargin + "\n" +
        'Normal HTML element (including body), position: "absolute". Bottom margin is preserved: ' + behaviour.element.absolute.keepsBottomMargin + "\n" +
        'Normal HTML element (including body), position: "relative", left in its original position. Bottom margin is preserved: ' + behaviour.element.relative.inPlace.keepsBottomMargin + "\n" +
        'Normal HTML element (including body), position: "relative", shifted downwards from its original position. Bottom margin is preserved (moves with the element): ' + behaviour.element.relative.shifted.keepsBottomMargin
    );

    return behaviour;
}

/**
 * Tests how a browser treats the bottom margin of of the documentElement in various scenarios. Returns an object with
 * the respective behaviours, each true if the bottom margin in preserved.
 *
 * - Tests if the bottom margin of the documentElement is preserved when the element is larger than the viewport, or if
 *   the bottom margin collapses.
 *
 *   Chrome and friends preserve that margin, FF collapses it.
 *
 * - Tests if the bottom margin is preserved when the documentElement is positioned absolutely.
 *
 *   (Only IE requires this test because it preserves the margin generally, but collapses it when the documentElement is
 *   positioned. Observed in IE11. FF also collapses it, but does it in any scenario.)
 *
 * - Tests if the bottom margin is preserved when the documentElement is positioned relatively, but left in its original
 *   place. (FF collapses it.)
 *
 * - Tests if the bottom margin is preserved when the documentElement is positioned relatively, and shifted downwards.
 *   That shift is large enough to move the bottom edge of the documentElement beneath its original margin edge.
 *
 *   Again, this appears to be an IE-only case. But the bottom margin does not in fact collapse. It simply does not move
 *   along as the documentElement is repositioned. The bottom margin is left behind, and it continues to take up space
 *   in the document at its original location.
 *
 * NB For the test, we manipulate the bottom margin of a reasonably large document (larger than the viewport) and
 * observe the response of the scrollHeight in the documentElement and body. If either reflects the change, the bottom
 * margin is honoured.
 *
 * @returns {BrowserBehaviour}
 */
function testHtmlKeepsBottomMargin () {

    var ddEScrollHeightNoMargin, bodyScrollHeightNoMargin,
        ddEScrollHeightWithMargin, bodyScrollHeightWithMargin,
        respondsStatic, respondsAbsolute, respondsRelativeInPlace, respondsRelativeShifted,

        iframe = createIframe( {
            elementStyles: "position: absolute; top: -5000px; left: -5000px; width: 500px; height: 500px; margin: 0px; padding: 0px; border: none;"
        } ),
        _document = iframe.contentDocument,
        ddE = _document.documentElement,
        body = _document.body,
        ddEStyle = ddE.style;

    // Configuration without bottom margin
    ddEStyle.height = ddE.clientHeight + 1000 + "px";   // window height + 1000px
    ddEStyle.marginBottom = "0px";

    ddEScrollHeightNoMargin = ddE.scrollHeight;
    bodyScrollHeightNoMargin = body.scrollHeight;

    // Configuration with bottom margin, for comparison
    ddEStyle.marginBottom = "10px";

    // Hack, forcing a reflow. IE doesn't show the margin, or reflect it in the scrollHeight, without forcing a reflow
    // like this.
    forceReflow( ddE );

    respondsStatic = body.scrollHeight > bodyScrollHeightNoMargin || ddE.scrollHeight > ddEScrollHeightNoMargin;

    // Switch to absolute positioning
    ddEStyle.position = "absolute";
    respondsAbsolute = body.scrollHeight > bodyScrollHeightNoMargin || ddE.scrollHeight > ddEScrollHeightNoMargin;

    // Switch to relative positioning
    ddEStyle.position = "relative";
    respondsRelativeInPlace = body.scrollHeight > bodyScrollHeightNoMargin || ddE.scrollHeight > ddEScrollHeightNoMargin;

    // Measure the scroll height when the element is shifted downwards, and has a margin
    ddEStyle.top = "100px";
    ddEScrollHeightWithMargin = ddE.scrollHeight;
    bodyScrollHeightWithMargin = body.scrollHeight;

    // Removed the margin in shifted position, compare
    ddEStyle.marginBottom = "0px";
    forceReflow( ddE );

    respondsRelativeShifted = body.scrollHeight < bodyScrollHeightWithMargin || ddE.scrollHeight < ddEScrollHeightWithMargin;

    // Remove iframe
    document.body.removeChild( iframe );

    return {
        static: {
            pushingElementEdge: { keepsBottomMargin: respondsStatic },      // doesn't really apply, always pushes the document edge
            pushingDocumentEdge: { keepsBottomMargin: respondsStatic }
        },
        absolute: { keepsBottomMargin: respondsAbsolute },
        relative: {
            inPlace: { keepsBottomMargin: respondsRelativeInPlace },
            shifted: { keepsBottomMargin: respondsRelativeShifted }
        }
    };

    function forceReflow ( element ) {
        // For the technique, see http://stackoverflow.com/a/14382251/508355
        $( element ).css( { display: "none" } ).height();
        $( element ).css( { display: "block" } );
    }

}

/**
 * Tests how a browser treats the bottom margin of an element in various scenarios. Returns an object with the
 * respective behaviours, each true if the bottom margin in preserved.
 *
 * - Tests if the bottom margin of an element is preserved when the element is larger than its (scrollable) container,
 *   or if the bottom margin collapses in that case.
 *
 * - Tests if the bottom margin of an element is preserved when the element overflows its container and all other parent
 *   elements, and pushes against the bottom edge of the document. (Safari collapses it.)
 *
 * - Tests if the bottom margin of an element is preserved when it is positioned absolutely. (FF collapses it.)
 *
 * - Tests if the bottom margin is preserved when an element is positioned relatively, but left in its original place.
 *   (FF collapses it.)
 *
 * - Tests if the bottom margin is preserved when an element is positioned relatively, and shifted downwards. That shift
 *   is large enough to move the bottom edge of the element beneath its original margin edge.
 *
 *   FF does not preserve it. But the bottom margin does not in fact collapse. It simply does not move along as the
 *   element is repositioned. The bottom margin is left behind, and it continues to take up space in the document at its
 *   original location.
 *
 * @returns {BrowserBehaviour}
 */
function testElementKeepsBottomMargin () {

    var containerScrollHeightNoMargin, containerScrollHeightWithMargin,
        bodyScrollHeightNoMargin, ddEScrollHeightNoMargin,
        respondsStatic, respondsStaticPushingDocument, respondsAbsolute, respondsRelativeInPlace, respondsRelativeShifted,

        iframe = createIframe( {
            elementStyles: "position: absolute; top: -5000px; left: -5000px; width: 500px; height: 500px; margin: 0px; padding: 0px; border: none;"
        } ),
        _document = iframe.contentDocument,

        defaultStyle = "padding: 0px; border: none; margin: 0px;",
        element = _document.createElement( "div" ),
        container = _document.createElement( "div" ),
        body = _document.body,
        ddE = _document.documentElement,

        elementStyle = element.style,
        containerStyle = container.style;

    // Configuration without bottom margin
    containerStyle.cssText = defaultStyle + " width: 100px; height: 100px; overflow: auto; position: absolute; top: 0px; left: 0px;";
    elementStyle.cssText = defaultStyle + " width: 150px; height: 150px;";

    container.appendChild( element );
    body.appendChild( container );

    containerScrollHeightNoMargin = container.scrollHeight;

    // Configuration with bottom margin, for comparison
    elementStyle.marginBottom = "10px";

    respondsStatic = container.scrollHeight > containerScrollHeightNoMargin;

    // Switch to absolute positioning
    elementStyle.position = "absolute";
    respondsAbsolute = container.scrollHeight > containerScrollHeightNoMargin;

    // Switch to relative positioning
    elementStyle.position = "relative";
    respondsRelativeInPlace = container.scrollHeight > containerScrollHeightNoMargin;

    // Measure the scroll height when the element is shifted downwards, and has a margin
    elementStyle.top = "100px";
    containerScrollHeightWithMargin = container.scrollHeight;

    // Removed the margin in shifted position, compare
    elementStyle.marginBottom = "0px";

    respondsRelativeShifted = container.scrollHeight < containerScrollHeightWithMargin;

    // Second run with static positioning, but pushing the bottom document edge this time
    elementStyle.position = "static";
    elementStyle.top = "0px";
    elementStyle.height = ddE.clientHeight + 1000 + "px";   // window height + 1000px;

    containerStyle.position = "static";
    containerStyle.overflow = "visible";
    body.style.height = "100px";

    containerScrollHeightNoMargin = container.scrollHeight;
    bodyScrollHeightNoMargin = body.scrollHeight;
    ddEScrollHeightNoMargin = ddE.scrollHeight;

    elementStyle.marginBottom = "10px";
    respondsStaticPushingDocument = container.scrollHeight > containerScrollHeightNoMargin || body.scrollHeight > bodyScrollHeightNoMargin || ddE.scrollHeight > ddEScrollHeightNoMargin;

    // Remove iframe
    document.body.removeChild( iframe );

    return {
        static: {
            pushingElementEdge: { keepsBottomMargin: respondsStatic },
            pushingDocumentEdge: { keepsBottomMargin: respondsStaticPushingDocument }
        },
        absolute: { keepsBottomMargin: respondsAbsolute },
        relative: {
            inPlace: { keepsBottomMargin: respondsRelativeInPlace },
            shifted: { keepsBottomMargin: respondsRelativeShifted }
        }
    };

}

/**
 * @name  AppliedOverflow
 * @type  {Object}
 *
 * @property {string}  overflowX
 * @property {string}  overflowY
 * @property {boolean} overflowVisibleX
 * @property {boolean} overflowVisibleY
 * @property {boolean} overflowAutoX
 * @property {boolean} overflowAutoY
 * @property {boolean} overflowScrollX
 * @property {boolean} overflowScrollY
 * @property {boolean} overflowHiddenX
 * @property {boolean} overflowHiddenY
 */

/**
 * @name  BrowserBehaviour
 * @type  {Object}
 *
 * @property {Object}  static
 * @property {Object}  static.pushingDocumentEdge
 * @property {boolean} static.pushingDocumentEdge.keepsBottomMargin
 * @property {Object}  static.pushingElementEdge
 * @property {boolean} static.pushingElementEdge.keepsBottomMargin
 * @property {Object}  absolute
 * @property {boolean} absolute.keepsBottomMargin
 * @property {Object}  relative
 * @property {Object}  relative.inPlace
 * @property {boolean} relative.inPlace.keepsBottomMargin
 * @property {Object}  relative.shifted
 * @property {boolean} relative.shifted.keepsBottomMargin
 */
