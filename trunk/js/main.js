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

require(['requests', 'User', 'Users', 'UserView'], function(Requests, User, Users, UserView) {
    "use strict";

    Requests.register();

    var firstUser = new User({
        id : 'showaleitao'
    });

    var users = new Users([firstUser]);

    new UserView({
        collection: users
    });

    firstUser.load();
});
