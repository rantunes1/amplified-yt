define(['amplify'], function(amplify) {"use strict";

    var register = function() {
        amplify.request.define('user.profile', 'ajax', {
            url: 'http://gdata.youtube.com/feeds/api/users/{user}?alt=json',
            dataType: 'json',
            data: {
                user: 'default'
            }
        });

        amplify.request.define('user.channel', 'ajax', {
            url: 'http://www.youtube.com/channel/{channel}',
            data: {
                channel: ''
            }
        });
    };

    return {
        register: register
    };
});
