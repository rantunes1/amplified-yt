define(['jquery', 'backbone', 'd3', 'User', 'Channels'], function($, Backbone, d3, User, Channels) {
    "use strict";
    return Backbone.View.extend({
        width: '100%',
        height: 500,

        container: d3.select('section#content').append('svg'),

        initialize: function() {
            this.collection.on('user.profile.loaded', this.render, this);

            this.container.attr('width', this.width).attr('height', this.height);

        },

        render: function() {
            console.log('rendering users : %o',this.collection.models);
            var linkedChannels = new Channels(), nextLinkedChannelUser = null;

            this.collection.each(function(user, index){
                var userLinkedChannels = user.get('linkedChannels');
                //merge channels from all users
                linkedChannels.add(userLinkedChannels.toJSON(),{silent:true});
            });

            //nextLinkedChannelUser = (this.collection.last().get('linkedChannels') || [''])[0];

            //@todo remove next if. testing only. use the above commented line
            nextLinkedChannelUser = linkedChannels.at(1);


            console.log('linkedChannels : %o', linkedChannels);
            console.log('nextLinkedChannelUser : %o', nextLinkedChannelUser);

            var content = this.container.selectAll('circle').data(linkedChannels.models, function(linkedChannel, index) {
                return linkedChannel.get('username');
                //username is used as key for the data
            });

            content.enter().append('circle').attr('cx', function(d, i) {
                return parseInt(300 * Math.random(), 10) + i * 30;
            }).attr('cy', function(d, i) {
                return 100 + i * 30;
            }).attr('r', function(d, i) {
                return parseInt(d.get('subscribers').replace(',', ''),10) / 1000;
            }).style("fill", function(d, i) {
                return 'rgb(' + parseInt(255 - 100 * Math.random(),10) + ',' + parseInt(255 - 100 * Math.random(),10) + ',' + parseInt(255 - 100 * Math.random(),10) + ')';
            });

            console.warn('adding user %o - %o', nextLinkedChannelUser, this.collection.length);
            if(nextLinkedChannelUser){
                var nextUser = new User({
                    id : nextLinkedChannelUser.get('username')
                });
                this.collection.add(nextUser);
                if(this.collection.length === 2){
                    console.log('calling next profile');
                    nextUser.load();
                }

            }

            return this;
        }
    });
});