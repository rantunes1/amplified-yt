define(['jquery', 'underscore', 'backbone', 'd3', 'User', 'Channels'], function($, _, Backbone, d3, User, Channels) {
    "use strict";
    return Backbone.View.extend({
        width: 960,
        height: 500,

        svg: d3.select('section#content').append('svg'),

        force: null,
        nodes: [],
        links: [],

        initialize: function() {
            var self = this;
            this.collection.on('user.profile.loaded', function(){
                this.render();
            }, this);

            this.svg.attr('width', this.width).attr('height', this.height);

            this.force = d3.layout.force()
                .size([this.width, this.height])
                .charge(-500)
                .linkDistance(150);
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
                            users.remove(loadedUser, {silent:true});
                        }else{
                            return true;
                        }
                    }
                }, this);
            }
            return nextUserId;
        },

        render: function() {
            var self = this;

            var users = this.collection;
            this.nodes = [];
            this.links = [];
            users.each(function(user, uid){
                user.x = user.x || Math.floor(Math.random() * self.width);
                user.y = user.y || Math.floor(Math.random() * self.height);
                if(user.has('linkedChannels')){
                    user.get('linkedChannels').each(function(linkedChannel){
                        var target = users.get(linkedChannel.id);
                        if(target){
                            self.links.push({
                                source: user,
                                target: target
                            });
                        }
                    });
                }
                self.nodes.push(user);
            });

            this.force
                .nodes(this.nodes)
                .links(this.links);

            var node = this.svg.selectAll('circle.node')
                .data(this.force.nodes(), function(user, index) {
                    return user.id;
                });

            var nodeEnter = node.enter()
                .append('circle')
                .attr('class', 'node')
                .attr('id', function(d, i){
                    return d.id;
                })
                .attr('r', function(d, i) {
                    return Math.max((d.get('linkedChannels') || []).length, 5);
                })
                .style("fill", function(d, i) {
                    return 'rgb(' + parseInt(255 - 100 * Math.random(),10) + ',' + parseInt(255 - 100 * Math.random(),10) + ',' + parseInt(255 - 100 * Math.random(),10) + ')';
                });

            nodeEnter.append('title').text(function(d) { return d.id; });
            nodeEnter.call(this.force.drag);

            node.exit().remove();

            var link = this.svg.selectAll('line.link')
                .data(this.force.links(), function(link, index) {
                    return link.source.id + '-' + link.target.id;
                });

            link.enter().append('line').attr('class', 'link');
            link.exit().remove();

            this.force.on('tick', function() {
                node
                    .attr("cx", function(d) {
                        return d.x;
                    })
                    .attr("cy", function(d) {
                        return d.y;
                    });

                link
                    .attr("x1", function(d) {
                        return d.source.x;
                    })
                    .attr("y1", function(d) {
                        return d.source.y;
                    })
                    .attr("x2", function(d) {
                        return d.target.x;
                    })
                    .attr("y2", function(d) {
                        return d.target.y;
                    });
            });

            this.force.start();

            var nextUserId = this.getNextUserId();

            console.warn('next user id : %o', nextUserId);

            if(nextUserId){
                var nextUser = new User({
                    id : nextUserId
                });

                var users = this.collection;
                users.add(nextUser);

                if(users.length <= 15){
                    console.log('calling next profile %o', nextUser );
                    nextUser.load();

                }else{
                    users.remove(nextUser);
                }
            }

            return this;
        }
    });
});