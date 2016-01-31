/*!
 * bootstrap-table-en-GB.js
 */
(function($){
    'use strict';

    $.fn.bootstrapTable.locales['en-GB'] = {
        formatLoadingMessage: function(){
            return '<i class="icon fa fa-cog fa-spin mr-4 size-90-perc"></i>Loading, please wait&hellip;';
        },
        formatRecordsPerPage: function(pageSize){
            return pageSize + ' per page';
        },
        formatShowingRows: function(pageFrom, pageTo, totalRows){
            return 'Showing ' + pageFrom + ' to ' + pageTo + ' of ' + totalRows;
        },
        formatSearch: function(){
            return 'Search';
        },
        formatNoMatches: function(){
            return 'Sorry, nothing found';
        },
        formatPaginationSwitch: function(){
            return 'Hide/show pagination';
        },
        formatRefresh: function(){
            return 'Refresh';
        },
        formatToggle: function(){
            return 'Toggle';
        },
        formatColumns: function(){
            return 'Columns';
        },
        formatAllRows: function(){
            return 'All';
        }
    };

    $.extend($.fn.bootstrapTable.defaults, $.fn.bootstrapTable.locales['en-GB']);
})(jQuery);
