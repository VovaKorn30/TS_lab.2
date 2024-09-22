(function ($) {

    /**
     * Generate an indented list of links from a nav. Meant for use with panel().
     * @return {jQuery} jQuery object.
     */
    $.fn.navList = function (): string {
        const $this = $(this);
        const $links = $this.find('a');
        const result: string[] = [];

        $links.each(function () {
            const $link = $(this);
            const indent = Math.max(0, $link.parents('li').length - 1);
            const href = $link.attr('href') || '';
            const target = $link.attr('target') || '';

            result.push(
                `<a class="link depth-${indent}"` +
                (target ? ` target="${target}"` : '') +
                (href ? ` href="${href}"` : '') +
                `><span class="indent-${indent}"></span>${$link.text()}</a>`
            );
        });

        return result.join('');
    };

    /**
     * Panel-ify an element.
     * @param {object} userConfig User config.
     * @return {jQuery} jQuery object.
     */
    $.fn.panel = function (userConfig: { 
        delay?: number; 
        hideOnClick?: boolean; 
        hideOnEscape?: boolean; 
        hideOnSwipe?: boolean; 
        resetScroll?: boolean; 
        resetForms?: boolean; 
        side?: string | null; 
        target?: JQuery; 
        visibleClass?: string; 
    }): JQuery {

        if (this.length === 0) return $(this);
        if (this.length > 1) {
            this.each(function () {
                $(this).panel(userConfig);
            });
            return $(this);
        }

        const $this = $(this);
        const $body = $('body');
        const $window = $(window);
        const id = $this.attr('id') || '';
        const config = $.extend({
            delay: 0,
            hideOnClick: false,
            hideOnEscape: false,
            hideOnSwipe: false,
            resetScroll: false,
            resetForms: false,
            side: null,
            target: $this,
            visibleClass: 'visible'
        }, userConfig);

        if (typeof config.target !== 'jQuery') {
            config.target = $(config.target);
        }

        // Panel methods
        $this._hide = function (event?: Event) {
            if (!config.target.hasClass(config.visibleClass)) return;

            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }

            config.target.removeClass(config.visibleClass);

            window.setTimeout(function () {
                if (config.resetScroll) $this.scrollTop(0);
                if (config.resetForms) $this.find('form').each(function () {
                    this.reset();
                });
            }, config.delay);
        };

        // Vendor fixes
        $this.css('-ms-overflow-style', '-ms-autohiding-scrollbar')
             .css('-webkit-overflow-scrolling', 'touch');

        // Hide on click
        if (config.hideOnClick) {
            $this.find('a').css('-webkit-tap-highlight-color', 'rgba(0,0,0,0)');
            $this.on('click', 'a', function (event) {
                const $a = $(this);
                const href = $a.attr('href');
                const target = $a.attr('target');

                if (!href || href === '#' || href === '' || href === `#${id}`) return;

                event.preventDefault();
                event.stopPropagation();
                $this._hide();

                window.setTimeout(function () {
                    if (target === '_blank') {
                        window.open(href);
                    } else {
                        window.location.href = href;
                    }
                }, config.delay + 10);
            });
        }

        // Touch events
        $this.on('touchstart', function (event) {
            $this.touchPosX = event.originalEvent.touches[0].pageX;
            $this.touchPosY = event.originalEvent.touches[0].pageY;
        });

        $this.on('touchmove', function (event) {
            if ($this.touchPosX === null || $this.touchPosY === null) return;

            const diffX = $this.touchPosX - event.originalEvent.touches[0].pageX;
            const diffY = $this.touchPosY - event.originalEvent.touches[0].pageY;
            const th = $this.outerHeight();
            const ts = ($this.get(0).scrollHeight - $this.scrollTop());

            // Hide on swipe
            if (config.hideOnSwipe) {
                let result = false;
                const boundary = 20;
                const delta = 50;

                switch (config.side) {
                    case 'left':
                        result = (diffY < boundary && diffY > (-1 * boundary)) && (diffX > delta);
                        break;
                    case 'right':
                        result = (diffY < boundary && diffY > (-1 * boundary)) && (diffX < (-1 * delta));
                        break;
                    case 'top':
                        result = (diffX < boundary && diffX > (-1 * boundary)) && (diffY > delta);
                        break;
                    case 'bottom':
                        result = (diffX < boundary && diffX > (-1 * boundary)) && (diffY < (-1 * delta));
                        break;
                    default:
                        break;
                }

                if (result) {
                    $this.touchPosX = null;
                    $this.touchPosY = null;
                    $this._hide();
                    return false;
                }
            }

            // Prevent vertical scrolling past the top or bottom
            if (($this.scrollTop() < 0 && diffY < 0) || (ts > (th - 2) && ts < (th + 2) && diffY > 0)) {
                event.preventDefault();
                event.stopPropagation();
            }
        });

        // Prevent certain events inside the panel from bubbling
        $this.on('click touchend touchstart touchmove', function (event) {
            event.stopPropagation();
        });

        // Hide panel if a child anchor tag pointing to its ID is clicked
        $this.on('click', `a[href="#${id}"]`, function (event) {
            event.preventDefault();
            event.stopPropagation();
            config.target.removeClass(config.visibleClass);
        });

        // Hide panel on body click/tap
        $body.on('click touchend', function (event) {
            $this._hide(event);
        });

        // Toggle
        $body.on('click', `a[href="#${id}"]`, function (event) {
            event.preventDefault();
            event.stopPropagation();
            config.target.toggleClass(config.visibleClass);
        });

        // Hide on ESC
        if (config.hideOnEscape) {
            $window.on('keydown', function (event) {
                if (event.keyCode === 27) $this._hide(event);
            });
        }

        return $this;
    };

    /**
     * Apply "placeholder" attribute polyfill to one or more forms.
     * @return {jQuery} jQuery object.
     */
    $.fn.placeholder = function (): JQuery {
        if (typeof (document.createElement('input')).placeholder !== 'undefined') return $(this);
        if (this.length === 0) return $(this);

        if (this.length > 1) {
            this.each(function () {
                $(this).placeholder();
            });
            return $(this);
        }

        const $this = $(this);

        // Text, TextArea
        $this.find('input[type=text],textarea').each(function () {
            const $input = $(this);
            if ($input.val() === '' || $input.val() === $input.attr('placeholder')) {
                $input.addClass('polyfill-placeholder').val($input.attr('placeholder'));
            }
        }).on('blur', function () {
            const $input = $(this);
            if ($input.attr('name')?.match(/-polyfill-field$/)) return;

            if ($input.val() === '') {
                $input.addClass('polyfill-placeholder').val($input.attr('placeholder'));
            }
        }).on('focus', function () {
            const $input = $(this);
            if ($input.attr('name')?.match(/-polyfill-field$/)) return;

            if ($input.val() === $input.attr('placeholder')) {
                $input.removeClass('polyfill-placeholder').val('');
            }
        });

        // Password
        $this.find('input[type=password]').each(function () {
            const $input = $(this);
            const $polyfill = $('<div>').append($input.clone()).remove().html().replace(/type="password"/i, 'type="text"').replace(/type=password/i, 'type=text');

            const $polyfillInput = $($polyfill);
            if ($input.attr('id')) $polyfillInput.attr('id', $input.attr('id') + '-polyfill-field');
            if ($input.attr('name')) $polyfillInput.attr('name', $input.attr('name') + '-polyfill-field');

            $polyfillInput.addClass('polyfill-placeholder').val($polyfillInput.attr('placeholder')).insertAfter($input);

            if ($input.val() === '') {
                $input.hide();
            } else {
                $polyfillInput.hide();
            }

            $input.on('blur', function (event) {
                event.preventDefault();
                const $associatedPolyfill = $input.parent().find(`input[name=${$input.attr('name')}-polyfill-field]`);
                if ($input.val() === '') {
                    $input.hide();
                    $associatedPolyfill.show();
                }
            });

            $polyfillInput.on('focus', function (event) {
                event.preventDefault();
                const $associatedInput = $polyfillInput.parent().find(`input[name=${$polyfillInput.attr('name').replace('-polyfill-field', '')}]`);
                $polyfillInput.hide();
                $associatedInput.show().focus();
            }).on('keypress', function (event) {
                event.preventDefault();
                $polyfillInput.val('');
            });
        });

        // Events
        $this.on('submit', function () {
            $this.find('input[type=text],input[type=password],textarea').each(function () {
                const $input = $(this);
                if ($input.attr('name')?.match(/-polyfill-field$/)) {
                    $input.attr('name', '');
                }
                if ($input.val() === $input.attr('placeholder')) {
                    $input.removeClass('polyfill-placeholder').val('');
                }
            });
        }).on('reset', function (event) {
            event.preventDefault();
            $this.find('select').val($('option:first').val());
            $this.find('input,textarea').each(function () {
                const $input = $(this);
                let $polyfillInput: JQuery | null;

                $input.removeClass('polyfill-placeholder');

                switch ($input[0].type) {
                    case 'submit':
                    case 'reset':
                        break;
                    case 'password':
                        $input.val($input.attr('defaultValue'));
                        $polyfillInput = $input.parent().find(`input[name=${$input.attr('name')}-polyfill-field]`);
                        if ($input.val() === '') {
                            $input.hide();
                            $polyfillInput.show();
                        } else {
                            $input.show();
                            $polyfillInput.hide();
                        }
                        break;
                    case 'checkbox':
                    case 'radio':
                        $input.prop('checked', $input.attr('defaultValue') === 'true');
                        break;
                    case 'text':
                    case 'textarea':
                        $input.val($input.attr('defaultValue'));
                        if ($input.val() === '') {
                            $input.addClass('polyfill-placeholder').val($input.attr('placeholder'));
                        }
                        break;
                    default:
                        $input.val($input.attr('defaultValue'));
                        break;
                }
            });
        });

        return $this;
    };

    /**
     * Moves elements to/from the first positions of their respective parents.
     * @param {jQuery} $elements Elements (or selector) to move.
     * @param {boolean} condition If true, moves elements to the top. Otherwise, moves elements back to their original locations.
     */
    $.prioritize = function ($elements: JQuery | string, condition: boolean): void {
        const key = '__prioritize';

        if (typeof $elements !== 'jQuery') {
            $elements = $($elements);
        }

        $elements.each(function () {
            const $element = $(this);
            const $parent = $element.parent();

            if ($parent.length === 0) return;

            if (!$element.data(key)) {
                if (!condition) return;

                const $placeholder = $element.prev();
                if ($placeholder.length === 0) return;

                $element.prependTo($parent);
                $element.data(key, $placeholder);
            } else {
                if (condition) return;

                const $placeholder = $element.data(key);
                $element.insertAfter($placeholder);
                $element.removeData(key);
            }
        });
    };

})(jQuery);
