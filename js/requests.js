define([
    'jquery',
    'amplify'
], 
function ($, amplify) {
    return function(){
        var baseURL = 'http://gdata.youtube.com/feeds/api';
           
        amplify.request.decoders.userprofile = function ( data, status, xhr, success, error ) {
            if ( status === 'success' ) {
                console.warn('DATA: %o', data);
                var entry = data.entry;
                var links = entry.link;
                var channel;
                $.each(links || [], function(index, link){
                    if(link.rel === 'alternate'){
                        channel = link.href;
                        return false;
                    }
                })
                var user = {
                    id: entry.id.$t,
                    author: entry.author[0].name.$t,
                    title: entry.title.$t,
                    channel: channel,
                    links: entry.gd$feedLink //@todo remove  used for testing d3 only
                }
                amplify.publish('user.profile.success', user);
            } else {
                amplify.publish('user.profile.error', xhr.responseText, xhr.status, xhr.statusText);
            } 
        };
        
        amplify.request.decoders.userchannel = function ( data, status, xhr, success, error ) {
            if ( status === 'success' ) {
                amplify.publish('user.channel.success', data.responseText);
            } else {
                amplify.publish('user.channel.error', xhr.responseText, xhr.status, xhr.statusText);
            } 
        };
        
        amplify.request.define('user.profile', 'ajax',{
            url: baseURL + '/users/{user}?alt=json',
            dataType: 'json',
            data:{
                user: 'default'
            },
            decoder: 'userprofile'
        });
        
        amplify.request.define('user.channel', 'ajax',{
            url: 'http://www.youtube.com/channel/{channel}',
            data:{
                channel: ''
            },
            decoder: 'userchannel' 
        });
        
    }
});
