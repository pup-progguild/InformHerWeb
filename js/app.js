// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('informher', ['ionic', 'informher.services', 'informher.controllers', 'pascalprecht.translate'])
    .controller('SessionCtrl', function($translate, $scope, UserService) {
        $scope.setLanguage = function(lang) {
            $translate.use($scope.language = lang);
        };

        $scope.goBack = function() {
            history.back();
        };

        $scope.setLanguage($translate.preferredLanguage());
    })
    .config(function($translateProvider) {
        $translateProvider
            .translations('en-PH', {
                _LANGUAGE: 'English',
                _APP_ID: 'InformHer',

                LOGIN: 'Login',
                LOGOUT: 'Logout',
                REGISTER: 'Register',

                USERNAME: 'Username',
                PASSWORD: 'Password',
                REMEMBER_ME: 'Remember me',
                FORGOT_PASSWORD: 'Forgot password?',

                TERMS_OF_USE_PRE: "I agree to InformHer's ",
                TERMS_OF_USE: "terms of use",
                TERMS_OF_USE_POST: ".",

                BACK: 'Back',

                SEARCH: 'Search',
                ASK: 'Ask',
                RELATE: 'Relate',
                SHOUTOUT: 'Shoutout'
            })
            .translations('tl-PH', {
                _LANGUAGE: 'Tagalog',
                _APP_ID: 'InformHer',

                LOGIN: 'Mag-login',
                LOGOUT: 'Mag-logout',
                REGISTER: 'Mag-rehistro',

                USERNAME: 'Username',
                PASSWORD: 'Password',
                REMEMBER_ME: 'Tandaan ako',
                FORGOT_PASSWORD: 'Nakalimutan ang password?',

                TERMS_OF_USE_PRE: "Sang-ayon ako sa ",
                TERMS_OF_USE: "terms of use",
                TERMS_OF_USE_POST: " ng InformHer.",

                BACK: 'Bumalik',

                SEARCH: 'Maghanap',
                ASK: 'Magtanong',
                RELATE: 'Ibahagi',
                SHOUTOUT: 'Shoutout'
            })
            .preferredLanguage('en-PH');
    })

    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: 'pages/home.html'
            })
            .state('auth', {
                url: '/auth',
                abstract: true,
                templateUrl: ''
            })
            .state('auth.login', {
                url: '/login',
                templateUrl: 'pages/auth/login.html',
                controller: 'AuthCtrl'
            })
            .state('auth.register', {
                url: '/register',
                templateUrl: 'pages/auth/register.html',
                controller: 'AuthCtrl'
            })
            .state('stream', {
                url: '/stream',
                abstract: true,
                templateUrl: ''
            })
            .state('stream.feed', {
                url: '/feed',
                templateUrl: 'pages/stream.html',
                controller: 'StreamCtrl'
            })
            .state('stream.view', {
                url: '/view/:postId',
                templateUrl: 'pages/post.html',
                controller: 'PostCtrl'
            })
            .state('profile', {
                url: '/profile/:userId',
                templateUrl: 'pages/profile.html',
                controller: 'UserCtrl'
            })
            .state('settings', {
                url: '/settings',
                abstract: true,
                templateUrl: '',
                controller: 'SessionCtrl'
            })
            .state('settings.language', {
                url: '/language',
                templateUrl: 'menus/language.html',
                controller: 'SessionCtrl'
            })
        ;
        $urlRouterProvider.otherwise('/home');
    });

