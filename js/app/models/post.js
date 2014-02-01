/**
 * Created with JetBrains PhpStorm.
 * User: jimmy
 * Date: 1/31/14
 * Time: 5:39 PM
 * To change this template use File | Settings | File Templates.
 */

var Post = Backbone.Model.extend({
    title: function(title) {
        if(title !== undefined)
            this.set("title", title);
        return this.get("title");

    },
    author: function(author) {
        if(author !== undefined)
            this.set("author", author);
        return this.get("author");
    },
    // TODO get tags
    content: function(content) {
        if(content !== undefined)
            this.set("content", content);
        return this.get("content");
    },
    created: function(created) {
        if(created !== undefined)
            this.set("created", created);
        return this.get("created");
    },
    updated: function(updated) {
        if(updated !== undefined)
            this.set("updated", updated);
        return this.get("updated");
    },
    deleted: function(deleted) {
        if(deleted !== undefined)
            this.set("deleted", deleted);
        return this.get("deleted");
    },
    categories: function() {
        return this.get("categories");
    },
    type: function() {
        return "post";
    },
    uid: function() {
        return this.type() + "-" + this.id;
    }
});

var AskPost = Post.extend({
    type: function() {
        return "ask";
    }
});
var RelatePost = Post.extend({
    type: function() {
        return "relate";
    }
});
