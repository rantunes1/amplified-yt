define(['backbone', 'amplify', 'jq.xdomainajax'], function(Backbone, amplify) {
    "use strict";
    return Backbone.Model.extend({

        defaults: {
            url: '',
            name: '',
            link: '',
            username: '',
            subscribers: 0
        },

        load: function() {
            var self = this;
            amplify.request('user.channel', {
                channel: this.id
            },function(data, status) {
                if (status === 'success') {
                    self.trigger('user.channel.loaded', data);
                } else {
                    self.trigger('user.channel.error', data, status);
                }
            });
        }
    });
});