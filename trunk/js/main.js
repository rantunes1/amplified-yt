require.config({
    baseUrl : 'js',
    paths : {
        'jquery' : 'lib/jquery-1.8.3/jquery',

        'underscore' : 'lib/underscore-1.4.3/underscore',
        'backbone' : 'lib/backbone-0.9.2/backbone',

        'amplify' : 'lib/amplify-1.1.0/amplify',

        'jq.xdomainajax' : 'lib/jq.xdomainajax-0.11/jquery.xdomainajax',

        'd3' : 'lib/d3-2.10.3/d3.v2'
    },
    shim : {
        'underscore' : {
            exports : '_'
        },
        'backbone' : {
            deps : ['jquery', 'underscore'],
            exports : 'Backbone'
        },
        'amplify' : {
            deps : ['jquery'],
            exports : 'amplify'
        },
        'jq.xdomainajax' : ['jquery'],
        'd3' : {
            exports : 'd3'
        }
    }
});

require(['jquery', 'amplify', 'requests', 'd3', 'jq.xdomainajax'], function($, amplify, requests, d3) {
    requests();

    amplify.subscribe('user.profile.success', function(user) {
        var channel = user.channel.substr(user.channel.lastIndexOf('/') + 1);

        console.warn('user    : %o', user);
        console.warn('channel : %o', channel);

        amplify.request('user.channel', {
            channel : channel
        });    });

    amplify.subscribe('user.profile.error', function(error, status, statusText) {
        console.warn('ERROR: %o - %o - %o', error, status, statusText);
    });

    amplify.subscribe('user.channel.success', function(channel) {
        var $channelPage = $('<div/>').html(channel);
        var $connnectedChannelsList = $channelPage.find('.channel-summary-list');
        
        var linkedChannels = []
        $connnectedChannelsList.find('li').each(function() {
            var $link = $(this).find('.yt-uix-tile-link');
            var href =  $link.attr('href');
            linkedChannels.push({
                name: $link.text(),
                link: href,
                username: href.substr(href.lastIndexOf('/') + 1),
                subscribers: $(this).find('.subscriber-count').find('strong').text()
            });

            //amplify.request('user.profile', {
            //    user : username
            //});
        });
        $channelPage.remove();
        
        console.log('linkedChannels : %o', linkedChannels);
        
        // var content = d3.select('body').select('section#content').selectAll('div')
            // .data(linkedChannels, function(linkedChannel, index){
                // return linkedChannel.username; //username is used as key for the data
            // });        
        // var div = content.enter().append('div');        
        // div.append('a').attr('href', function(d){return d.link}).text(function(d){return d.name});
        
        var width = 1500, height = 500, margin = 50;

        var svg = d3.select('section#content').append('svg').attr('width',width).attr('height',height);
        var content = svg.selectAll('circle')
            .data(linkedChannels, function(linkedChannel, index){
                return linkedChannel.username; //username is used as key for the data
            });        
        var user = content.enter().append('circle')
            .attr('cx', function(d,i){return parseInt(300*Math.random())+i*30})
            .attr('cy', function(d,i){return 100+i*30})
            .attr('r', function(d,i){return parseInt(d.subscribers.replace(',',''))/1000})
            .style("fill", function(d,i){
                return 'rgb(' + parseInt(255-100*Math.random()) + ',' + parseInt(255-100*Math.random()) + ','+ parseInt(255-100*Math.random()) +')';
            });

        
        console.log('content d3 : %o', content);
    });

    amplify.subscribe('user.channel.error', function(error, status, statusText) {
        console.warn('ERROR: %o - %o - %o', error, status, statusText);
    });

    amplify.request('user.profile', {
        user : 'showaleitao'
    });

});
