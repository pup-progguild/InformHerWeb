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
                views: {
                    'viewport': {
                        templateUrl: 'templates/pages/home.html'
                    }
                }
            })
            .state('login', {
                url: '/login',
                views: {
                    'viewport': {
                        templateUrl: 'templates/pages/login.html',
                        controller: 'LoginCtrl'
                    }
                }
            })
            .state('register', {
                url: '/register',
                views: {
                    'viewport': {
                        templateUrl: 'templates/pages/register.html',
                        controller: 'RegisterCtrl'
                    }
                }
            })
            .state('ask', {
                url: '/ask',
                abstract: true,
                views: {
                    'viewport': {
                        templateUrl: '',
                        controller: 'AskPostCtrl'
                    }
                }
            })
            .state('ask.post', {
                url: '/post',
                parent: 'ask',
                views: {
                    'viewport': {
                        templateUrl: 'templates/pages/ask.html',
                        controller: 'AskPostCtrl'
                    }
                }
            })
            .state('relate', {
                url: '/relate',
                abstract: true,
                views: {
                    'viewport': {
                        templateUrl: '',
                        controller: 'RelatePostCtrl'
                    }
                }
            })
            .state('relate.post', {
                url: '/post',
                parent: 'relate',
                views: {
                    'viewport': {
                        templateUrl: 'templates/pages/relate.html',
                        controller: 'RelatePostCtrl'
                    }
                }
            })
            .state('shoutout', {
                url: '/shoutout',
                abstract: true,
                views: {
                    'viewport': {
                        templateUrl: '',
                        controller: 'ShoutoutPostCtrl'
                    }
                }
            })
            .state('shoutout.post', {
                url: '/post',
                parent: 'shoutout',
                views: {
                    'viewport': {
                        templateUrl: 'templates/pages/shoutout.html',
                        controller: 'ShoutoutPostCtrl'
                    }
                }
            })
            .state('stream', {
                url: '/stream',
                views: {
                    'viewport': {
                        templateUrl: 'templates/pages/stream.html',
                        controller: 'StreamCtrl'
                    }
                }
            })
            .state('stream.view', {
                url: '/view/:postId',
                views: {
                    'viewport': {
                        templateUrl: 'templates/pages/post.html',
                        controller: 'StreamCtrl'
                    }
                }
            })
        ;

        $urlRouterProvider.otherwise('/home');
    });

