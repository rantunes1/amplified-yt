define(['backbone', 'Channel'], function(Backbone, Channel) {
    "use strict";
    return Backbone.Collection.extend({
        model: Channel
    });
});