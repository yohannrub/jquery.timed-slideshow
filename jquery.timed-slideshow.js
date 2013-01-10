/*!
 * jQuery Timed Slideshow v@1.0.2
 * https://github.com/yohannrub/jquery.timed-slideshow
 * Licensed under the MIT license
 */

;(function($) {

    var DEFAULT_SETTINGS = {
        autoPlay: true,
        duration: 5000,
        transitionDuration: 500,
        transitionEffect: 'slide',
        transitionDirectionSlide: 'horizontal',
        transitionCrossfade: false,
        transitionStep: 1,
        transitionEasing: null,
        transitionStartCallback: $.noop,
        transitionEndCallback: $.noop,
        startIndex: 0,
        slidesClass: 'slideshow-slides',
        prevClass: 'slideshow-prev',
        nextClass: 'slideshow-next',
        paginationClass: 'slideshow-pagination'
    };

    var GLOBALS = {};
    GLOBALS.activeClass = 'active';

    var namespace = 'slideshow';

    var methods = {
        init: function(options) {
            options = $.extend({}, DEFAULT_SETTINGS, options);

            return this.each(function() {
                var $this = $(this);
                var data = $.extend({}, options);

                var transitionDirectionSlideVertical = (data.transitionDirectionSlide == 'vertical');

                data.isPlaying = false;
                data.timer = null;
                data.timeStart = null;
                data.timeRemaining = data.duration;
                data.transitionRunning = false;
                data.transitionCssProperty = transitionDirectionSlideVertical ? 'top' : 'left';
                data.sizeCssProperty = transitionDirectionSlideVertical ? 'height' : 'width';
                data.$slidesUL = $this.find('.' + data.slidesClass);
                data.$slidesLI = data.$slidesUL.children();
                data.$paginationLI = null;
                data.currentIndex = mod(data.startIndex, data.$slidesLI.length);

                var $prevButton = $this.find('.' + data.prevClass),
                    $nextButton = $this.find('.' + data.nextClass),
                    $pagination = $this.find('.' + data.paginationClass);
                var $slidesContainer = $('<div></div>');

                $slidesContainer.css({
                    'overflow': 'hidden'
                });
                data.$slidesUL.css({
                    'margin': 0,
                    'padding': 0,
                    'position': 'relative',
                    'list-style': 'none',
                    'overflow': 'hidden'
                });

                if (data.transitionEffect == 'fade') {
                    data.$slidesLI.css({
                        'position': 'absolute',
                        'z-index': 0,
                        'opacity': 0
                    });
                    data.$slidesLI.eq(data.currentIndex).css({
                        'opacity': 1
                    });
                    data.$slidesUL.css({
                        'height': Math.max.apply(null, data.$slidesLI.map(function() {return $(this).outerHeight(true);}).get())
                    });
                    if (!data.transitionCrossfade) {
                        data.transitionDuration = data.transitionDuration / 2;
                    }
                } else {
                    data.$slidesLI.css({
                        'float': transitionDirectionSlideVertical ? 'none' : 'left'
                    });
                    data.slidesLISize = transitionDirectionSlideVertical ? data.$slidesLI.outerHeight(true) : data.$slidesLI.outerWidth(true);
                    data.$slidesUL.css(data.sizeCssProperty, data.slidesLISize * data.$slidesLI.length)
                        .css(data.transitionCssProperty, -data.currentIndex * data.slidesLISize);
                    $slidesContainer.css(data.sizeCssProperty, data.slidesLISize);
                }

                data.$slidesLI.eq(data.currentIndex).addClass(GLOBALS.activeClass);
                data.$slidesUL.wrap($slidesContainer);

                $prevButton.on('click', function() {
                    $this[namespace]('slide', data.currentIndex - data.transitionStep);
                    return false;
                });
                $nextButton.on('click', function() {
                    $this[namespace]('slide', data.currentIndex + data.transitionStep);
                    return false;
                });

                if ($pagination.length) {
                    var $paginationUL = $('<ul></ul>');
                    $paginationUL.on('click', 'li', function() {
                        $this[namespace]('slide', $(this).index());
                        return false;
                    });
                    data.$slidesLI.each(function() {
                        $('<li></li>').appendTo($paginationUL);
                    });
                    data.$paginationLI = $paginationUL.children();
                    data.$paginationLI.eq(data.currentIndex).addClass(GLOBALS.activeClass);
                    $paginationUL.appendTo($pagination);
                }

                $this.data(namespace, data);

                if(data.autoPlay) {
                    $this[namespace]('play');
                }
            });
        },

        getCurrentIndex: function() {
            var data = this.data(namespace);
            return data.currentIndex;
        },

        slide: function(newIndex) {
            return this.each(function() {
                var $this = $(this);
                var data = $this.data(namespace);

                if(!data.transitionRunning && data.currentIndex != newIndex) {
                    data.transitionRunning = true;
                    data.transitionStartCallback.call($this, newIndex);

                    newIndex = mod(newIndex, data.$slidesLI.length);

                    var transitionEndFunction = function() {
                        data.transitionRunning = false;
                        data.transitionEndCallback.call($this, newIndex);
                    };

                    if (data.transitionEffect == 'fade') {
                        var firstFadeTransition = function() {
                            return data.$slidesLI.eq(data.currentIndex).fadeTo(data.transitionDuration, 0, data.transitionEasing).css({'z-index': 0});
                        },
                        secondFadeTransition = function() {
                            return data.$slidesLI.eq(newIndex).fadeTo(data.transitionDuration, 1, data.transitionEasing).css({'z-index': 1});
                        };

                        if (data.transitionCrossfade) {
                            $.when(function(){firstFadeTransition(); secondFadeTransition(); return data.$slidesLI;}()).done(transitionEndFunction);
                        } else {
                            $.when(firstFadeTransition()).done(function(){$.when(secondFadeTransition()).done(transitionEndFunction);});
                        }
                    } else {
                        data.$slidesUL.animate(data.transitionCssProperty == 'left' ? {'left': -newIndex * data.slidesLISize} : {'top': -newIndex * data.slidesLISize}, data.transitionDuration, data.transitionEasing, transitionEndFunction);
                    }

                    data.$slidesLI.removeClass(GLOBALS.activeClass).eq(newIndex).addClass(GLOBALS.activeClass);
                    if (data.$paginationLI) {
                        data.$paginationLI.removeClass(GLOBALS.activeClass).eq(newIndex).addClass(GLOBALS.activeClass);
                    }

                    data.currentIndex = newIndex;

                    $this[namespace]('reset');
                }
            });
        },

        play: function() {
            return this.each(function() {
                var $this = $(this);
                var data = $this.data(namespace);

                if (!data.isPlaying) {
                    data.isPlaying = true;
                    clearTimeout(data.timer);
                    data.timeStart = $.now();
                    data.timer = setTimeout(function() {
                        $this[namespace]('slide', data.currentIndex + data.transitionStep);
                    }, data.timeRemaining);
                }
            });
        },

        pause: function() {
            return this.each(function() {
                var $this = $(this);
                var data = $this.data(namespace);

                if (data.isPlaying) {
                    data.isPlaying = false;
                    clearTimeout(data.timer);
                    if (data.timeStart) {
                        data.timeRemaining = data.timeRemaining - ($.now() - data.timeStart);
                    }
                }
            });
        },

        reset: function() {
            return this.each(function() {
                var $this = $(this);
                var data = $this.data(namespace);

                data.timeRemaining = data.duration;
                data.isPlaying = false;
                $this[namespace]('play');
            });
        }
    };

    function mod(num, modulo) {
        var remain = num % modulo;
        return Math.floor(remain >= 0 ? remain : remain + modulo);
    }

    $.fn[namespace] = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.' + namespace);
        }
    };

})(jQuery);
