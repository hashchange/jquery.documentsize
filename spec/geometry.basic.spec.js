/*global describe, it */
(function () {
    "use strict";

    // This test suite is for aging IE browsers. They can't run the comprehensive geometry tests because the expected
    // document width and height can't be calculated reliably, or at all, for the full set of scenarios in these
    // browsers.

    describe( 'Basic geometry tests', function () {

        var _window, _document, $html, $body, $content,

            htmlMarginBorderPaddingTop, htmlPaddingBorderBottom, htmlMarginBorderPaddingLeft, htmlPaddingBorderRight,
            bodyMarginBorderPaddingTop, bodyPaddingBorderBottom, bodyMarginBorderPaddingLeft, bodyPaddingBorderRight,
            contentMarginBorderPaddingTop, contentPaddingBorderBottom, contentMarginBorderPaddingLeft, contentPaddingBorderRight,
            htmlMarginRight, htmlMarginBottom, bodyMarginRight, bodyMarginBottom, contentMarginRight, contentMarginBottom,

            bodyBorderEdgeRight, bodyBorderEdgeBottom, contentBorderEdgeRight, contentBorderEdgeBottom,
            calculatedDocumentSize;

        // Make sure we have tested the behaviour of the browser
        if ( browserBehaviour === undefined ) browserBehaviour = testBrowserBehaviour();

        beforeAll( function () {

            _window = window;
            _document = document;

            $html = $( _document.documentElement );
            $body = $( _document.body );
            $content = $( _document.createElement( "div" ) );

            $body.children().hide();
            $body.prepend( $content );

            // Setting up margins, padding, border (identical for all scenarios)
            $html
                .margin( 64 )
                .border( 32 )
                .padding( 16 );
            $body
                .margin( 8 )
                .border( 4 )
                .padding( 2 );
            $content
                .noMargin()
                .noPadding()
                .border( 1 );

            htmlMarginBorderPaddingLeft = htmlMarginBorderPaddingTop = 64 + 32 + 16;
            htmlPaddingBorderRight = htmlPaddingBorderBottom = 16 + 32;
            htmlMarginRight = htmlMarginBottom = 64;

            bodyMarginBorderPaddingLeft = bodyMarginBorderPaddingTop = 8 + 4 + 2;
            bodyPaddingBorderRight = bodyPaddingBorderBottom = 2 + 4;
            bodyMarginRight = bodyMarginBottom = 8;

            contentMarginBorderPaddingLeft = contentMarginBorderPaddingTop = 1;
            contentPaddingBorderRight = contentPaddingBorderBottom = 1;
            contentMarginRight = contentMarginBottom = 0;

            bodyBorderEdgeRight = function ( bodyWidth ) {
                return htmlMarginBorderPaddingLeft +
                       bodyMarginBorderPaddingLeft +
                       bodyWidth +
                       bodyPaddingBorderRight;
            };

            bodyBorderEdgeBottom = function ( bodyHeight ) {
                return htmlMarginBorderPaddingTop +
                       bodyMarginBorderPaddingTop +
                       bodyHeight +
                       bodyPaddingBorderBottom;
            };

            contentBorderEdgeRight = function ( contentWidth ) {
                return htmlMarginBorderPaddingLeft +
                       bodyMarginBorderPaddingLeft +
                       contentMarginBorderPaddingLeft +
                       contentWidth +
                       contentPaddingBorderRight;
            };

            contentBorderEdgeBottom = function ( contentHeight ) {
                return htmlMarginBorderPaddingTop +
                       bodyMarginBorderPaddingTop +
                       contentMarginBorderPaddingTop +
                       contentHeight +
                       contentPaddingBorderBottom;
            };

        } );

        beforeEach( function () {
            // Needed before every test if Jasmine output is required to be truly hidden. See hideJasmineOutput().
            hideJasmineOutput();
        } );

        afterAll( function () {

            $html[0].style.cssText = "";
            $body[0].style.cssText = "";

            $content.remove();
            $body.children().show();
            showJasmineOutput();

        } );

        describe_noPhantom( 'When the body content is overflowing the viewport', function () {

            // PhantomJS is excluded from these tests because it doesn't behave like a normal browser with regard to
            // viewport size. When content overflows the viewport, PhantomJS enlarges the viewport until the document
            // content fits inside again.
            //
            // For that reason, the tests below would fail in PhantomJS. The $.documentWidth() and $.documentHeight()
            // methods themselves return correct results, but the numbers they are compared to are wrong. The
            // calculation of the expected document size would have to be different for PhantomJS.
            //
            // Excluding PhantomJS from these tests does not matter because PhantomJS is tested in much more detail in
            // the comprehensive geometry tests.

            beforeAll( function () {

                var contentWidth = 3000,
                    contentHeight = 3000;

                $html
                    .overflow( "visible" )
                    .noSize();
                $body
                    .overflow( "visible" )
                    .noSize();
                $content
                    .contentBox( contentWidth, contentHeight );

                calculatedDocumentSize = {

                    width: contentBorderEdgeRight( contentWidth ),

                    height: contentBorderEdgeBottom( contentHeight ) +
                            contentMarginBottom +
                            bodyPaddingBorderBottom +
                            bodyMarginBottom +
                            htmlPaddingBorderBottom +
                            ( browserBehaviour.documentElement.static.pushingDocumentEdge.keepsBottomMargin ? htmlMarginBottom : 0 )

                }

            } );

            it( '$.documentWidth() matches the expected document width', function () {
                expect( $.documentWidth( _document ) ).toEqual( calculatedDocumentSize.width );
            } );

            it( '$.documentHeight() matches the expected document height', function () {
                expect( $.documentHeight( _document ) ).toEqual( calculatedDocumentSize.height );
            } );

        } );

        describe_noPhantom( 'When the body has a fixed size and is larger than the viewport, and its content fits inside body and viewport', function () {

            // Not run in PhantomJS. For the reasons, see above.

            beforeAll( function () {

                var contentWidth = 100,
                    contentHeight = 100,
                    bodyWidth = 3000,
                    bodyHeight = 3000;

                $html
                    .overflow( "visible" )
                    .noSize();
                $body
                    .overflow( "visible" )
                    .contentBox( bodyWidth, bodyHeight );
                $content
                    .contentBox( contentWidth, contentHeight );

                calculatedDocumentSize = {

                    width: bodyBorderEdgeRight( bodyWidth ),

                    height: bodyBorderEdgeBottom( bodyHeight ) +
                            bodyMarginBottom +
                            htmlPaddingBorderBottom +
                            ( browserBehaviour.documentElement.static.pushingDocumentEdge.keepsBottomMargin ? htmlMarginBottom : 0 )

                }

            } );

            it( '$.documentWidth() matches the expected document width', function () {
                expect( $.documentWidth( _document ) ).toEqual( calculatedDocumentSize.width );
            } );

            it( '$.documentHeight() matches the expected document height', function () {
                expect( $.documentHeight( _document ) ).toEqual( calculatedDocumentSize.height );
            } );

        } );

        describe( 'When the documentElement is set to overflow: hidden, the body has a fixed size and is smaller than the viewport, and the body content is overflowing the viewport (but hidden)', function () {

            beforeAll( function () {

                var contentWidth = 3000,
                    contentHeight = 3000,
                    bodyWidth = 100,
                    bodyHeight = 100;

                $html
                    .overflow( "hidden" )
                    .noSize();
                $body
                    .overflow( "visible" )
                    .contentBox( bodyWidth, bodyHeight );
                $content
                    .contentBox( contentWidth, contentHeight );

                calculatedDocumentSize = {

                    width: contentBorderEdgeRight( contentWidth ),

                    height: contentBorderEdgeBottom( contentHeight ) +
                            ( browserBehaviour.element.static.pushingDocumentEdge.keepsBottomMargin ? contentMarginBottom : 0 )

                }

            } );

            it( '$.documentWidth() matches the expected document width', function () {
                expect( $.documentWidth( _document ) ).toEqual( calculatedDocumentSize.width );
            } );

            it( '$.documentHeight() matches the expected document height', function () {
                expect( $.documentHeight( _document ) ).toEqual( calculatedDocumentSize.height );
            } );

        } );

        describe( 'When documentElement and body are set to overflow: hidden, the body has a fixed size and is smaller than the viewport, and the body content is overflowing the viewport (but hidden)', function () {

            beforeAll( function () {

                var contentWidth = 3000,
                    contentHeight = 3000,
                    bodyWidth = 100,
                    bodyHeight = 100;

                $html
                    .overflow( "hidden" )
                    .noSize();
                $body
                    .overflow( "hidden" )
                    .contentBox( bodyWidth, bodyHeight );
                $content
                    .contentBox( contentWidth, contentHeight );

                calculatedDocumentSize = {
                    width: $( _window ).width(),
                    height: $( _window ).height()
                }

            } );

            it( '$.documentWidth() matches the expected document width', function () {
                expect( $.documentWidth( _document ) ).toEqual( calculatedDocumentSize.width );
            } );

            it( '$.documentHeight() matches the expected document height', function () {
                expect( $.documentHeight( _document ) ).toEqual( calculatedDocumentSize.height );
            } );

        } );

    } );

})();