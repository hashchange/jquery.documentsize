/*!
 * Custom JavsScript functions
 */

/**
 * Delays when a function runs through debouncing.
 *
 * @return callback
 */
var delay = (function(){
    var timer = 0;
    return function(callback, ms){
        clearTimeout(timer);
        timer = setTimeout(callback, ms);
    };
})();

/**
 * sprintf for JavaScript
 *
 * @return string
 */
if(!String.prototype.format){
    String.prototype.format = function(){
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number){
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    };
}

/**
 * Escapes a String ready for use
 * with a Regular Expression
 *
 * @param  string
 * @return string
 */
function escapeRegexExpression(string){
    return string.replace(/[-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

/**
 * Converts HTML markup to its
 * equivalent representation
 *
 * @param  string
 * @return string
 */
function htmlAsEntities(html){
    html = html.replace(/&/g, '&amp;');
    html = html.replace(/>/g, '&gt;');
    html = html.replace(/</g, '&lt;');
    html = html.replace(/"/g, '&quot;');
    html = html.replace(/'/g, '&#039;');
    return html;
}

/**
 * Checks if the input
 * is a valid number.
 *
 * @param  Mixed
 * @return Boolean
 */
function isNumeric(n){
    return !isNaN(parseFloat(n)) && isFinite(n);
}

/**
 * Map for Objects
 *
 * @param  Object
 * @return Object
 */
function map(obj, callback){
    var result = {};
    Object.keys(obj).forEach(function(key){
        result[key] = callback.call(obj, obj[key], key, obj);
    });
    return result;
}

/**
 * Use the browser's built-in functionality
 * to quickly and safely escape a string
 *
 * @param  string|Array|Object
 * @return string|Array|Object
 */
function sanitizeHtml(html){
    var separator = '/';

    if(html.constructor === Object){
        return map(html, function(value){
            var sanitizedHtml = value.split(separator)
                .map(sanitizeHtml)
                .join(separator);
            return sanitizedHtml;
        });
    } else if(html.constructor === Array){
        return html.map(sanitizeHtml);
    }

    var div = document.createElement('div');
    div.appendChild(document.createTextNode(html));
    var sanitizedHtml = div.innerHTML.replace(/&amp;/g, '&');

    if(html != sanitizedHtml){
        return ''; // Blank it
    }

    return sanitizedHtml;
}

/**
 * Remove empty values in an Array
 *
 * @param  Array
 * @return Array
 */
function removeBlankValues(array){
    return $.grep(array, function(n){ return(n) });
}

/**
 * Check if Object property
 * or Array key is set
 *
 * @param  Object
 * @return Boolean
 */
function isset(){
    var a = arguments,
        l = a.length,
        i = 0,
        undef;

    if(l === 0){
        throw new Error('Empty isset');
    }

    while(i !== l){
        if(a[i] === undef || a[i] === null){
            return false;
        }

        i++;
    }

    return true;
}

/**
 * Track all AJAX calls
 * in order to abort superseded open call(s)
 *
 * Extend `$.ajax({})` with `beforeSend()` and `complete()`
 *
 * Usage:
 * $.xhrPool.abortSingle('selectize');
 * $.xhrPool.abortAll();
 */
$.xhrPool = [[]];

$.xhrPool.abortSingle = function(prop){
    if(isset(this[prop]) && this[prop] instanceof Array && this[prop].length > 0){
        $thiz = $(this[prop]);

        $thiz.each(function(i, jqXHR){
            jqXHR.abort();
            $.xhrPool.splice(i, 1);
        });
    }
};

$.xhrPool.abortAll = function(){
    for(prop in this){
        if(this[prop] instanceof Array && this[prop].length > 0){
            $thiz = $(this[prop]);

            $thiz.each(function(i, jqXHR){
                jqXHR.abort();
                $.xhrPool.splice(i, 1);
            });
        }
    }
};