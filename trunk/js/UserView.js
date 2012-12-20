define(['jquery', 'underscore', 'backbone', 'd3', 'User', 'Channels'], function($, _, Backbone, d3, User, Channels) {
    "use strict";
    return Backbone.View.extend({
        width: '100%',
        height: 500,

        container: d3.select('section#content').append('svg'),

        initialize: function() {
            this.collection.on('user.profile.loaded', this.render, this);

            this.container.attr('width', this.width).attr('height', this.height);

        },

        getNextUserId: function(){
            var
                nextUserId = null,

                users = this.collection,

                loadedUsers = users.where({
                    loaded: true,
                    processed: false
                });

            if(loadedUsers.length){
                _.find(loadedUsers, function(loadedUser){
                    if(loadedUser.has('linkedChannels')){
                        var linkedChannels = loadedUser.get('linkedChannels');
                        linkedChannels.find(function(linkedChannel){
                            var user = users.where({
                                id: linkedChannel.id
                            });
                            if(!user.length){
                              nextUserId = linkedChannel.id;
                              return true;
                            }
                        }, this);
                        if(!nextUserId){
                            loadedUser.set('processed', true);
                            loadedUsers.remove(loadedUser, {silent:true});
                        }else{
                            return true;
                        }
                    }
                }, this);
            }
            return nextUserId;
        },

        render: function() {
            console.log('rendering users : %o',this.collection.models);
            var
                linkedChannels = new Channels(),
                nextUserId = null;

            this.collection.each(function(user, index){
                var userLinkedChannels = user.get('linkedChannels');
                //merge channels from all users
                linkedChannels.add(userLinkedChannels.toJSON(),{silent:true});
            });

            nextUserId = this.getNextUserId();
            console.warn('next user id : %o', nextUserId);

            var content = this.container.selectAll('circle').data(linkedChannels.models, function(linkedChannel, index) {
                return linkedChannel.id;
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

            if(nextUserId){
                var nextUser = new User({
                    id : nextUserId
                });
                console.warn('adding user %o - %o', nextUser, this.collection.length);
                this.collection.add(nextUser);
                if(this.collection.length <= 7){
                    console.log('calling next profile');
                    nextUser.load();
                }
            }

            return this;
        }
    });
});