/*global describe, it */
(function () {
    "use strict";

    describe( 'Basic usage', function () {

        beforeEach( function () {
            // ...
        } );

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

                var $iframe, iframeDocument;

                beforeAll( function () {
                    $iframe = $( createIframe() )
                        .absPositionAt( 500, 500 )  // forces a parent document size of > 500 in each dimension
                        .contentOnly()
                        .contentBox( 250, 250 );

                    iframeDocument = $iframe[0].contentDocument;
                } );

                afterAll( function () {
                    $iframe.remove();
                } );

                it( '$.documentWidth() returns the result for that document', function () {
                    expect( $.documentWidth( iframeDocument ) ).toEqual( 250 );
                } );

                it( '$.documentHeight() returns the result for that document', function () {
                    expect( $.documentHeight( iframeDocument ) ).toEqual( 250 );
                } );

            } );

        } );

    } );

})();