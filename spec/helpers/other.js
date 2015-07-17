/**
 * Deletes all methods, except one, which have been added by the plugin to jQuery and jQuery.fn. Returns an object
 * containing the deleted methods, for restoration with restorePluginApi().
 *
 * +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 *
 * ATTN!
 * The plugin API is hard-coded in this method! When the API changes or is added to, the hard-coded list must be changed
 * accordingly!
 *
 * +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 *
 * @param {string}  exceptionName           name of the method which should not be removed
 * @param {boolean} [isJQueryGlobal=false]  whether or not the exception is attached to $ directly, rather than $.fn
 * @returns {{global: {}, fn: {}}}          the removed methods, stored in the .global and .fn properties
 */
function deletePluginApiExcept ( exceptionName, isJQueryGlobal ) {
    var globalApi = [ "documentWidth", "documentHeight", "scrollbarWidth" ],
        fnApi = [],
        removed = { global: {}, fn:{} };

    $.each( globalApi, function ( index, name ) {
        if ( ! isJQueryGlobal || exceptionName !== name ) {
            removed.global[ name ] = $[ name ];
            delete $[ name ];
        }
    } );

    $.each( fnApi, function ( index, name ) {
        if ( isJQueryGlobal || exceptionName !== name ) {
            removed.fn[name] = $.fn[name];
            delete $.fn[name];
        }
    } );

    return removed;
}

/**
 * Deletes all methods which have been added by the plugin to jQuery and jQuery.fn. Returns an object containing the
 * deleted methods, for restoration with restorePluginApi().
 *
 * @returns {{global: {}, fn: {}}}          the removed methods, stored in the .global and .fn properties
 */
function deletePluginApi () {
    return deletePluginApiExcept( "" );
}

function restorePluginApi ( removed ) {

    $.each( removed.global, function ( name, func ) {
        $[ name ] = func;
    } );

    $.each( removed.fn, function ( name, func ) {
        $.fn[ name ] = func;
    } );

}


