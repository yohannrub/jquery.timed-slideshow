/*!
 * jQuery Timed Slideshow v@1.1
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
        sizeSlide: 1,
        startIndex: 0,
        slidesClass: 'slideshow-slides',
        prevClass: 'slideshow-prev',
        nextClass: 'slideshow-next',
        paginationClass: 'slideshow-pagination'
    };

    var DEFAULT_CLASSES = {
        active: 'active'
    };

    var namespace = 'slideshow';

    function mod(num, modulo) {
        var remain = num % modulo;
        return (remain >= 0 ? remain : remain + modulo);
    }

    var methods = {
        init: function(options) {
            options = $.extend({}, DEFAULT_SETTINGS, options);

            return this.each(function() {
                var $this = $(this),
                    data = $.extend({}, options);

                data.isPlaying = false;
                data.timer = null;
                data.timeStart = null;
                data.timePause = null;
                data.timeRemaining = null;
                data.transitionRunning = false;
                data.$slidesUL = $this.find('.' + data.slidesClass);
                data.$slidesLI = data.$slidesUL.children();
                data.$paginationLI = null;
                data.currentIndex = mod(data.startIndex, data.$slidesLI.length);
                data.lastIndex = (data.transitionEffect == 'fade') ? data.$slidesLI.length - 1 : data.$slidesLI.length - data.sizeSlide;

                var $prevButton = $this.find('.' + data.prevClass),
                    $nextButton = $this.find('.' + data.nextClass),
                    $pagination = $this.find('.' + data.paginationClass),
                    $slidesContainer = $('<div></div>');

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
                    }).eq(data.currentIndex).css({
                        'z-index': 1,
                        'opacity': 1
                    });
                    data.$slidesUL.css({
                        'height': Math.max.apply(null, data.$slidesLI.map(function() {return $(this).outerHeight(true);}).get())
                    });
                    if (!data.transitionCrossfade) {
                        data.transitionDuration = data.transitionDuration / 2;
                    }
                } else {
                    var transitionDirectionSlideVertical = (data.transitionDirectionSlide == 'vertical');
                    var sizeSlideCssProperty = transitionDirectionSlideVertical ? 'height' : 'width';
                    data.transitionSlideCssProperty = transitionDirectionSlideVertical ? 'top' : 'left';

                    data.$slidesLI.css({
                        'float': transitionDirectionSlideVertical ? 'none' : 'left'
                    });
                    data.slidesLISize = transitionDirectionSlideVertical ? data.$slidesLI.outerHeight(true) : data.$slidesLI.outerWidth(true);
                    data.$slidesUL.css(sizeSlideCssProperty, data.slidesLISize * data.$slidesLI.length)
                        .css(data.transitionSlideCssProperty, -data.currentIndex * data.slidesLISize);
                    $slidesContainer.css(sizeSlideCssProperty, data.slidesLISize * data.sizeSlide);
                }

                data.$slidesLI.eq(data.currentIndex).addClass(DEFAULT_CLASSES.active);
                data.$slidesUL.wrap($slidesContainer);

                $prevButton.on('click', function() {
                    $this[namespace]('slideNext', true);
                });
                $nextButton.on('click', function() {
                    $this[namespace]('slideNext');
                });

                if ($pagination.length) {
                    var $paginationUL = $('<ul></ul>');
                    $paginationUL.on('click', 'li', function() {
                        $this[namespace]('slide', $(this).index());
                    });
                    for (var i = 0; i <= data.lastIndex; i++) {
                        $('<li></li>').appendTo($paginationUL);
                    }
                    data.$paginationLI = $paginationUL.children();
                    data.$paginationLI.eq(data.currentIndex).addClass(DEFAULT_CLASSES.active);
                    $paginationUL.appendTo($pagination);
                }

                $this.data(namespace, data);

                if(data.autoPlay) {
                    $this[namespace]('play');
                }
            });
        },

        slideNext: function(reverse) {
            return this.each(function() {
                var $this = $(this),
                    data = $this.data(namespace);

                var newIndex = mod(data.currentIndex + (reverse ? -1 : 1) * data.transitionStep, data.$slidesLI.length);
                if (newIndex > data.lastIndex) {
                    newIndex = (data.currentIndex == data.lastIndex) ? 0 : data.lastIndex;
                }
                $this[namespace]('slide', newIndex);
            });
        },

        slide: function(newIndex) {
            return this.each(function() {
                var $this = $(this),
                    data = $this.data(namespace);

                var oldIndex = data.currentIndex;
                newIndex = mod(newIndex, data.$slidesLI.length);

                if(!data.transitionRunning && oldIndex != newIndex) {
                    data.transitionRunning = true;

                    var transitionEndFunction = function() {
                        data.transitionRunning = false;
                        data.transitionEndCallback.call($this);
                    };

                    if (data.transitionEffect == 'fade') {
                        var fadeTransition = function(which) {
                            return data.$slidesLI.eq([oldIndex, newIndex][which]).fadeTo(data.transitionDuration, [0, 1][which], data.transitionEasing).css({'z-index': [0, 1][which]});
                        };

                        if (data.transitionCrossfade) {
                            $.when(fadeTransition(0), fadeTransition(1)).done(transitionEndFunction);
                        } else {
                            $.when(fadeTransition(0)).done(function() {$.when(fadeTransition(1)).done(transitionEndFunction);});
                        }
                    } else {
                        if (newIndex > data.lastIndex) {
                            newIndex = data.lastIndex;
                        }
                        var properties = {};
                        properties[data.transitionSlideCssProperty] = -newIndex * data.slidesLISize;
                        data.$slidesUL.animate(properties, data.transitionDuration, data.transitionEasing, transitionEndFunction);
                    }

                    data.$slidesLI.removeClass(DEFAULT_CLASSES.active).eq(newIndex).addClass(DEFAULT_CLASSES.active);
                    if (data.$paginationLI) {
                        data.$paginationLI.removeClass(DEFAULT_CLASSES.active).eq(newIndex).addClass(DEFAULT_CLASSES.active);
                    }

                    data.currentIndex = newIndex;

                    data.transitionStartCallback.call($this);

                    $this[namespace]('reset');
                }
            });
        },

        play: function() {
            return this.each(function() {
                var $this = $(this),
                    data = $this.data(namespace);

                if (!data.isPlaying) {
                    data.isPlaying = true;
                    clearTimeout(data.timer);
                    data.timeRemaining = (data.timeStart && data.timePause) ? data.timeRemaining - (data.timePause - data.timeStart) : data.duration;
                    data.timeStart = $.now();
                    data.timer = setTimeout(function() {
                        $this[namespace]('slideNext');
                    }, data.timeRemaining);
                }
            });
        },

        pause: function() {
            return this.each(function() {
                var $this = $(this),
                    data = $this.data(namespace);

                if (data.isPlaying) {
                    data.isPlaying = false;
                    clearTimeout(data.timer);
                    data.timePause = $.now();
                }
            });
        },

        reset: function() {
            return this.each(function() {
                var $this = $(this),
                    data = $this.data(namespace);

                $this[namespace]('pause');
                data.timeStart = data.timePause = null;
                $this[namespace]('play');
            });
        },

        getCurrentIndex: function() {
            return this.data(namespace).currentIndex;
        }
    };

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
