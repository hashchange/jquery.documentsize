// amd.js

require( [

    'jquery',
    'underscore',
    'jquery.documentsize'

], function ( $ ) {

    $( function () {

        var $documentHeight = $( ".document .height" ),
            $documentWidth = $( ".document .width" ),

            $ddeClientHeight = $( ".dde .clientHeight" ),
            $ddeClientWidth = $( ".dde .clientWidth" ),

            $visualViewportHeight = $( ".visualViewport .height" ),
            $visualViewportWidth = $( ".visualViewport .width" ),

            $layoutViewportHeight = $( ".layoutViewport .height" ),
            $layoutViewportWidth = $( ".layoutViewport .width" ),

            $pinchZoomFactor = $( ".zoom .pinch" ),
            $nativePinchZoomFactor = $( ".zoom .nativePinch" ),

            $gBCRTop = $( ".gBCR .top" ),
            $gBCRLeft = $( ".gBCR ._left" ),
            $gBCRBottom = $( ".gBCR .bottom" ),
            $gBCRRight = $( ".gBCR ._right" ),

            $scrollTop = $( ".scroll .top" ),
            $scrollLeft = $( ".scroll ._left" ),
            $scrollY = $( ".scroll .y" ),
            $scrollX = $( ".scroll .x" ),

            $visualViewportPageTop = $( ".visualViewportApi .pageTop" ),
            $visualViewportPageLeft = $( ".visualViewportApi .pageLeft" ),
            $visualViewportOffsetTop = $( ".visualViewportApi .offsetTop" ),
            $visualViewportOffsetLeft = $( ".visualViewportApi .offsetLeft" ),

            $logPane = $( ".log" ),
            initialLogProps = {
                top: parseFloat( $logPane.css( "top" ) ),
                left: parseFloat( $logPane.css( "left" ) ),

                paddingTop: parseFloat( $logPane.css( "padding-top" ) ),
                paddingLeft: parseFloat( $logPane.css( "padding-left" ) ),
                paddingBottom: parseFloat( $logPane.css( "padding-bottom" ) ),
                paddingRight: parseFloat( $logPane.css( "padding-right" ) ),

                minWidth: parseFloat( $logPane.css( "min-width" ) ),
                maxWidth: parseFloat( $logPane.css( "max-width" ) ),

                dtFontSize: parseFloat( $( "dt", $logPane ).css( "font-size" ) ),
                dtLineHeight: parseFloat( $( "dt", $logPane ).css( "line-height" ) ),
                dtMinWidth: parseFloat( $( "dt", $logPane ).css( "min-width" ) ),

                ddFontSize: parseFloat( $( "dd", $logPane ).css( "font-size" ) ),
                ddLineHeight: parseFloat( $( "dd", $logPane ).css( "line-height" ) ),

                dlFontSize: parseFloat( $( "dl", $logPane ).css( "font-size" ) ),
                dlLineHeight: parseFloat( $( "dl", $logPane ).css( "line-height" ) ),
                dlMarginBottom: parseFloat( $( "dl", $logPane ).css( "margin-bottom" ) ),

                hrMarginTop: parseFloat( $( "hr", $logPane ).css( "margin-top" ) ),
                hrMarginBottom: parseFloat( $( "hr", $logPane ).css( "margin-bottom" ) )
            },

            $content = $( ".content" ),

            dde = document.documentElement,
            body = document.body,

            $window = $( window );


        if ( window.visualViewport ) {
            window.visualViewport.addEventListener( "scroll", _.throttle( update, 100 ) );
            window.visualViewport.addEventListener( "resize", _.throttle( update, 100 ) );
        }
        $window.on( "scroll", _.throttle( update, 100 ) );
        $window.on( "resize", _.throttle( update, 100 ) );
        $window.on( "orientationchange", update );
        update();

        showLog();

        function update () {

            var zoomFactor = $.pinchZoomFactor(),
                logOffset = {
                    top:  initialLogProps.top / zoomFactor,
                    left: initialLogProps.left / zoomFactor
                };

            logValues();
            scaleLog();
            resizeContent();
            fixPosition( $logPane, logOffset );

        }

        // Makes sure the log always keeps the same size, visually, as the user zooms in and out
        function scaleLog () {

            var zoomFactor = $.pinchZoomFactor(),
                logProps = {

                    top:           ( initialLogProps.top / zoomFactor ) + "px",
                    left:          ( initialLogProps.left / zoomFactor ) + "px",
                    paddingTop:    ( initialLogProps.paddingTop / zoomFactor ) + "px",
                    paddingLeft:   ( initialLogProps.paddingLeft / zoomFactor ) + "px",
                    paddingBottom: ( initialLogProps.paddingBottom / zoomFactor ) + "px",
                    paddingRight:  ( initialLogProps.paddingRight / zoomFactor ) + "px",
                    minWidth:      ( initialLogProps.minWidth / zoomFactor ) + "px",
                    maxWidth:      ( initialLogProps.maxWidth / zoomFactor ) + "px"

                },
                dtProps = {
                    fontSize:   ( initialLogProps.dtFontSize / zoomFactor ) + "px",
                    lineHeight: ( initialLogProps.dtLineHeight / zoomFactor ) + "px",
                    minWidth:   ( initialLogProps.dtMinWidth / zoomFactor ) + "px"
                },
                ddProps = {
                    fontSize:   ( initialLogProps.ddFontSize / zoomFactor ) + "px",
                    lineHeight: ( initialLogProps.ddLineHeight / zoomFactor ) + "px"
                },
                dlProps = {
                    fontSize:     ( initialLogProps.dlFontSize / zoomFactor ) + "px",
                    lineHeight:   ( initialLogProps.dlLineHeight / zoomFactor ) + "px",
                    marginBottom: ( initialLogProps.dlMarginBottom / zoomFactor ) + "px"
                },
                hrProps = {
                    marginTop:    ( initialLogProps.hrMarginTop / zoomFactor ) + "px",
                    marginBottom: ( initialLogProps.hrMarginBottom / zoomFactor ) + "px"
                };

            $logPane.css( logProps );
            $( "dt", $logPane ).css( dtProps );
            $( "dd", $logPane ).css( ddProps );
            $( "dl", $logPane ).css( dlProps );
            $( "hr", $logPane ).css( hrProps );
        }

        function logValues () {

            var zoomFactor, gBCR,
                supportsVisualViewportAPI = !!window.visualViewport,

                // Simplified method for getting the element which scrolls the document. Based in part on MDN:
                // https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollY#Notes
                //
                // For a truly bulletproof way to determine the scrollable element, based on feature testing, use
                // jquery.scrollable and call $window.scrollable(), or extract the method from its source.
                isCSS1Compat = ( ( document.compatMode || "" ) === "CSS1Compat" ),
                scrollableElement = document.scrollingElement || ( isCSS1Compat ? document.documentElement : document.body );


            $documentHeight.text( $.documentHeight() );
            $documentWidth.text( $.documentWidth() );

            $ddeClientHeight.text( dde.clientHeight );
            $ddeClientWidth.text( dde.clientWidth );

            $visualViewportHeight.text( $.windowHeight() );
            $visualViewportWidth.text( $.windowWidth() );

            $layoutViewportHeight.text( $.windowHeight( { viewport: "layout" } ) );
            $layoutViewportWidth.text( $.windowWidth( { viewport: "layout" } ) );

            zoomFactor = $.pinchZoomFactor();
            $pinchZoomFactor.text( round( zoomFactor, 4 ) );

            $nativePinchZoomFactor.text( supportsVisualViewportAPI ? round( window.visualViewport.scale, 4 ) : "n/a" );

            gBCR = body.getBoundingClientRect();
            $gBCRTop.text( gBCR.top );
            $gBCRLeft.text( gBCR.left );
            $gBCRBottom.text( gBCR.bottom );
            $gBCRRight.text( gBCR.right );

            $scrollTop.text( round( scrollableElement.scrollTop, 2 ) );
            $scrollLeft.text( round( scrollableElement.scrollLeft, 2 ) );
            $scrollY.text( round( window.scrollY, 2 ) );
            $scrollX.text( round( window.scrollX, 2 ) );

            $visualViewportPageTop.text( supportsVisualViewportAPI ? round( window.visualViewport.pageTop, 2 ) : "n/a" );
            $visualViewportPageLeft.text( supportsVisualViewportAPI ? round( window.visualViewport.pageLeft, 2 ) : "n/a" );
            $visualViewportOffsetTop.text( supportsVisualViewportAPI ? round( window.visualViewport.offsetTop, 2 ) : "n/a" );
            $visualViewportOffsetLeft.text( supportsVisualViewportAPI ? round( window.visualViewport.offsetLeft, 2 ) : "n/a" );

        }

        // Makes the content fit into the layout viewport, width-wise, even though the body is much wider.
        function resizeContent () {
            $content.css( { maxWidth: $.windowWidth( { viewport: "layout" } ) } );
        }

        // Faking "position: fixed" with Javascript. position:fixed didn't work as intended in Chrome on Android, hence
        // the hack.
        function fixPosition ( $elem, cssOffset ) {
            var visualTop = window.visualViewport ? window.visualViewport.pageTop : Math.max( dde.scrollTop, body.scrollTop ),
                visualLeft = window.visualViewport ? window.visualViewport.pageLeft : Math.max( dde.scrollLeft, body.scrollLeft );

            $elem.css( {
                top: visualTop + cssOffset.top,
                left: visualLeft + cssOffset.left
            } );
        }

        function showLog () {
            setTimeout( function () {
                $logPane.show();
                update();
            }, 2000 );
        }

        function round ( num, decimals ) {
            var multiplier = Math.pow( 10, decimals || 0 );
            return Math.round( num * multiplier ) / multiplier;
        }

    } );
} );
