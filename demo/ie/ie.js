$( function () {

    var dh = $.documentHeight();
    var dw = $.documentWidth();
    var wh = $.windowHeight();
    var ww = $.windowWidth();

    appendInfo( "$.documentHeight()", dh );
    appendInfo( "$.documentWidth()", dw );
    appendInfo( "$.windowHeight()", wh );
    appendInfo( "$.windowWidth()", ww );

} );

function appendInfo ( label, value ) {
    $( "<p/>" ).text( label + ": " + value ).appendTo( "body" );
}