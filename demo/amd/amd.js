requirejs.config( {

    baseUrl: '../../bower_components',

    paths: {
        'zepto': '../demo/bower_demo_components/zepto/zepto',
        'jquery.documentsize': '/dist/amd/jquery.documentsize'
    },

    // Faking jQuery here, using Zepto instead.
    //
    // For parallel use of Zepto in supported browsers and jQuery in legacy ones, see
    // - specifically: http://simonsmith.io/using-zepto-and-jquery-with-requirejs/#using-the-map-configuration
    // - for background: http://requirejs.org/docs/jquery.html#noconflictmap for
    map: {
        '*': { 'jquery': 'zepto' }
    },

    // Zepto does not register as an AMD module, so we need to add to add a shim.
    // See https://github.com/jrburke/r.js/issues/390#issuecomment-14276257
    shim: {
        zepto: {
            exports: '$'
        }
    }

} );

require( [

    'jquery',
    'jquery.documentsize'

], function ( $ ) {

    $( function () {

        $( ".content" )
            .append( $( '<p class="row"/>' ).text(
                "The document width is " + $.documentWidth() + "px."
            ) )
            .append( $( '<p class="row"/>' ).text(
                "The document height is " + $.documentHeight() + "px."
            ) );

    } );
} );
