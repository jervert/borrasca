/*
 * SliceSlide - jQuery and Underscore plugin for slideshows
 *
 * Copyright (c) 2012 Antonio Rodriguez Ruiz
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Project home:
 *   http://outbook.es
 *
 * Version:  4.1.0
 *
 */


(function($) {
  $.fn.sliceSlide = function (options, extendedFn) {
    _.templateSettings = {
      interpolate: /\{\{(.+?)\}\}/g,
      evaluate: /\[\[(.+?)\]\]/g
    };
    var fnBase, defaults = {
      slidesBox: '[data-slice-slide-box]',
      slidesBoxSlide: '[data-slice-slide]',
      slidesBoxSlideActive: '.slice-slide-active',
      slidesBoxControls: '[data-slice-slide-controls]',
      slidesBoxControlsFixed: '[data-slice-slide-controls-fixed]',
      slidesBoxControlsPrevAndNext: '[data-slice-slide-controls-prev-and-next]',
      slidesBoxControlsNext: '[data-slice-slide-controls-next]',
      slidesBoxControlsPrev: '[data-slice-slide-controls-prev]',
      slidesBoxControlsPauseResume: '[data-slice-slide-controls-pause-resume]',
      slidesBoxControlsStatePlaying: '[data-slice-slide-playing]',
      links: 'a, [role="link"]',

      templatesTranslucent: '#slice-slide-translucent',
      templatesControls: '#slice-slide-controls',
      templateControlsPlaying: '#slice-slide-controls-playing',
      templateControlsPaused: '#slice-slide-controls-paused',

      classesActive: 'slice-slide-active',
      attrDestination: 'data-slice-slide-destination',
      translucentElement: true,

      attrThumb: 'data-thumbnail',
      thumbnailsInControls: false,

      prefixId: 'jquery-slice-slide-',
      numberSimultaneousSlides: 1,
      effectTime: 150,
      autoStart: true,
      loop: true,
      templatesUrl: 'jquery.sliceslide.templates.html',
      templatesCultureUrl: 'sliceslide_cultures/jquery.sliceslide.##CULTURE##.json',
      idSliceSlideTemplates: 'jquery-slice-slide-templates',
      slideTime: 3,
      culture: $('html').attr('lang') || 'en'
    },
      op = $.extend(true, {}, defaults, options),

      defaultFn = {
        culture: {},
        el: {},
        keys: {
          intro: 13,
          tab: 9,
          up: 38,
          right: 39,
          down: 40,
          left: 37
        },
        init: function () {
          var self = this;
          self.op.numberSimultaneousSlides = (self.op.thumbnailsInControls) ? 1 : self.op.numberSimultaneousSlides;
          self.el.slides = self.el.slidesBox.find(op.slidesBoxSlide);
          self.el.idSlideBox = this.getSlidesBoxId();
          self.el.slidesBox.attr('id', self.el.idSlideBox);
          self.ariaSlideBox();
          self.ariaSlides();
          self.setSlides(); // Activate initial slides, and hide all other
          self.controls(); // Play-Pause and slide number controls
        },

        ariaSlideBox: function () {
          var self = this;
          if (!self.el.slidesBox.is('[role="listbox"]')) {
            self.el.slidesBox.attr('role', 'listbox');
          }
        },

        addAriaAttributes: function (element) {
          var attributes = {};
          if (!element.is('[tabindex="0"]')) {
            attributes.tabindex = '0';
          }
          if (!element.is('[role="option"]')) {
            attributes.role = 'option';
          }
          element.attr(attributes);
        },
        ariaSlides: function () {
          var self = this;
          $.each(self.el.slides, function (index, slideObject) {
            var slide = $(slideObject);
            self.addAriaAttributes(slide);
            slide.on('keydown', function (event) {
              if (event.keyCode === self.keys.left || event.keyCode === self.keys.up) {
                event.preventDefault();
                self.pauseSlide();
                if (slide.prev(op.slidesBoxSlideActive).length > 0) {
                  slide.prev(op.slidesBoxSlideActive).focus();
                } else {
                  self.changeSlide(-1, true);
                }
              }

              if (event.keyCode === self.keys.right || event.keyCode === self.keys.down) {
                event.preventDefault();
                self.pauseSlide();
                if (slide.next(op.slidesBoxSlideActive).length > 0) {
                  slide.next(op.slidesBoxSlideActive).focus();
                } else {
                  self.changeSlide(1, true);
                }
              }
            });
          });
        },

        ariaControlsFixed: function () {
          var self = this;
          self.el.fixedLinks.on('keydown', function (event) {
            //console.log(event.keyCode);
            var controlContainer = $(this).closest(op.slidesBoxControlsFixed),
              controlContainerPrev = controlContainer.prev(op.slidesBoxControlsFixed),
              controlContainerNext = controlContainer.next(op.slidesBoxControlsFixed),
              controlContainerSiblings = controlContainer.siblings(op.slidesBoxControlsFixed);

            if (event.shiftKey && event.keyCode === self.keys.tab) {
              event.preventDefault();
              self.el.slideControlsBox.find(op.slidesBoxControlsPrevAndNext).first().find(op.links).first().focus();
            } else if (!event.shiftKey && event.keyCode === self.keys.tab) {
              event.preventDefault();
              self.el.slides.filter('[aria-selected="true"]').first().focus();
            }

            if (event.keyCode === self.keys.left || event.keyCode === self.keys.up) {
              event.preventDefault();
              if (controlContainerPrev.length > 0) {
                controlContainerPrev.find(op.links).first().focus();
              } else {
                controlContainerSiblings.last().find(op.links).first().focus();
              }
            }

            if (event.keyCode === self.keys.right || event.keyCode === self.keys.down) {
              event.preventDefault();
              if (controlContainerNext.length > 0) {
                controlContainerNext.find(op.links).first().focus();
              } else {
                controlContainerSiblings.first().find(op.links).first().focus();
              }
            }
          });
        },

        getSlidesBoxId: function () {
          var self = this,
            idSlideBox = op.prefixId + (self.el.slidesBoxIndex + 1);
          while ($('#' + idSlideBox).length) {
            self.el.slidesBoxIndex += 1;
            idSlideBox = op.prefixId + (self.el.slidesBoxIndex + 1);
          }
          return idSlideBox;
        },

        tmpl: function (id, context) {
          var html = $(id).html();
          return _.template(html, context);
        },

        setSlides: function () {
          var self = this;
          self.el.slides.each(function (index, slide) {
            $(slide).attr('id', self.el.idSlideBox + '-' + (index + 1));
            if (op.translucentElement) {
              $(slide).append(self.tmpl(op.templatesTranslucent), {text: self.culture});
            }
          });
          self.initialSlides();
        },

        initialSlides: function () {
          var self = this,
            allSlides = self.el.slidesBox.find(op.slidesBoxSlide),
            initialSlides = allSlides.filter(':lt(' + op.numberSimultaneousSlides + ')'),
            notInitialSlides = allSlides.filter(':gt(' + (op.numberSimultaneousSlides - 1) + ')');
          initialSlides.addClass(op.classesActive);
          notInitialSlides.hide();
        },

        getThumbnailsRoutes: function () {
          var self = this,
            thumbnails = [];
          self.el.slides.each(function () {
            thumbnails.push($(this).attr(self.op.attrThumb));
          });
          return thumbnails;
        },

        controls: function () {
          var self = this,
            pagesNumberRaw = self.el.slides.length / self.op.numberSimultaneousSlides, //
            pagesNumber = Math.ceil(pagesNumberRaw),
            thumbnails = (self.op.thumbnailsInControls === true) ? self.getThumbnailsRoutes() : null;

          self.el.slidesBox.prepend(self.tmpl(self.op.templatesControls, {id: self.el.idSlideBox, slides: self.el.slides, pagesNumber: pagesNumber, numberSimultaneousSlides: self.op.numberSimultaneousSlides, text: self.culture, root: self.op.root, thumbnails: thumbnails}));
          self.startSlide();
        },

        getControls: function (controls) {
          var self = this;
          return self.el.slideControlsBox.find(controls);
        },

        startSlide: function () {
          var self = this;
          self.el.slideControlsBox = self.el.slidesBox.find(op.slidesBoxControls).first();
          self.el.slideControls = self.getSlideControls();

          if (!op.loop) {
            self.el.slideControls.previous.hide();
          }
          if (!op.autoStart) {
            self.el.slideControls.pauseResume.remove();
          }

          self.eventControlsNextAndPrevious();
          self.eventControlsFixed();
          self.eventControlsPauseResume();
          self.startInterval();
        },

        startInterval: function () {
          if (op.autoStart) {
            var self = this;
            self.el.interval = setInterval(function () {
              self.changeSlide(1);
            }, self.el.intervalTime);
          }
        },

        getSlideControls: function () {
          var self = this;
          return {
            fixed: self.getControls(op.slidesBoxControlsFixed),
            previous: self.getControls(op.slidesBoxControlsPrev),
            next: self.getControls(op.slidesBoxControlsNext),
            pauseResume: self.getControls(op.slidesBoxControlsPauseResume)
          };
        },
        
        isVisible: function (element) {
          return $(element).is(':visible');
        },

        eventControlsNextAndPrevious: function () {
          var self = this,
            slideControlsEvent = 'click.sliceControls',
            controlPrevious = self.el.slideControls.previous,
            controlNext = self.el.slideControls.next;
          if ($.isTouchCapable()) {
            self.el.slides.off('swipe.slides').on('swipe.slides', function (ev, touch) {
              if (touch.direction === 'right' && self.isVisible(controlPrevious)) {
                self.launchChangeSlide(ev, -1);
              } else if (touch.direction === 'left' && self.isVisible(controlNext)) {
                self.launchChangeSlide(ev, 1);
              }
            });
          }
          controlPrevious.off(slideControlsEvent).on(slideControlsEvent, function (ev) {
            self.launchChangeSlide(ev, -1);
          });
          controlNext.off(slideControlsEvent).on(slideControlsEvent, function (ev) {
            self.launchChangeSlide(ev, 1);
          });
        },
        launchChangeSlide: function (ev, direction) {
          ev.preventDefault();
          this.pauseSlide();
          this.changeSlide(direction);
        },

        eventControlsFixed: function () {
          var self = this;

          self.el.fixedLinks = self.el.slideControls.fixed.find(op.links);

          self.el.fixedLinks.on('click', function (event) {
            event.preventDefault();
            var newSelectedInFixed = $(this).closest(op.slidesBoxControlsFixed),
              selectedInFixed = newSelectedInFixed.siblings(op.slidesBoxSlideActive);
            self.pauseSlide();
            self.goToSlide($(this), $(this).attr(op.attrDestination), newSelectedInFixed, selectedInFixed, 1, true);
          });
          self.ariaControlsFixed();
        },

        eventControlsPauseResume: function () {
          var self = this;
          self.el.slideControls.pauseResume.bind('click', function (event) {
            event.preventDefault();
            if (self.el.slideControls.pauseResume.find(op.slidesBoxControlsStatePlaying).length > 0) {
              self.pauseSlide();
            } else {
              self.el.slideControls.pauseResume.html(self.tmpl(op.templateControlsPlaying, {text: self.culture}));
              self.resumeSlide();
            }
          });
        },

        resumeSlide: function () {
          var self = this;
          self.startInterval();
        },

        pauseSlide: function () {
          var self = this;
          clearInterval(self.el.interval);
          self.el.slideControls.pauseResume.html(self.tmpl(op.templateControlsPaused, {text: self.culture}));
        },

        changeSlide: function (direction, focus) {
          var self = this,
            newSelectedInFixed,
            link,
            destination,
            selectedInFixed = self.el.slideControlsBox.find(op.slidesBoxSlideActive).first();

          if (direction > 0) {
            if (selectedInFixed.is(':last-child')) {
              newSelectedInFixed = selectedInFixed.siblings().first();
            } else {
              newSelectedInFixed = selectedInFixed.next();
            }
            if (!op.loop) {
              self.el.slideControls.previous.show();
            }
          } else {
            if (selectedInFixed.is(':first-child')) {
              newSelectedInFixed = selectedInFixed.siblings().last();
            } else {
              newSelectedInFixed = selectedInFixed.prev();
            }
            if (!op.loop) {
              self.el.slideControls.next.show();
            }
          }

          if (!op.loop) {
            if (newSelectedInFixed.is(':last-child')) {
              self.el.slideControls.next.hide();
            } else if (newSelectedInFixed.is(':first-child')) {
              self.el.slideControls.previous.hide();
            }
          }

          link = newSelectedInFixed.find(op.links).first();
          destination = link.attr(op.attrDestination);
          self.goToSlide(link, destination, newSelectedInFixed, selectedInFixed, direction, focus);
        },

        goToSlide: function (link, destination, newSelectedInFixed, selectedInFixed, direction, focus) {
          selectedInFixed.removeClass(op.classesActive);
          newSelectedInFixed.addClass(op.classesActive);

          var activeSlides = $(destination).siblings(op.slidesBoxSlideActive),
            newActiveSlides;

          if ($(destination).is(':hidden')) {
            activeSlides.removeClass(op.classesActive).removeAttr('aria-selected').attr('tabindex', '0').fadeOut(op.effectTime, function() {
              if (op.numberSimultaneousSlides > 1) {
                var nextDestination = $(destination).next(),
                  i = 1;
                while (i < op.numberSimultaneousSlides) {
                  nextDestination.addClass(op.classesActive);
                  nextDestination = nextDestination.next();
                  i += 1;
                }
              }
              $(destination).addClass(op.classesActive);
              newActiveSlides = $(destination).add($(destination).siblings(op.slidesBoxSlideActive));
              newActiveSlides.attr({'aria-selected': true, 'tabindex': '0'}).fadeIn(op.effectTime, function () {
                if (focus && direction > 0) {
                  newActiveSlides.first().focus();
                } else if (focus && direction < 0) {
                  newActiveSlides.last().focus();
                }
              });
            });
          }
        }
      };

    fnBase = $.extend(true, {op: op}, defaultFn, extendedFn);

    function initSliceSlides(cultureContent) {
      $(op.slidesBox).each(function (index) {
        var fn = $.extend(true, {}, fnBase);
        fn.culture = cultureContent;
        fn.el = $.extend({}, {
          slidesBox: $(this),
          slidesBoxIndex: index,
          intervalTime: op.slideTime * 1000
        });
        fn.init($(this), index);
      });
    }

    function getCulturesJson() {
      $.getJSON(op.templatesCultureUrl.replace('##CULTURE##', op.culture), function (json) {
        initSliceSlides(json);
      });
    }

    function questionCultures() {
      if (_.isObject(op.templatesCultureJson)) {
        var selectedCulture;
        if (_.isObject(op.templatesCultureJson[op.culture])) {
          selectedCulture = op.templatesCultureJson[op.culture];
        } else {
          selectedCulture = op.fallbackCultureJson;
        }
        initSliceSlides(selectedCulture);
      } else {
        getCulturesJson();
      }
    }

    if ($('#' + op.idSliceSlideTemplates).length === 0) {
      $.get(op.templatesUrl, function (data) {
        $('body').append('<div id="' + op.idSliceSlideTemplates + '">' + data + '</div>');
        questionCultures();
      });
    } else {
      questionCultures();
    }
  };
}(jQuery));