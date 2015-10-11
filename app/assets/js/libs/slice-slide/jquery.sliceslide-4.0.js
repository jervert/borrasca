/*
 * SliceSlide - jQuery and Underscore plugin for slideshows
 *
 * Copyright (c) 2015 Antonio Rodriguez Ruiz
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Project home:
 *   http://outbook.es
 *
 * Version:  4.2.1
 *
 */


(function($) {
  $.fn.sliceSlide = function (options, extendedFn) {
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
      controlsAdditionOrder: 'prepend',
      templatesUrl: 'jquery.sliceslide.templates.html',
      templatesCultureUrl: 'sliceslide_cultures/jquery.sliceslide.##CULTURE##.json',
      idSliceSlideTemplates: 'jquery-slice-slide-templates',
      slideTemplatesPlaceholder: true,
      setTemplateSettings: true,
      templateSettings: {
        interpolate: /\{\{(.+?)\}\}/g,
        evaluate: /\[\[(.+?)\]\]/g
      },
      slideTime: 3,
      culture: $('html').attr('lang') || 'en'
    },
      self,
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
          self = this;
          self.op.numberSimultaneousSlides = (self.op.thumbnailsInControls) ? 1 : self.op.numberSimultaneousSlides;
          self.el.slides = self.el.slidesBox.find(op.slidesBoxSlide);
          self.el.idSlideBox = self.getSlidesBoxId();
          self.el.slidesBox.attr('id', self.el.idSlideBox);
          self.setTemplateSettings();
          self.initAria();
          self.setSlides(); // Activate initial slides, and hide all other
          self.controls(); // Play-Pause and slide number controls
        },

        initAria: function () {
          self.ariaSlideBox();
          self.ariaSlides();
        },

        setTemplateSettings: function () {
          if (op.setTemplateSettings) {
            _.templateSettings = op.templateSettings;
          }
        },

        ariaSlideBox: function () {
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
          $.each(self.el.slides, function (index, slideObject) {
            var slide = $(slideObject);
            self.addAriaAttributes(slide);
            slide.on('keydown', function (ev) {
              if (ev.keyCode === self.keys.left || ev.keyCode === self.keys.up) {
                ev.preventDefault();
                self.pauseSlide();
                if (slide.prev(op.slidesBoxSlideActive).length > 0) {
                  slide.prev(op.slidesBoxSlideActive).focus();
                } else {
                  self.changeSlide(-1, true);
                }
              }

              if (ev.keyCode === self.keys.right || ev.keyCode === self.keys.down) {
                ev.preventDefault();
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
          self.el.fixedLinks.on('keydown', function (ev) {
            var controlContainer = $(this).closest(op.slidesBoxControlsFixed),
              controlContainerPrev = controlContainer.prev(op.slidesBoxControlsFixed),
              controlContainerNext = controlContainer.next(op.slidesBoxControlsFixed),
              controlContainerSiblings = controlContainer.siblings(op.slidesBoxControlsFixed);

            if (ev.shiftKey && ev.keyCode === self.keys.tab) {
              ev.preventDefault();
              self.el.slideControlsBox.find(op.slidesBoxControlsPrevAndNext).first().find(op.links).first().focus();
            } else if (!ev.shiftKey && ev.keyCode === self.keys.tab) {
              ev.preventDefault();
              self.el.slides.filter('[aria-selected="true"]').first().focus();
            }

            if (ev.keyCode === self.keys.left || ev.keyCode === self.keys.up) {
              ev.preventDefault();
              if (controlContainerPrev.length > 0) {
                controlContainerPrev.find(op.links).first().focus();
              } else {
                controlContainerSiblings.last().find(op.links).first().focus();
              }
            }

            if (ev.keyCode === self.keys.right || ev.keyCode === self.keys.down) {
              ev.preventDefault();
              if (controlContainerNext.length > 0) {
                controlContainerNext.find(op.links).first().focus();
              } else {
                controlContainerSiblings.first().find(op.links).first().focus();
              }
            }
          });
        },

        getSlidesBoxId: function () {
          var idSlideBox = op.prefixId + (self.el.slidesBoxIndex + 1);
          while ($('#' + idSlideBox).length) {
            self.el.slidesBoxIndex += 1;
            idSlideBox = op.prefixId + (self.el.slidesBoxIndex + 1);
          }
          return idSlideBox;
        },

        tmpl: function (id, context) {
          var html = _.template($(id).html());
          return html(context);
        },

        setSlides: function () {
          self.el.slides.each(function (index, slide) {
            $(slide).attr('id', self.el.idSlideBox + '-' + (index + 1));
            if (op.translucentElement) {
              $(slide).append(self.tmpl(op.templatesTranslucent), {text: self.culture});
            }
          });
          self.initialSlides();
        },

        initialSlides: function () {
          var allSlides = self.el.slidesBox.find(op.slidesBoxSlide),
            initialSlides = allSlides.filter(':lt(' + op.numberSimultaneousSlides + ')'),
            notInitialSlides = allSlides.filter(':gt(' + (op.numberSimultaneousSlides - 1) + ')');
          initialSlides.addClass(op.classesActive);
          notInitialSlides.hide();
        },

        getThumbnailsRoutes: function () {
          var thumbnails = [];
          self.el.slides.each(function () {
            thumbnails.push($(this).attr(self.op.attrThumb));
          });
          return thumbnails;
        },

        controls: function () {
          var pagesNumberRaw = (self.el.slides.length) / (self.op.numberSimultaneousSlides),
            pagesNumber = Math.ceil(pagesNumberRaw),
            thumbnails = (self.op.thumbnailsInControls === true) ? self.getThumbnailsRoutes() : null;

          self.el.slidesBox[op.controlsAdditionOrder](self.tmpl(self.op.templatesControls, {id: self.el.idSlideBox, slides: self.el.slides, pagesNumber: pagesNumber, numberSimultaneousSlides: self.op.numberSimultaneousSlides, text: self.culture, root: self.op.root, thumbnails: thumbnails}));
          self.startSlide();
        },

        getControls: function (controls) {
          return self.el.slideControlsBox.find(controls);
        },

        startSlide: function () {
          self.el.slideControlsBox = self.el.slidesBox.find(op.slidesBoxControls).first();
          self.el.slideControls = self.getSlideControls();

          if (!op.loop) {
            self.el.slideControls.previous.hide();
          }
          if (!op.autoStart) {
            self.el.slideControls.pauseResume.remove();
          }
          
          self.afterStartSlide();
        },

        afterStartSlide: function () {
          self.eventControlsNextAndPrevious();
          self.eventControlsFixed();
          self.eventControlsPauseResume();
          self.startInterval();
        },

        startInterval: function () {
          if (op.autoStart) {
            self.el.interval = setInterval(function () {
              self.changeSlide(1);
            }, self.el.intervalTime);
          }
        },

        getSlideControls: function () {
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
          var slideControlsEvent = 'click.sliceControls',
            controlPrevious = self.el.slideControls.previous,
            controlNext = self.el.slideControls.next;
          self.touchControls(controlPrevious, controlNext);
          controlPrevious.off(slideControlsEvent).on(slideControlsEvent, function (ev) {
            self.launchChangeSlide(ev, -1);
          });
          controlNext.off(slideControlsEvent).on(slideControlsEvent, function (ev) {
            self.launchChangeSlide(ev, 1);
          });
        },

        touchControls: function (controlPrevious, controlNext) {
          if (_.isFunction($.isTouchCapable) && $.isTouchCapable()) {
            self.el.slides.off('swipe.slides').on('swipe.slides', function (ev, touch) {
              if (touch.direction === 'right' && self.isVisible(controlPrevious)) {
                self.launchChangeSlide(ev, -1);
              } else if (touch.direction === 'left' && self.isVisible(controlNext)) {
                self.launchChangeSlide(ev, 1);
              }
            });
          }
        },

        launchChangeSlide: function (ev, direction) {
          ev.preventDefault();
          self.pauseSlide();
          self.changeSlide(direction);
        },

        eventControlsFixed: function () {
          self.el.fixedLinks = self.el.slideControls.fixed.find(op.links);
          self.el.fixedLinks.on('click', self.clickFixedLink);
          self.ariaControlsFixed();
        },

        clickFixedLink: function (ev) {
          ev.preventDefault();
          var newSelectedInFixed = $(this).closest(op.slidesBoxControlsFixed),
            selectedInFixed = newSelectedInFixed.siblings(op.slidesBoxSlideActive);
          self.pauseSlide();
          self.goToSlide($(this), $(this).attr(op.attrDestination), newSelectedInFixed, selectedInFixed, 1, true);
        },

        eventControlsPauseResume: function () {
          self.el.slideControls.pauseResume.bind('click', function (ev) {
            ev.preventDefault();
            if (self.el.slideControls.pauseResume.find(op.slidesBoxControlsStatePlaying).length > 0) {
              self.pauseSlide();
            } else {
              self.el.slideControls.pauseResume.html(self.tmpl(op.templateControlsPlaying, {text: self.culture}));
              self.resumeSlide();
            }
          });
        },

        resumeSlide: function () {
          self.startInterval();
        },

        pauseSlide: function () {
          clearInterval(self.el.interval);
          self.el.slideControls.pauseResume.html(self.tmpl(op.templateControlsPaused, {text: self.culture}));
        },

        changeSlide: function (direction, focus) {
          var newSelectedInFixed,
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

          if (!op.loop) {
            if (newSelectedInFixed.is(':last-child')) {
              self.el.slideControls.next.hide();
            } else if (newSelectedInFixed.is(':first-child')) {
              self.el.slideControls.previous.hide();
            } else {
              self.el.slideControls.next.show();
              self.el.slideControls.previous.show();
           }
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
      } else if (!_.isNull(op.templatesCultureUrl)) {
        getCulturesJson();
      } else {
        initSliceSlides(null);
      }
    }

    function retrieveTemplates () {
      $.get(op.templatesUrl, function (data) {
        $('body').append('<div id="' + op.idSliceSlideTemplates + '">' + data + '</div>');
        questionCultures();
      });
    }

    if (op.slideTemplatesPlaceholder && $('#' + op.idSliceSlideTemplates).length === 0) {
      retrieveTemplates();
    } else {
      questionCultures();
    }
  };
}(jQuery));