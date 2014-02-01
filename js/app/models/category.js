/**
 * Created with JetBrains PhpStorm.
 * User: CCMIT Faculty
 * Date: 2/1/14
 * Time: 10:16 AM
 * To change this template use File | Settings | File Templates.
 */

var Category = Backbone.Model.extend({
    name: function(name) {
        if(name !== undefined)
            this.set("name", name);
        return this.get("name");

    },
    description: function(description) {
        if(description !== undefined)
            this.set("description", description);
        return this.get("description");
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
    uid: function() {
        return this.name() + "-" + this.id;
    }
});
