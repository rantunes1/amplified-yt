define(['jquery', 'backbone', 'amplify', 'Channel', 'Channels'], function($, Backbone, amplify, Channel, Channels) {
    "use strict";
    return Backbone.Model.extend({

        baseURL: 'http://gdata.youtube.com/feeds/api',

        defaults: {
            key: 'default',
            author: '',
            title: '',
            linkedChannels: null, //Channels
            links: [],
            loaded: false
        },

        initialize: function() {
            this.registerDecoders();
            this.registerRequests();
        },

        registerDecoders: function() {
            var self = this;

            amplify.request.decoders.userprofile = function(data, status, xhr) {
                if (status === 'success') {
                    self.setUserProfile(data);
                } else {
                    self.trigger('user.profile.error', xhr.responseText, xhr.status, xhr.statusText);
                }
            };
        },

        registerRequests: function() {
            amplify.request.define('user.profile', 'ajax', {
                url: this.baseURL + '/users/{user}?alt=json',
                dataType: 'json',
                data: {
                    user: this.get('key')
                },
                decoder: 'userprofile'
            });
        },

        load: function() {
            amplify.request('user.profile', {
                user: this.id
            });
        },

        setUserProfile: function(data) {
            console.warn('DATA: %o', data);
            var entry = data.entry;
            var links = entry.link;
            var channel;
            $.each(links || [], function(index, link) {
                if (link.rel === 'alternate') {
                    channel = link.href;
                    return false;
                }
            });
            this.set('key', entry.id.$t);
            this.set('author', entry.author[0].name.$t);
            this.set('title', entry.title.$t);

            //@todo remove  used for testing d3 only
            this.set('links', entry.gd$feedLink);

            var userChannel = new Channel({
                id: channel ? channel.substr(channel.lastIndexOf('/') + 1) : '',
                url: channel
            });
            userChannel.on('user.channel.loaded', this.setUserLinkedChannels, this);
            userChannel.load();
        },

        setUserLinkedChannels: function(data){
            var channel = data.responseText;
            var $channelPage = $('<div/>').html(channel);
            var $connnectedChannelsList = $channelPage.find('.channel-summary-list');

            var linkedChannels = new Channels();
            $connnectedChannelsList.find('li').each(function() {
                var $link = $(this).find('.yt-uix-tile-link');
                var href = $link.attr('href');
                 var channel = new Channel({
                    name: $link.text(),
                    link: href,
                    username: href.substr(href.lastIndexOf('/') + 1),
                    subscribers: $(this).find('.subscriber-count').find('strong').text()
                });
                linkedChannels.add(channel);
            });
            $channelPage.remove();

            this.set('linkedChannels', linkedChannels);
            this.set('loaded', true);
            this.trigger('user.profile.loaded');

        }
    });
});