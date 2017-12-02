;( function ( root, factory ) {
    "use strict";

    if ( typeof exports === 'object' ) {

        module.exports = factory(
            require( 'jquery' )
        );

    } else if ( typeof define === 'function' && define.amd ) {

        define( [
            'jquery'
        ], factory );

    }
}( this, function ( $ ) {
    "use strict";

    // @include jquery.documentsize.js
    return $;

} ));

