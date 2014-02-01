/**
 * Created with JetBrains PhpStorm.
 * User: CCMIT Faculty
 * Date: 2/1/14
 * Time: 1:09 PM
 * To change this template use File | Settings | File Templates.
 */

;(function ($, window, document, undefined) {
    'use strict';

    Foundation.libs.stream = {
        name : 'stream',

        version : '5.0.1',

        settings : {
            active_class: 'active',
            toggleable: true
        },

        init : function (scope, method, options) {
            this.bindings(method, options);
        },

        events : function () {
            $(this.scope).off('.stream').on('click.fndtn.stream', '.stream > .stream-post > .post-meta > .post-title > a', function (e) {
                var post = $(this).parent().parent().parent(),
                    target = $('#' + this.href.split('#')[1]),
                    siblings = $('> .stream-post > .post-content', target.closest('.stream')),
                    settings = post.parent().data('stream-init'),
                    active = $('> .stream-post > .post-content.' + settings.active_class, post.parent());

                e.preventDefault();

                if (active[0] == target[0] && settings.toggleable) {
                    return target.toggleClass(settings.active_class);
                }

                siblings.removeClass(settings.active_class);
                target.addClass(settings.active_class);
            });
        },

        off : function () {},

        reflow : function () {}
    };
}(jQuery, this, this.document));

/*
(function() {
    var posts = $(".stream").find(".stream-post");

    posts.find(".post-meta").find(".post-title").find("a").on("click", function() {
        posts.find(".post-content").filter(".active").removeClass("active");
        $($(this).attr("href")).toggleClass("active");
    });
})();
*/
