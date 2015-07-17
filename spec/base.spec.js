/*global describe, it */
(function () {
    "use strict";

    describe( 'Basic usage', function () {

        describe( 'Document argument', function () {

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

        } );

    } );

})();