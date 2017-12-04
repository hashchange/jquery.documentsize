requirejs.config( {

    paths: {
        'zepto': 'https://cdnjs.cloudflare.com/ajax/libs/zepto/1.2.0/zepto',
        'underscore': 'https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore',
        'jquery.documentsize': 'https://cdn.rawgit.com/hashchange/jquery.documentsize/1.2.4/dist/amd/jquery.documentsize'
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
        },
        'underscore': {
            exports: '_'
        }
    }

} );
