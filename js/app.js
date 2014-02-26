// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('informher', ['ionic', 'informher.services', 'informher.controllers', 'pascalprecht.translate'])
    .controller('SessionCtrl', function($translate, $scope, UserService) {
        $scope.setLanguage = function(lang) {
            $translate.use(lang);
        };
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
        ;
        $urlRouterProvider.otherwise('/home');
    });

