/*global describe, it */
(function () {
    "use strict";

    describe( 'Basic usage', function () {

        describe( '$.documentWidth(), $.documentHeight(): Document argument', function () {

            describe( 'When called without arguments', function () {

                it( '$.documentWidth() defaults to the global document', function () {
                    expect( $.documentWidth() ).toEqual( $.documentWidth( document ) );
                } );

                it( '$.documentHeight() defaults to the global document', function () {
                    expect( $.documentHeight() ).toEqual( $.documentHeight( document ) );
                } );

            } );

            describe( 'When called with a document argument', function () {

                var $iframe, iframeDocument, iframeWindow;

                beforeAll( function () {
                    $iframe = $( createIframe() )
                        .absPositionAt( 500, 500 )  // forces a parent document size of > 500 in each dimension
                        .contentOnly()
                        .contentBox( 250, 250 );

                    iframeDocument = $iframe[0].contentDocument;
                    iframeWindow = $iframe[0].contentWindow;
                } );

                afterAll( function () {
                    $iframe.remove();
                } );

                it( '$.documentWidth() returns the result for that document', function () {
                    expect( $.documentWidth( iframeDocument ) ).toEqual( $( iframeWindow ).width() );
                } );

                it( '$.documentHeight() returns the result for that document', function () {
                    expect( $.documentHeight( iframeDocument ) ).toEqual( $( iframeWindow ).height() );
                } );

            } );

        } );

        describe( '$.windowWidth(), $.windowHeight(): Window argument', function () {

            describe( 'When called without arguments', function () {

                it( '$.windowWidth() defaults to the global window', function () {
                    expect( $.windowWidth() ).toEqual( $.windowWidth( window ) );
                } );

                it( '$.windowHeight() defaults to the global window', function () {
                    expect( $.windowHeight() ).toEqual( $.windowHeight( window ) );
                } );

            } );

            describe( 'When called with a window argument', function () {

                var $iframe, iframeWindow;

                beforeAll( function () {
                    $iframe = $( createIframe() )
                        .absPositionAt( 500, 500 )  // forces a parent document size of > 500 in each dimension
                        .contentOnly()
                        .contentBox( 250, 250 );

                    iframeWindow = $iframe[0].contentWindow;
                } );

                beforeEach( function ( done ) {
                    // In iOS, the iframe window needs some time to be constructed.
                    //
                    // Curiously, the generic jQuery methods and ddE.clientWidth, ddE.clientHeight don't need time for
                    // that process and respond instantly with the correct values, while window.innerWidth, .innerHeight
                    // need a timeout before being usable. Observed in iOS only.
                    setTimeout( done, 0 );
                } );

                afterAll( function () {
                    $iframe.remove();
                } );

                // NB We can use the jQuery methods .width(), .height() for measuring the size of the iframe window
                // because in the iframe, we don't have to deal with browser UI elements.

                it( '$.windowWidth() returns the result for that window', function () {
                    expect( $.windowWidth( iframeWindow ) ).toEqual( $( iframeWindow ).width() );
                } );

                it( '$.windowHeight() returns the result for that window', function () {
                    expect( $.windowHeight( iframeWindow ) ).toEqual( $( iframeWindow ).height() );
                } );

            } );

        } );

        describe( 'The methods do not rely on the exposed plugin API. When all other public methods of the plugin are deleted from jQuery', function () {

            var deletedApi;

            afterEach( function () {
                restorePluginApi( deletedApi );
            } );

            it( '$.documentWidth() works correctly and returns the width of the document', function () {
                var expected = $.documentWidth();
                deletedApi = deletePluginApiExcept( "documentWidth", true );
                expect( $.documentWidth() ).toEqual( expected );
            } );

            it( '$.documentHeight() works correctly and returns the height of the document', function () {
                var expected = $.documentHeight();
                deletedApi = deletePluginApiExcept( "documentHeight", true );
                expect( $.documentHeight() ).toEqual( expected );
            } );

            it( '$.scrollbarWidth() works correctly and returns the global scroll bar width', function () {
                var expected = $.scrollbarWidth();
                deletedApi = deletePluginApiExcept( "scrollbarWidth", true );
                expect( $.scrollbarWidth() ).toEqual( expected );
            } );

            it( '$.windowWidth() works correctly and returns the width of the window', function () {
                var expected = $.windowWidth();
                deletedApi = deletePluginApiExcept( "windowWidth", true );
                expect( $.windowWidth() ).toEqual( expected );
            } );

            it( '$.windowHeight() works correctly and returns the height of the window', function () {
                var expected = $.windowHeight();
                deletedApi = deletePluginApiExcept( "windowHeight", true );
                expect( $.windowHeight() ).toEqual( expected );
            } );

        } );

    } );

})();