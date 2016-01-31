/*!
 * Selectize Plugins
 */
Selectize.define('hint_dropdown', function(options){
    var self          = this,
        KEY_ESCAPE    = 27,
        KEY_RETURN    = 13,
        KEY_BACKSPACE = 8;

    options = $.extend({
        html: function(data){
            return ('<div class="selectize-dropdown selectize-dropdown-hint hide"></div>');
        }
    }, options);

    self.showHintDropdown = function(hintMessage, closeSelectize, doAbort, makeVisible){
        var closeSelectize = (closeSelectize === undefined) ? false : closeSelectize; // By default *do not* close Selectize
        doAbort        = (doAbort        === undefined) ? true  : doAbort,        // By default *do* abort open AJAX calls
            makeVisible    = (makeVisible    === undefined) ? true  : makeVisible;    // By default *do* show the hint dropdown

        this.$empty_results_container.css('top', this.$control.outerHeight());
        this.$empty_results_container.css('width', this.$control.outerWidth());

        if(previousHintMessage == noMoreResultsText){
            if($.inArray(hintMessage, [hintTextAfterTokenAdd, searchingInProgressText, searchingStillInProgressText]) !== -1){
                hintMessage = previousHintMessage; // Prevent change
            }
        }

        if(hintMessage == searchingStillInProgressText){
            if(previousHintMessage == searchingInProgressText){
                var newHtml = simpleSpan.format('', 'ml-4', hintMessage);
                $(newHtml).appendTo(this.$empty_results_container.find('.selectize-dropdown-content'));
            }
        } else if(hintMessage != ''){
            var currentHtml = this.$empty_results_container.html(),
                newHtml = simpleDiv.format('', 'selectize-dropdown-content', hintMessage);

            if(currentHtml != $('<div>').html(newHtml).html()){
                this.$empty_results_container.html(newHtml);
            }
        }

        if(makeVisible && this.$empty_results_container.is(':hidden')){
            this.$empty_results_container.show();
        }

        if(closeSelectize === true){
            if(self.hasOptions){
                clearOptions();
            }

            self.close(); // Ensure the hint dropdown is visible
        }

        if(doAbort === true){
            $.xhrPool.abortSingle('selectize'); // Abort any open AJAX call(s)
        }

        if(hintMessage != ''){
            previousHintMessage = hintMessage;
        }
    };

    self.hideHintDropdown = function(){
        if(this.$empty_results_container.is(':visible')){
            this.$empty_results_container.hide();
        }
    };

    self.refreshOptions = (function(){
        var original = self.refreshOptions;

        return function(){
            original.apply(self, arguments);
            var current_value = $.trim(self.$control_input.val());

            if(this.hasOptions){
                if(current_value.length > 0){
                    this.hideHintDropdown();
                }
            } else if(previousQuery != current_value){
                if($.trim($('.selectize input').val()) != ''){
                    this.showHintDropdown(searchingInProgressText);
                } else if(this.items.length > 0){
                    this.showHintDropdown(hintTextAfterTokenAdd);
                } else {
                    this.showHintDropdown(hintText);
                }
            }
        }
    })();

    self.on('load', function(results){
        var current_value = $.trim(self.$control_input.val()),
            makeVisible = (this.$empty_results_container.is(':visible')) ? true : false;

        if(results == ''){
            this.showHintDropdown(noResultsText.format(studyTypes[studyType]), false, true, makeVisible);
        } else if(!self.hasOptions && current_value.length > 0){
            if(results == -1){
                this.showHintDropdown(noMoreResultsText, false, true, makeVisible);
            } else if(results !== undefined){
                this.showHintDropdown(noResultsText.format(studyTypes[studyType]), false, true, makeVisible);
            }
        }
    });

    self.onFocus = (function(){
        var original = self.onFocus;

        return function(e){
            original.apply(self, arguments);
            var current_value = $.trim(self.$control_input.val());

            if(current_value.length == 0){
                if(self.items.length > 0){
                    if(previousHintMessage != ''){
                        this.showHintDropdown(previousHintMessage);
                    } else {
                        this.showHintDropdown(hintTextAfterTokenAdd);
                    }
                } else {
                    this.showHintDropdown(hintText);
                }
            } else if(!self.hasOptions){
                this.showHintDropdown('', false, false);
            }
        }
    })();

    self.onBlur = (function(){
        var original = self.onBlur;

        return function(e){
            original.apply(self, arguments);
            self.hideHintDropdown();
        };
    })();

    self.onKeyDown = (function(){
        var original = self.onKeyDown;

        return function(e){
            original.apply(self, arguments);
            var current_value = $.trim(self.$control_input.val());

            if(current_value.length == 0 && self.items.length == 0){
                if(previousQuery != null && previousQuery.length == 0){
                    if(self.hasOptions){
                        clearOptions();
                    }

                    self.close();
                } else {
                    this.showHintDropdown(hintText, true);
                }
            }

            if(e.keyCode === KEY_RETURN){
                this.showHintDropdown(searchingStillInProgressText, false, false);
            }
        }
    })();

    self.onKeyUp = (function(){
        var original = self.onKeyUp;

        return function(e){
            original.apply(self, arguments);
            var current_value = $.trim(self.$control_input.val());

            if(e.keyCode === KEY_ESCAPE){
                this.hideHintDropdown();
            } else if(e.keyCode === KEY_BACKSPACE && $.inArray('restore_on_backspace_advanced', self.plugins.names) !== -1
                      && previousQuery != null && previousQuery.length == 0){
                if(current_value.length == 0){
                    this.hideHintDropdown();
                }
            } else if(previousHintMessage != noMoreResultsText && previousQuery != current_value){
                if(current_value.length > 0){
                    this.showHintDropdown(searchingInProgressText, true);
                } else if(self.items.length > 0){
                    this.showHintDropdown(hintTextAfterTokenAdd, true);
                } else {
                    this.showHintDropdown(hintText, true);
                }
            } else if(current_value.length == 0 && self.items.length == 0){
                this.showHintDropdown(hintText, true);
            }

            previousQuery = current_value;
        }
    })();

    self.setup = (function(){
        var original = self.setup;

        return function(){
            original.apply(self, arguments);
            self.$empty_results_container = $(options.html($.extend({ classNames: self.$input.attr('class') }, options)));
            self.$empty_results_container.insertBefore(self.$dropdown);
            self.hideHintDropdown();
        };
    })();
});

Selectize.define('wrap_scroll', function(options){
    var self     = this,
        KEY_UP   = 38,
        KEY_DOWN = 40,
        previousInputVal,
        previousActiveOption = '';

    self.on('set_active_option', function($option, isHover){
        if(isHover){
            previousActiveOption = $option.attr('data-value');
        }
    });

    self.onKeyDown = (function(){
        var original = self.onKeyDown;

        return function(e){
            original.apply(self, arguments);

            var options                  = Object.keys(this.options).length,
                current_value            = $.trim(self.$control_input.val())
            offsetFromOptGroupHeader = -28;

            if($.inArray('optgroup_columns', self.plugins.names) === -1 && this.hasOptions && options > 1){
                if(e.keyCode === KEY_UP || e.keyCode === KEY_DOWN){
                    var firstValue = $('.selectize .selectize-dropdown-content').find('div[data-value]').first().attr('data-value'),
                        lastValue  = $('.selectize .selectize-dropdown-content').find('div[data-value]').last().attr('data-value');

                    if(previousActiveOption == ''){
                        previousActiveOption = firstValue;
                    }

                    if(e.keyCode === KEY_UP && previousActiveOption == firstValue){
                        this.setActiveOption(this.getOption(lastValue));
                        previousActiveOption = lastValue;
                    } else if(e.keyCode === KEY_DOWN && previousActiveOption == lastValue){
                        // Scroll higher so option group header is in view
                        this.setActiveOption(this.getOption(firstValue), offsetFromOptGroupHeader);
                        previousActiveOption = firstValue;
                    } else if(this.$activeOption != null){
                        previousActiveOption = $(this.$activeOption[0]).attr('data-value'); // Update with current
                        var currentActiveOptionIndex = $('.selectize .selectize-dropdown-content')
                            .find('div[data-value="' + previousActiveOption + '"]')
                            .index();

                        if(e.keyCode === KEY_UP && currentActiveOptionIndex == 1){
                            // Scroll higher so option group header is in view
                            this.setActiveOption(this.getOption(previousActiveOption), offsetFromOptGroupHeader);
                        }
                    } else {
                        previousActiveOption = firstValue;
                    }
                    // Ensure input value has changed
                } else if(previousInputVal != current_value){
                    previousActiveOption = ''; // Reset
                }
            }

            previousInputVal = current_value;
        }
    })();
});

Selectize.define('restore_on_backspace_advanced', function(options){
    var self          = this,
        KEY_BACKSPACE = 8;

    options.text = options.text || function(option){
            return option[this.settings.labelField];
        };

    this.onKeyDown = (function(){
        var original = self.onKeyDown;
        return function(e){
            var index, option;
            if(e.keyCode === KEY_BACKSPACE && this.$control_input.val() === '' && !this.$activeItems.length){
                index = this.caretPos - 1;
                if(index >= 0 && index < this.items.length){
                    option = this.options[this.items[index]];
                    previousItems = $.extend({}, self.items); // Clone items before deletion for future lookup
                    if(this.deleteSelection(e)){
                        this.setTextboxValue(options.text.apply(this, [option]));
                        this.refreshOptions(true);
                    }
                    e.preventDefault();
                    return;
                }
            }
            return original.apply(this, arguments);
        };
    })();
});

Selectize.define('inputMaxlength', function(options){
    var self = this;
    this.setup = (function(){
        var original = self.setup;
        return function(){
            original.apply(this, arguments);
            this.$control_input.attr('maxlength', this.settings.inputMaxlength);
        };
    })();
});
