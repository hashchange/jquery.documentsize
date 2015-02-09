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

                it( '$.documentWidth() returns the result for that document', function () {

                } );

                it( '$.documentHeight() returns the result for that document', function () {

                } );

            } );

        } );

    } );

})();