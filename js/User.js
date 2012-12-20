define(['jquery', 'backbone', 'amplify', 'Channel', 'Channels'], function($, Backbone, amplify, Channel, Channels) {
    "use strict";
    return Backbone.Model.extend({
        resourceId: 'user.profile',

        defaults: {
            key: 'default',
            author: '',
            title: '',
            linkedChannels: null, //Channels
            links: [],
            loaded: false,
            processed: false
        },

        load: function() {
            var self = this;
            amplify.request(this.resourceId, {
                user: this.id
            },function(data, status) {
                if (status === 'success') {
                    self.setUserProfile(data);
                } else {
                    self.trigger('user.profile.error', data, status);
                }
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
                    id: href.substr(href.lastIndexOf('/') + 1),
                    name: $link.text(),
                    link: href,
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