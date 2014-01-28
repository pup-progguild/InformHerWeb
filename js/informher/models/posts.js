/**
 * Created with JetBrains PhpStorm.
 * User: CCMIT Faculty
 * Date: 1/28/14
 * Time: 6:15 PM
 * To change this template use File | Settings | File Templates.
 */

var Posts = Backbone.Model.extend({
    defaults: function() {
        return {

        };
    }
});

var jsonPosts;
var postsStreamId = "posts-stream";

function displayPosts(posts) {
    var postStream = $("#" + postsStreamId);
    postStream.html("");

    for(var i = 0; i < posts.length; i++) {
        var post = posts[i];
        var id = post.type + '-' + post.id,
            title = post.title,
            content = post.content;
        postStream.append(
            '<dd>' +
                '<a href="#' + id + '"><div class="row">' +
                '<div class="small-8 columns">' + title + '</div>' +
                '<div class="small-4 columns"><ul class="inline-list"></ul></div>' +
                '</div></a>' +
                '<div id="' + id + '" class="content">' + content + '</div>' +
            '</dd>'
        );
    }
}

$.getJSON("http://informherapi.azurewebsites.net/post", function(data) {
    if(data.status == "POSTS_ALL_RETRIEVE_SUCCESSFUL") {
        displayPosts(data.posts);
    }
    else {
        alert("Can't load data");
    }
});
