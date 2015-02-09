requirejs.config( {

    baseUrl: '../../bower_components',

    paths: {
        // Using a different jQuery here than elsewhere (1.x, instead of 2.x in node_modules).
        // Makes the demo work in oldIE, too.
        'jquery': '../demo/bower_demo_components/jquery/dist/jquery',
        'jquery.documentsize': '/dist/amd/jquery.documentsize'
    }
} );

require( [

    'jquery',
    'jquery.documentsize'

], function ( $ ) {


} );
