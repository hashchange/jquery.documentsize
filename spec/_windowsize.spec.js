/*global describe, it */
(function () {
    "use strict";

    // The file name got its leading underscore because the tests here **must run first**.
    //
    // - During the tests, the browser will snap out of minimal UI (if it has been in minimal UI in the first place),
    //   and it won't be able to re-enter that state. (See below.)
    // - Also, the user must be able to intervene, making the browser enter minimal UI on mobile, without having to wait
    //   for ages.

    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    //
    //    ATTN Test order matters!
    //
    //    Some of the tests here force the browser to exit minimal UI. Tests relying on minimal UI can't be run after
    //    the first of these tests.
    //
    //    For minimal UI to persist, the window content (body size) must be larger than the browser window at all times.
    //    One moment below that threshold is enough to exit minimal UI for good.
    //
    //    See the warning above the first test triggering the transformation.
    //
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    describe( 'windowWidth(), windowHeight() geometry.', function () {

        var msgNoWindowInnerHeightWidth = "Skipped because the browser does not support window.innerHeight and window.innerWidth (either absent or buggy)",
            msgNotMobile = "Skipped because the browser is not running on a phone or tablet",
            msgNotWorkingInAndroid = "Skipped because Android browser quirks make this test fail even though everything is working as it should";

        var _window, _document, $html, $body;

        beforeAll( function () {

            _window = window;
            _document = document;

            $html = $( _document.documentElement );
            $body = $( _document.body );

            $body.children().hide();

            // Removing margins, padding, border on html and body; resetting overflow to "visible"
            $html.contentOnly().overflowAll( "visible" );
            $body.contentOnly().overflowAll( "visible" );

            ensureDefaultMetaViewport();
        } );

        afterAll( function () {

            // Resetting the html and body styles.
            //
            // DON'T do this after each test. At least the body size setting must persist, keeping the body larger than
            // the window. This prevents the browser from exiting minimal UI.
            //
            // Clean up the other styles individually after each test, as needed.
            $html[0].style.cssText = "";
            $body[0].style.cssText = "";

            $body.children().show();
            showJasmineOutput();

            ensureDefaultMetaViewport();
        } );

        beforeEach( function () {
            // Make sure the body is larger than the window, allowing minimal UI to persist. Override in individual
            // tests as needed. (But remember that minimal UI can't be turned on again after that.)
            $body.height( 10000 );

            // Needed before every test if Jasmine output is required to be truly hidden. See hideJasmineOutput().
            hideJasmineOutput();

            _window.scrollTo( 0, 0 );
        } );

        describeIf( isMobile(), msgNotMobile, 'Mode choice: Switching to minimal UI on mobile (not a test).', function () {

            // Mobile browsers: testing with minimal UI (hidden URL bar, hidden tabs)
            //
            // We delay the execution of all following tests, in order to allow the user to scroll upwards and enter
            // minimal UI.
            //
            // As of iOS 8, there is no way to enter minimal UI in mobile Safari programmatically. The user has to
            // intervene and scroll upwards to make the URL bar and tabs disappear. Hacks like scrolling down 1px,
            // wrapped into setTimeout, no longer work.
            //
            // See http://stackoverflow.com/a/18917939/508355

            var _hasRun = false;

            // beforeAll can't be made async, so we have to fake it with a pseudo forEach.
            beforeEach( function ( done ) {

                var $mobileHint,
                    mobileHint = "Swipe upwards if you want to test in minimal UI";

                if ( !_hasRun ) {
                    $mobileHint = $( "<h1/>" ).text( mobileHint ).css( { padding: "10px", textAlign: "center" } ).prependTo( $body );
                    _hasRun = true;

                    setTimeout( function () {
                        $mobileHint.remove();
                        done();
                    }, 4000 );
                } else {
                    done();
                }

            } );

            it( 'Dummy test to enable the UI mode choice (always true)', function () {
                expect( true ).toEqual( true );
            } );

        } );

        describe_noPhantom( 'The window is known to have scroll bars.', function () {

            beforeEach( function () {

                // Setting the body to a huge size, so that scroll bars are guaranteed.
                $body.contentBox( 10000, 10000 );

            } );

            describeIf( supportsWindowInnerHeight(), msgNoWindowInnerHeightWidth, 'Window size is validated against window.innerHeight, window.innerWidth.', function () {

                // NB window.innerHeight, window.innerWidth return the dimensions of the browser window including scroll
                // bars. We must compensate for that.

                beforeAll( function () {
                    // Must not be confused by borders, margins, padding on both html and body, so let's set them.
                    $html
                        .margin( 64 )
                        .border( 32 )
                        .padding( 16 );
                    $body
                        .margin( 8 )
                        .border( 4 )
                        .padding( 2 );

                } );

                describe( '$.windowHeight() matches window.innerHeight, compensated for scroll bar size,', function () {

                    it( 'before the window content has been scrolled down', function () {
                        expect( $.windowHeight( _window ) ).toEqual( _window.innerHeight - $.scrollbarWidth() );
                    } );

                    it( 'after the window content has been scrolled down', function () {
                        _window.scrollTo( 0, 1000 );
                        expect( $.windowHeight( _window ) ).toEqual( _window.innerHeight - $.scrollbarWidth() );
                    } );

                } );

                describe( '$.windowWidth() matches window.innerWidth, compensated for scroll bar size,', function () {

                    it( 'before the window content has been scrolled down', function () {
                        expect( $.windowWidth( _window ) ).toEqual( _window.innerWidth - $.scrollbarWidth() );
                    } );

                    it( 'after the window content has been scrolled down', function () {
                        _window.scrollTo( 0, 500 );
                        expect( $.windowWidth( _window ) ).toEqual( _window.innerWidth - $.scrollbarWidth() );
                    } );

                } );

            } );

            describeUnless( isAndroid(), msgNotWorkingInAndroid, 'Window size is validated against a known window size, derived from a known document size.', function () {

                // We can establish the window size by making the bottom right corner of the document line up with the
                // bottom right corner of the window. Here is how it works:
                //
                // - We make sure the document is at least as large as the window, and never smaller. So we assign a
                //   large fixed size to the body. No distorting margins, padding, border on `body` and `html`, please!
                // - We scroll the window to the max, in both dimensions. As a result, the bottom right corner of the
                //   body is aligned with the bottom right border of the window.
                // - We measure bottom right edge position of the body, relative to (0,0) of the window (visual
                //   viewport). We get it with getBoundingClientRect.bottom and .right.
                //
                // That position gives us the real size of the visual viewport. Or rather, it would.
                //
                // - When zooming in, the window might show less than a full CSS pixel along each edge. So the real
                //   result would have to be a float, but both window.innerWidth/.innerHeight and gBCR round it to an
                //   integer.
                // - In iOS, the gBCR.bottom value suffers from rounding *errors*, depending on the zoom level.
                //   Sometimes, the value reported is 1px too small (even at 1:1 zoom), but it can also be 1px too
                //   large, or be accurate. My experiments have shown that window.innerHeight gets it right (apart from
                //   the lack of floating-point precision), while gBCR doesn't.
                // - For that reason, we have to allow a discrepancy of +/- 1px during the test.
                //
                // We test the window size after scrolling by making sure the body is larger than the window. And we
                // test the window size without scrolling by making the body smaller than the window, and positioning
                // the body in the lower right corner. (Happens further below, in "window without scroll bars" spec.)

                // NB Android:
                // -----------
                //
                // These tests don't work in Android because getBoundingClientRect() behaves differently there.
                //
                // In iOs, the values returned by gBCR are relative to the visual viewport, ie the real size of the
                // window, expressed in CSS pixels. In Android, however, they are relative to the layout viewport and
                // therefore don't reflect zoom state or the real, visible window size.
                //
                // To see it in action, play with http://jsbin.com/xaqaya/3

                describe( 'The window has been scrolled.', function () {

                    beforeEach( function ( done ) {
                        $html.contentOnly();
                        $body.contentOnly();

                        // Setting the body to a huge size, so that scroll bars are guaranteed.
                        $body.contentBox( 10000, 10000 );

                        // Scrolling all the way out to the scrolling maximum, and then some.
                        //
                        // In iOS, because of rubber-band scrolling, that extreme point is actually reached initially.
                        // We need to allow some time for the content to bounce back and reach its final position.
                        _window.scrollTo( 15000, 15000 );
                        setTimeout( done, 500 );
                    } );

                    it( '$.windowWidth() matches the measured window width', function () {
                        // NB This test would fail in iOS without hideJasmineOutput() in a beforeEach call.
                        var expected =_document.body.getBoundingClientRect().right;
                        expect( $.windowWidth( _window ) ).toBeWithinRange( expected - 1, expected + 1 );
                    } );

                    it( '$.windowHeight() matches the measured window height', function () {
                        var expected =_document.body.getBoundingClientRect().bottom;
                        expect( $.windowHeight( _window ) ).toBeWithinRange( expected - 1, expected + 1 );
                    } );

                } );

            } );

            describe( 'Window size with option viewport: "visual" is the same as window size without a viewport argument', function () {

                beforeAll( function () {
                    // Must not be confused by borders, margins, padding on both html and body, so let's set them.
                    $html
                        .margin( 64 )
                        .border( 32 )
                        .padding( 16 );
                    $body
                        .margin( 8 )
                        .border( 4 )
                        .padding( 2 );

                } );

                describe( '$.windowHeight( { viewport: "visual" } ) equals $.windowHeight(),', function () {

                    it( 'before the window content has been scrolled down', function () {
                        expect( $.windowHeight( { viewport: "visual" }, _window ) ).toEqual( $.windowHeight( _window ) );
                    } );

                    it( 'after the window content has been scrolled down', function () {
                        _window.scrollTo( 0, 1000 );
                        expect( $.windowHeight( { viewport: "visual" }, _window ) ).toEqual( $.windowHeight( _window ) );
                    } );

                } );

                describe( '$.windowWidth( { viewport: "visual" } ) equals $.windowWidth(),', function () {

                    it( 'before the window content has been scrolled down', function () {
                        expect( $.windowWidth( { viewport: "visual" }, _window ) ).toEqual( $.windowWidth( _window ) );
                    } );

                    it( 'after the window content has been scrolled down', function () {
                        _window.scrollTo( 0, 500 );
                        expect( $.windowWidth( { viewport: "visual" }, _window ) ).toEqual( $.windowWidth( _window ) );
                    } );

                } );

            } );

            describe( 'At 1:1 zoom, window size with option viewport: "layout" is the same as window size without a viewport argument', function () {

                beforeAll( function () {
                    // Must not be confused by borders, margins, padding on both html and body, so let's set them.
                    $html
                        .margin( 64 )
                        .border( 32 )
                        .padding( 16 );
                    $body
                        .margin( 8 )
                        .border( 4 )
                        .padding( 2 );

                } );

                beforeEach( function () {
                    setMetaViewportZoom( 1 );
                } );

                afterAll( function () {
                    restoreMetaViewport();
                } );

                describe( '$.windowHeight( { viewport: "layout" } ) equals $.windowHeight(),', function () {

                    it( 'before the window content has been scrolled down', function () {
                        expect( $.windowHeight( { viewport: "layout" }, _window ) ).toEqual( $.windowHeight( _window ) );
                    } );

                    it( 'after the window content has been scrolled down', function () {
                        _window.scrollTo( 0, 1000 );
                        expect( $.windowHeight( { viewport: "layout" }, _window ) ).toEqual( $.windowHeight( _window ) );
                    } );

                } );

                describe( '$.windowWidth( { viewport: "layout" } ) equals $.windowWidth(),', function () {

                    it( 'before the window content has been scrolled down', function () {
                        expect( $.windowWidth( { viewport: "layout" }, _window ) ).toEqual( $.windowWidth( _window ) );
                    } );

                    it( 'after the window content has been scrolled down', function () {
                        _window.scrollTo( 0, 500 );
                        expect( $.windowWidth( { viewport: "layout" }, _window ) ).toEqual( $.windowWidth( _window ) );
                    } );

                } );

            } );


            describeIf( isMobile(), msgNotMobile, 'Page is zoomed in (pinch zoom).', function () {

                // As a result of zooming in, the window has scroll bars, too.

                // Zooming out is tested further below, in the "window without scroll bars" spec.

                beforeEach( function () {
                    // Make sure we definitely get scroll bars, just in case
                    $body.contentBox( 10000, 10000 );

                    // Zoom in to 300%
                    setMetaViewportZoom( 3 );
                } );

                afterAll( function () {
                    // Reset zoom, restore original meta viewport tag
                    restoreMetaViewport();
                } );

                describe( '$.windowHeight() matches window.innerHeight, compensated for scroll bar size,', function () {

                    it( 'before the window content has been scrolled down', function () {
                        expect( $.windowHeight( _window ) ).toEqual( _window.innerHeight - $.scrollbarWidth() );
                    } );

                    it( 'after the window content has been scrolled down', function () {
                        _window.scrollTo( 0, 1000 );
                        expect( $.windowHeight( _window ) ).toEqual( _window.innerHeight - $.scrollbarWidth() );
                    } );

                } );

                describe( '$.windowWidth() matches window.innerWidth, compensated for scroll bar size,', function () {

                    it( 'before the window content has been scrolled down', function () {
                        expect( $.windowWidth( _window ) ).toEqual( _window.innerWidth - $.scrollbarWidth() );
                    } );

                    it( 'after the window content has been scrolled down', function () {
                        _window.scrollTo( 0, 500 );
                        expect( $.windowWidth( _window ) ).toEqual( _window.innerWidth - $.scrollbarWidth() );
                    } );

                } );

                describe( '$.windowHeight( { viewport: "visual" } ) equals $.windowHeight(),', function () {

                    it( 'before the window content has been scrolled down', function () {
                        expect( $.windowHeight( { viewport: "visual" }, _window ) ).toEqual( $.windowHeight( _window ) );
                    } );

                    it( 'after the window content has been scrolled down', function () {
                        _window.scrollTo( 0, 1000 );
                        expect( $.windowHeight( { viewport: "visual" }, _window ) ).toEqual( $.windowHeight( _window ) );
                    } );

                } );

                describe( '$.windowWidth( { viewport: "visual" } ) equals $.windowWidth(),', function () {

                    it( 'before the window content has been scrolled down', function () {
                        expect( $.windowWidth( { viewport: "visual" }, _window ) ).toEqual( $.windowWidth( _window ) );
                    } );

                    it( 'after the window content has been scrolled down', function () {
                        _window.scrollTo( 0, 500 );
                        expect( $.windowWidth( { viewport: "visual" }, _window ) ).toEqual( $.windowWidth( _window ) );
                    } );

                } );

                describe( '$.windowHeight( { viewport: "layout" } ) equals the layout viewport height, derived from document.documentElement.clientHeight and adjusted for minimal UI if applicable,', function () {

                    // For the expected height, we can't just read the value of ddE.clientHeight and be done with it. In
                    // iOS, that value misses the enlargement of the browser window when we are in minimal UI.
                    //
                    // Instead, we have to calculate the expected height, based on the expected width and the aspect
                    // ratio of the window.
                    //
                    // NB Suppressing rounding errors:
                    //
                    // If the calculated height is really close to the clientHeight, the difference can only have been
                    // caused by rounding errors in the calculation, so we take the browser-provided value instead.

                    it( 'before the window content has been scrolled down', function () {
                        var aspectRatio = $.windowHeight( _window ) / $.windowWidth( _window ),
                            calculatedHeight = _document.documentElement.clientWidth * aspectRatio,
                            clientHeight = _document.documentElement.clientHeight,

                            expected = ( clientHeight > calculatedHeight - 4 && clientHeight < calculatedHeight + 4 ) ? clientHeight : calculatedHeight;

                        // Allow for rounding errors in the value returned by $.windowHeight() (tolerance +/-1px).
                        expect( $.windowHeight( { viewport: "layout" }, _window ) ).toBeWithinRange( expected - 1, expected + 1 );
                    } );

                    it( 'after the window content has been scrolled down', function () {
                        var aspectRatio = $.windowHeight( _window ) / $.windowWidth( _window ),
                            calculatedHeight = _document.documentElement.clientWidth * aspectRatio,
                            clientHeight = _document.documentElement.clientHeight,

                            expected = ( clientHeight > calculatedHeight - 4 && clientHeight < calculatedHeight + 4 ) ? clientHeight : calculatedHeight;

                        _window.scrollTo( 0, 1000 );

                        // Allow for rounding errors in the value returned by $.windowHeight() (tolerance +/-1px).
                        expect( $.windowHeight( { viewport: "layout" }, _window ) ).toBeWithinRange( expected - 1, expected + 1 );
                    } );

                } );

                describe( '$.windowWidth( { viewport: "layout" } ) equals the layout viewport width, document.documentElement.clientWidth,', function () {

                    it( 'before the window content has been scrolled down', function () {
                        var expected = _document.documentElement.clientWidth;
                        expect( $.windowWidth( { viewport: "layout" }, _window ) ).toEqual( expected );
                    } );

                    it( 'after the window content has been scrolled down', function () {
                        _window.scrollTo( 0, 500 );

                        var expected = _document.documentElement.clientWidth;
                        expect( $.windowWidth( { viewport: "layout" }, _window ) ).toEqual( expected );
                    } );

                } );

            } );

        } );

        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        //
        //    ATTN The following test makes the browser exit minimal UI in iOS!
        //
        //    As soon as the body is smaller than the window, or exactly as large, the browser snaps out of the
        //    minimal UI and displays the URL bar etc. There is NO WAY to re-enter minimal UI programmatically.
        //    See http://output.jsbin.com/yunisu/4
        //
        //    NO TESTS EXPECTING MINIMAL UI BEYOND THIS POINT!
        //
        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

        describe( 'The window is known to be without scroll bars.', function () {

            describeIf( supportsWindowInnerHeight(), msgNoWindowInnerHeightWidth, 'Window size is validated against window.innerHeight, window.innerWidth.', function () {

                beforeEach( function () {
                    // Must not be confused by borders, margins, padding on both html and body, so let's set them.
                    $html
                        .margin( 1 )
                        .border( 1 )
                        .padding( 1 );
                    $body
                        .margin( 1 )
                        .border( 1 )
                        .padding( 1 );

                    // Setting the body to a very small size, so that scroll bars are guaranteed to be absent.
                    $body.contentBox( 100, 100 );
                } );

                it( '$.windowHeight() equals window.innerHeight', function () {
                    expect( $.windowHeight( _window ) ).toEqual( _window.innerHeight );
                } );

                it( '$.windowWidth() equals window.innerWidth', function () {
                    expect( $.windowWidth( _window ) ).toEqual( _window.innerWidth );
                } );

            } );

            describeUnless( isAndroid(), msgNotWorkingInAndroid, 'Window size is validated against a known window size, derived from a known document size.', function () {

                // See notes for the corresponding test with scroll bars.

                beforeEach( function ( done ) {
                    $html.contentOnly();
                    $body.contentOnly();

                    $body
                        .contentBox( 100, 100 )
                        .css( { position: "absolute", bottom: 0, right: 0 } );

                    // We need to give the browser some time to exit minimal UI in iOS. Without a timeout, the test
                    // would fail.
                    setTimeout( done, 100 );
                } );

                it( '$.windowWidth() matches the measured window width', function () {
                    var expected =_document.body.getBoundingClientRect().right;
                    expect( $.windowWidth( _window ) ).toBeWithinRange( expected - 1, expected + 1 );
                } );

                it( '$.windowHeight() matches the measured window height', function () {
                    var expected =_document.body.getBoundingClientRect().bottom;
                    expect( $.windowHeight( _window ) ).toBeWithinRange( expected - 1, expected + 1 );
                } );

            } );

            describe( 'Window size with option viewport: "visual" is the same as window size without a viewport argument', function () {

                beforeEach( function () {
                    // Must not be confused by borders, margins, padding on both html and body, so let's set them.
                    $html
                        .margin( 1 )
                        .border( 1 )
                        .padding( 1 );
                    $body
                        .margin( 1 )
                        .border( 1 )
                        .padding( 1 );

                    // Setting the body to a very small size, so that scroll bars are guaranteed to be absent.
                    $body.contentBox( 100, 100 );
                } );

                it( '$.windowHeight( { viewport: "visual" } ) equals $.windowHeight()', function () {
                    expect( $.windowHeight( { viewport: "visual" }, _window ) ).toEqual( $.windowHeight( _window ) );
                } );

                it( '$.windowWidth( { viewport: "visual" } ) equals $.windowWidth()', function () {
                    expect( $.windowWidth( { viewport: "visual" }, _window ) ).toEqual( $.windowWidth( _window ) );
                } );

            } );

            describe( 'At 1:1 zoom, window size with option viewport: "layout" is the same as window size without a viewport argument', function () {

                beforeEach( function () {
                    // Must not be confused by borders, margins, padding on both html and body, so let's set them.
                    $html
                        .margin( 1 )
                        .border( 1 )
                        .padding( 1 );
                    $body
                        .margin( 1 )
                        .border( 1 )
                        .padding( 1 );

                    // Setting the body to a very small size, so that scroll bars are guaranteed to be absent.
                    $body.contentBox( 100, 100 );

                    setMetaViewportZoom( 1 );
                } );

                afterAll( function () {
                    restoreMetaViewport();
                } );

                it( '$.windowHeight( { viewport: "layout" } ) equals $.windowHeight()', function () {
                    expect( $.windowHeight( { viewport: "layout" }, _window ) ).toEqual( $.windowHeight( _window ) );
                } );

                it( '$.windowWidth( { viewport: "layout" } ) equals $.windowWidth()', function () {
                    expect( $.windowWidth( { viewport: "layout" }, _window ) ).toEqual( $.windowWidth( _window ) );
                } );

            } );

            describeIf( isMobile(), msgNotMobile, 'Page is zoomed out to the maximum (pinch zoom).', function () {

                // As a result, the page doesn't have scroll bars.

                // Zooming in is tested further above, in the "window with scroll bars" spec.

                beforeEach( function () {
                    // Must not be confused by borders, margins, padding on both html and body, so let's set them.
                    $html
                        .margin( 1 )
                        .border( 1 )
                        .padding( 1 );
                    $body
                        .margin( 1 )
                        .border( 1 )
                        .padding( 1 );

                    // Setting the body to a very small size, so that scroll bars are guaranteed to be absent.
                    $body.contentBox( 100, 100 );

                    // Zoom out to 50%
                    setMetaViewportZoom( 0.5 );
                } );

                afterAll( function () {
                    // Reset zoom, restore original meta viewport tag
                    restoreMetaViewport();
                } );

                it( '$.windowHeight() equals window.innerHeight', function () {
                    expect( $.windowHeight( _window ) ).toEqual( _window.innerHeight );
                } );

                it( '$.windowWidth() equals window.innerWidth', function () {
                    expect( $.windowWidth( _window ) ).toEqual( _window.innerWidth );
                } );

                it( '$.windowHeight( { viewport: "visual" } ) equals $.windowHeight()', function () {
                    expect( $.windowHeight( { viewport: "visual" }, _window ) ).toEqual( $.windowHeight( _window ) );
                } );

                it( '$.windowWidth( { viewport: "visual" } ) equals $.windowWidth()', function () {
                    expect( $.windowWidth( { viewport: "visual" }, _window ) ).toEqual( $.windowWidth( _window ) );
                } );

                it( '$.windowHeight( { viewport: "layout" } ) equals the layout viewport height, document.documentElement.clientHeight', function () {
                    // We don't have to contend with minimal UI here because we have already snapped out of it.
                    var expected = _document.documentElement.clientHeight;
                    expect( $.windowHeight( { viewport: "layout" }, _window ) ).toEqual( expected );
                } );

                it( '$.windowWidth( { viewport: "layout" } ) equals the layout viewport width, document.documentElement.clientWidth', function () {
                    var expected = _document.documentElement.clientWidth;
                    expect( $.windowWidth( { viewport: "layout" }, _window ) ).toEqual( expected );
                } );

            } );

        } );

    } );

})();