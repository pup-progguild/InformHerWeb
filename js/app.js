// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('informher', ['ionic', 'informher.services', 'informher.controllers'])


    .config(function ($stateProvider, $urlRouterProvider) {

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js

        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: 'templates/pages/home.html'
            })
            .state('login', {
                url: '/login',
                templateUrl: 'templates/pages/login.html',
                controller: 'LoginCtrl'
            })
            .state('register', {
                url: '/register',
                templateUrl: 'templates/pages/register.html',
                controller: 'RegisterCtrl'
            })
            .state('stream', {
                url: '/stream',
                templateUrl: 'templates/pages/stream.html',
                controller: 'StreamCtrl'
            })
            .state('stream.view', {
                url: '/view/:postId',
                templateUrl: 'templates/pages/post.html',
                controller: 'StreamCtrl'
            })
            /*
            .state('profile', {
                url: '/profile',
                abstract: true,
                templateUrl: '',
                controller: 'ProfileCtrl'
            })
            .state('profile.view', {
                url: '/view/:userId',
                templateUrl: 'template/pages/profile-view.html',
                controller: 'ProfileCtrl'
            })
            .state('profile.edit', {
                url: '/edit',
                templateUrl: 'template/pages/profile-edit.html',
                controller: 'ProfileCtrl'
            })
            */
            .state('ask', {
                url: '/ask',
                abstract: true,
                templateUrl: '',
                controller: 'AskPostCtrl'
            })
            .state('ask.post', {
                url: '/post',
                parent: 'ask',
                templateUrl: 'templates/pages/ask.html',
                controller: 'AskPostCtrl'
            })
            .state('relate', {
                url: '/relate',
                abstract: true,
                templateUrl: '',
                controller: 'RelatePostCtrl'
            })
            .state('relate.post', {
                url: '/post',
                parent: 'relate',
                templateUrl: 'templates/pages/relate.html',
                controller: 'RelatePostCtrl'
            })
            .state('shoutout', {
                url: '/shoutout',
                abstract: true,
                templateUrl: '',
                controller: 'ShoutoutPostCtrl'
            })
            .state('shoutout.post', {
                url: '/post',
                parent: 'shoutout',
                templateUrl: 'templates/pages/shoutout.html',
                controller: 'ShoutoutPostCtrl'
            })
        ;

        $urlRouterProvider.otherwise('/home');
    });

