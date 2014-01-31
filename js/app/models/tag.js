/**
 * Created with JetBrains PhpStorm.
 * User: jimmy
 * Date: 1/31/14
 * Time: 5:39 PM
 * To change this template use File | Settings | File Templates.
 */

var Tag = Backbone.Model.extend({
    id: function() {
        return this.get("id");
    },
    name: function(name) {
        if(name !== undefined)
            this.set("name", name);
        return this.get("name");
    }
});
