/**
 * Custom matchers for Jasmine. Not provided by jasmine-expect (aka jasmine-matchers), either.
 */

beforeEach( function () {

    // When beforeEach is called outside of a `describe` scope, the matchers are available globally.
    // See http://stackoverflow.com/a/11942151/508355

    jasmine.addMatchers(
        {
            toBeAtLeast: function ( util, customEqualityTesters ) {
                return {
                    compare: function ( actual, expected ) {
                        var result = {};
                        result.pass = util.equals( actual >= expected, true, customEqualityTesters );
                        if ( result.pass ) {
                            result.message = "Expected " + actual + " to be less than " + expected;
                        } else {
                            result.message = "Expected " + actual + " to be at least " + expected;
                        }
                        return result;
                    }
                }
            }
        },
        {
            toBeAtMost: function ( util, customEqualityTesters ) {
                return {
                    compare: function ( actual, expected ) {
                        var result = {};
                        result.pass = util.equals( actual <= expected, true, customEqualityTesters );
                        if ( result.pass ) {
                            result.message = "Expected " + actual + " to be greater than " + expected;
                        } else {
                            result.message = "Expected " + actual + " to be at most " + expected;
                        }
                        return result;
                    }
                }
            }
        }
    );

} );
