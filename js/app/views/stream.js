/**
 * Created with JetBrains PhpStorm.
 * User: jimmy
 * Date: 1/31/14
 * Time: 1:11 PM
 * To change this template use File | Settings | File Templates.
 */

var StreamPostView = Backbone.Marionette.ItemView.extend({
    tagName: 'dd',
    template: '#template-post',
    model: Post
});

var StreamPostsView = Backbone.Marionette.CollectionView.extend({
    tagName: 'dl',
    itemView: StreamPostView
});
