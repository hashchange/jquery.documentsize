/*global describe, it */
(function () {
    "use strict";

    describeUnless(
        isIE( { lt: 11 } ),
        "Skipping comprehensive geometry tests in IE < 11. Older IE versions lack the capabilities to run them.",
        'Comprehensive geometry tests', function () {

        var htmlOverflowScenarios = {
                'documentElement styled with overflow: "visible"': function ( $html ) { $html.overflow( "visible" ); },
                'documentElement styled with overflow: "auto"': function ( $html ) { $html.overflow( "auto" ); },
                'documentElement styled with overflow: "scroll"': function ( $html ) { $html.overflow( "scroll" ); },
                'documentElement styled with overflow: "hidden"': function ( $html ) { $html.overflow( "hidden" ); }
            },

            bodyOverflowScenarios = {
                'body styled with overflow: "visible"': function ( $body ) { $body.overflow( "visible" ); },
                'body styled with overflow: "auto"': function ( $body ) { $body.overflow( "auto" ); },
                'body styled with overflow: "scroll"': function ( $body ) { $body.overflow( "scroll" ); },
                'body styled with overflow: "hidden"': function ( $body ) { $body.overflow( "hidden" ); }
            },

            htmlScenarios = {
                "documentElement without explicit size": function ( $html ) { $html.noSize().inFlow(); },
                "documentElement with explicit size, smaller than viewport": function ( $html ) { $html.box( 300, 300 ).inFlow(); },
                "documentElement with explicit size, extends beyond viewport": function ( $html ) { $html.box( 2500, 2500 ).inFlow(); },
                "documentElement relatively positioned, without explicit size": function ( $html ) { $html.noSize().relPositionAt( 5, 5 ); },
                "documentElement relatively positioned, with explicit size, smaller than viewport": function ( $html ) { $html.box( 300, 300 ).relPositionAt( 5, 5 ); },
                "documentElement relatively positioned, with explicit size, extends beyond viewport": function ( $html ) { $html.box( 2500, 2500 ).relPositionAt( 5, 5 ); },
                "documentElement absolutely positioned, without explicit size": function ( $html ) { $html.noSize().absPositionAt( 5, 5 ); },
                "documentElement absolutely positioned, with explicit size, smaller than viewport": function ( $html ) { $html.box( 300, 300 ).absPositionAt( 5, 5 ); },
                "documentElement absolutely positioned, with explicit size, extends beyond viewport": function ( $html ) { $html.box( 2500, 2500 ).absPositionAt( 5, 5 ); }
            },

            bodyScenarios = {
                "body without explicit size": function ( $body ) { $body.noSize().inFlow(); },
                "body with explicit size, smaller than viewport": function ( $body ) { $body.box( 300, 300 ).inFlow(); },
                "body with explicit size, extends beyond viewport": function ( $body ) { $body.box( 2500, 2500 ).inFlow(); },
                "body relatively positioned, without explicit size": function ( $body ) { $body.noSize().relPositionAt( 10, 10 ); },
                "body relatively positioned, with explicit size, smaller than viewport": function ( $body ) { $body.box( 300, 300 ).relPositionAt( 10, 10 ); },
                "body relatively positioned, with explicit size, extends beyond viewport": function ( $body ) { $body.box( 2500, 2500 ).relPositionAt( 10, 10 ); },
                "body absolutely positioned, without explicit size": function ( $body ) { $body.noSize().absPositionAt( 10, 10 ); },
                "body absolutely positioned, with explicit size, smaller than viewport": function ( $body ) { $body.box( 300, 300 ).absPositionAt( 10, 10 ); },
                "body absolutely positioned, with explicit size, extends beyond viewport": function ( $body ) { $body.box( 2500, 2500 ).absPositionAt( 10, 10 ); }
            },

            contentScenarios = {
                "Overflowing content": function ( $content ) { $content.box( 3000, 3000 ).inFlow(); },
                "Content inside body": function ( $content ) { $content.box( 100, 100 ).inFlow(); },
                "Positioned content, placed inside body": function ( $content ) { $content.box( 100, 100 ).absPositionAt( 100, 100 ); },
                "Positioned content, placed off screen to top left": function ( $content ) { $content.box( 100, 100 ).absPositionAt( -100, -100 ); },
                "Positioned content, placed off screen to bottom right": function ( $content ) { $content.box( 100, 100 ).absPositionAt( 3000, 3000 ); }
            };

        withData( htmlOverflowScenarios, function ( htmlOverflowSetup ) {

            withData( bodyOverflowScenarios, function ( bodyOverflowSetup ) {

                withData( htmlScenarios, function ( htmlSetup ) {

                    withData( bodyScenarios, function ( bodySetup ) {

                        withData( contentScenarios, function ( contentSetup ) {

                            var _document, $html, $body, $content,
                                measuredDocumentSize;

                            beforeAll( function () {

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

                                // Setting up the scenario
                                htmlOverflowSetup( $html );
                                bodyOverflowSetup( $body );
                                htmlSetup( $html );
                                bodySetup( $body );
                                contentSetup( $content );

                                measuredDocumentSize = measureDocumentScrollSize( $html, $body, $content );

                            } );

                            afterAll( function () {

                                $html[0].style.cssText = "";
                                $body[0].style.cssText = "";

                                $content.remove();
                                $body.children().show();

                            } );

                            it( '$.documentWidth() matches the expected document width', function () {
                                expect( $.documentWidth( _document ) ).toEqual( measuredDocumentSize.width );
                            } );

                            it( '$.documentHeight() matches the expected document height', function () {
                                expect( $.documentHeight( _document ) ).toEqual( measuredDocumentSize.height );
                            } );

                        } );

                    } );

                } );

            } );

        } );

    } );

})();