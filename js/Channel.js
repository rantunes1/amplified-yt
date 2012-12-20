define(['jquery', 'backbone', 'amplify', 'jq.xdomainajax'], function($, Backbone, amplify) {
    "use strict";
    return Backbone.Model.extend({

        defaults: {
            url: '',
            name: '',
            link: '',
            username: '',
            subscribers: 0
        },

        initialize: function() {
            this.registerDecoders();
            this.registerRequests();
        },

        registerDecoders: function() {
            var self = this;

            amplify.request.decoders.userchannel = function(data, status, xhr, success, error) {
                if (status === 'success') {
                    self.trigger('user.channel.loaded', data);
                } else {
                    self.trigger('user.channel.error', xhr.responseText, xhr.status, xhr.statusText);
                }
            };
        },

        registerRequests: function() {
            amplify.request.define('user.channel', 'ajax', {
                url: 'http://www.youtube.com/channel/{channel}',
                data: {
                    channel: this.id
                },
                decoder: 'userchannel'
            });
        },

        load: function() {
            amplify.request('user.channel', {
                channel: this.get('channelId')
            });
        }    });
});