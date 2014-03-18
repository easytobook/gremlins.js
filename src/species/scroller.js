/**
 * The scroller gremlin scrolls the viewport to reveal another part of the document
 *
 *   var scrollerGremlin = gremlins.species.scroller();
 *   horde.gremlin(scrollerGremlin);
 *
 * The scrollerGremlin gremlin can be customized as follows:
 *
 *   scrollerGremlin.positionSelector(function() { // return a random position to scroll to });
 *   scrollerGremlin.showAction(function(element) { // show the gremlin activity on screen });
 *   scrollerGremlin.logger(loggerObject); // inject a logger
 *   scrollerGremlin.randomizer(randomizerObject); // inject a randomizer
 *
 * Example usage:
 *
 *   horde.gremlin(gremlins.species.clicker()
 *     .positionSelector(function() {
 *       // only click in the app
 *       var $list = $('#todoapp');
 *       var offset = $list.offset();
 *       return [
 *         parseInt(Math.random() * $list.outerWidth() + offset.left),
 *         parseInt(Math.random() * ($list.outerHeight() + $('#info').outerHeight()) + offset.top)
 *       ];
 *     })
 *   )
 */
define(function(require) {
    "use strict";

    var configurable = require('../utils/configurable');
    var Chance = require('../vendor/chance');

    return function() {

        var document = window.document,
            documentElement = document.documentElement,
            body = document.body;

        var defaultPositionSelector = function(element) {
            var documentWidth = Math.max(body.scrollWidth, body.offsetWidth, element.scrollWidth, element.offsetWidth, element.clientWidth),
                documentHeight = Math.max(body.scrollHeight, body.offsetHeight, element.scrollHeight, element.offsetHeight, element.clientHeight);

            return [
                config.randomizer.natural({ max: documentWidth  - element.clientWidth }),
                config.randomizer.natural({ max: documentHeight  - element.clientHeight })
            ];
        };


        var defaultShowAction = function(scrollX, scrollY) {
            var clickSignal = document.createElement('div');
            clickSignal.style.border = "3px solid red";
            clickSignal.style.width = (documentElement.clientWidth - 25) + "px";
            clickSignal.style.height = (documentElement.clientHeight - 25) + "px";
            clickSignal.style.position = "absolute";
            clickSignal.style.webkitTransition = 'opacity 1s ease-out';
            clickSignal.style.mozTransition = 'opacity 1s ease-out';
            clickSignal.style.transition = 'opacity 1s ease-out';
            clickSignal.style.left = (scrollX + 10) + 'px';
            clickSignal.style.top = (scrollY + 10) + 'px';
            var element = body.appendChild(clickSignal);
            setTimeout(function() {
                body.removeChild(element);
            }, 1000);
            setTimeout(function() {
                element.style.opacity = 0;
            }, 50);
        };

        /**
         * @mixin
         */
        var config = {
            positionSelector: defaultPositionSelector,
            showAction:       defaultShowAction,
            logger:           {},
            randomizer:       new Chance(),
            scrollableElements: []
        };

        /**
         * @mixes config
         */
        function scrollerGremlin() {
            config.scrollableElements.push(documentElement);

            var indexEl = config.randomizer.natural({ max: config.scrollableElements.length  - 1 });
            var el = config.scrollableElements[indexEl];

            var position = config.positionSelector(el),
                scrollX = position[0],
                scrollY = position[1];

            el.scrollLeft = scrollX;
            el.scrollTop = scrollY;


            if (typeof config.showAction == 'function') {
                config.showAction(scrollX, scrollY);
            }

            if (typeof config.logger.log == 'function') {
                config.logger.log('gremlin', 'scroller  ', 'scroll to', scrollX, scrollY);
            }
        }

        configurable(scrollerGremlin, config);

        return scrollerGremlin;
    };
});
