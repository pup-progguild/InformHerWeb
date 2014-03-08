
angular.module('informher', ['ionic', 'jmdobry.angular-cache', 'informher.services.auth', 'informher.services', 'informher.controllers', 'pascalprecht.translate', 'geolocation'])
    .controller('SessionCtrl', function($scope, $translate, PersistenceService, ModalService, UserService, LoadingService, MessageService, geolocation) {
        /* GLOBAL METHODS */

        $scope.setLanguage = function(lang) {
            $translate.use($scope.language = lang);
            PersistenceService.put('global', 'language', lang);
        };

        $scope.refreshLanguage = function() {
            $scope.language = PersistenceService.get('global', 'language');
            $translate.use($scope.language);
        };

        $scope.goBack = function() {
            history.back();
        };

        $scope.closeModal = function() {
            ModalService.closeModal();
        };

        $scope.updateCurrentUser = function() {
            $scope.currentUser = UserService.getCurrentUserProfile();
        };

        $scope.updateTracking = function() {
            //$scope.trackLocation = PersistenceService.get('global', 'track') == "true";
            PersistenceService.put('global', 'track', $scope.trackLocation);
        };

        $scope.toggleTracking = function() {
            $scope.trackLocation = !$scope.trackLocation;
            $scope.updateTracking();
            if($scope.trackLocation)
                $scope.getLocation();
        };

        $scope.retrieveTracking = function() {
            $scope.trackLocation = PersistenceService.get('global', 'track');
        };

        $scope.showLoading = function(message, backdrop) {
            LoadingService.showLoading(message, backdrop);
        };

        $scope.hideLoading = function() {
            LoadingService.hideLoading();
        };

        $scope.showScreenMessage = function(message, obstructive) {
            MessageService.screenMessage(message, obstructive);
        };

        $scope.getLocation = function() {
            geolocation.getLocation()
                .then(function(data){
                    $scope.currentUser.coords = {lat:data.coords.latitude, lon:data.coords.longitude};
                });
        };

        PersistenceService.clear('stream');
        PersistenceService.clear('admin');

        if(PersistenceService.get('global', 'language') === undefined) {
            PersistenceService.put('global', 'language', $translate.preferredLanguage());
            PersistenceService.put('global', 'track', false);
            PersistenceService.put('global', 'auth', '');
            PersistenceService.put('global', 'remember', '');
            PersistenceService.put('global', 'current-user', null);
            $scope.setLanguage($translate.preferredLanguage());
        }

        // initialize persistence in app-wide vars
        $scope.updateCurrentUser();
        $scope.retrieveTracking();
        $scope.refreshLanguage();
        if($scope.trackLocation)
            $scope.getLocation();
    })
    .config(function($translateProvider) {
        $translateProvider
            .translations('en-PH', {
                _LANGUAGE_ID: 'English',
                _APP_ID: 'InformHer',

                LANGUAGE: 'Language',

                LOGIN: 'Login',
                LOGOUT: 'Logout',
                REGISTER: 'Register',

                USERNAME: 'Username',
                PASSWORD: 'Password',
                REMEMBER_ME: 'Remember me',
                FORGOT_PASSWORD: 'Forgot password?',

                YOU: 'You',

                TERMS_OF_USE_PRE: "I agree to InformHer's ",
                TERMS_OF_USE: "terms of use",
                TERMS_OF_USE_POST: ".",

                BACK: 'Back',

                SEARCH: 'Search',
                ASK: 'Ask',
                RELATE: 'Relate',
                SHOUTOUT: 'Shoutout',

                TITLE: 'Title',
                AUTHOR: 'Author',
                DATE: 'Date',

                POST: 'Post',
                VIEW: 'View',

                COMMENTS: 'Comments',
                TAP_TO_BEGIN_WRITING: 'Tap to begin writing',

                LIKE: 'Like',
                EDIT: 'Edit',

                EMAIL_ADDRESS: 'E-mail address',
                CONFIRM_PASSWORD: 'Confirm password',

                VIEWING_PROFILE: 'Viewing profile',
                REGISTERED: 'Registered',
                BADGE: 'Badge',
                BIO: 'Bio',
                TELL_SOMETHING_ABOUT_YOUR_LIFE: 'Tell something about your life',

                CONTACT_INFORMATION: 'Contact Information',
                FACEBOOK_URL: 'Facebook URL',
                TWITTER_HANDLE: 'Twitter handle',
                WEBSITE_URL: 'Website URL',
                SAVE: 'Save',
                CANCEL: 'Cancel',

                SETTINGS: 'Settings',
                ACCOUNT: 'Account',
                TRACK_MY_LOCATION: 'Track my location',

                STREAM: 'Stream',
                DEFAULT_SORT: 'Default sort',

                TITLE_ASCENDING: 'Title, ascending',
                TITLE_DESCENDING: 'Title, descending',
                AUTHOR_ASCENDING: 'Author, ascending',
                AUTHOR_DESCENDING: 'Author, descending',
                DATE_RECENT: 'Date, recent',
                DATE_OLDER: 'Date, older',

                TERMS_OF_SERVICE: 'Terms of Service',

                TAGS: 'Tags',
                TAG: 'Tag',

                CONTENT: 'Content',
                TYPE_YOUR_QUESTION_HERE: 'Type your question here',

                SUBMIT: 'Submit',
                ANYTHING_YOU_WANT_TO_SHARE_HERE: 'Type anything you want to share here',
                NATURE_OF_YOUR_REPORT: 'Describe the nature of your report',
                KNOW_MY_CURRENT_LOCATION: 'I want InformHer to know my current location',
                CONTACT_ME: 'I want InformHer to get in touch regarding my report',
                CONTACT_ME_IMMEDIATELY: 'I want InformHer to contact me immediately',

                SEARCH_IN: 'Search in...',
                DATE_RANGE: 'Date Range',
                DATE_FROM: 'From',
                DATE_TO: 'To',

                MOBILE: 'Mobile',
                HELP: 'Help',

                POSTS: 'Posts',
                LIKES: 'Likes',

                LOGGING_IN: 'Logging in...Please wait.',
                REGISTERING: 'Processing your registration...Please wait.',
                LOGGING_OUT: 'Logging out...Please wait.',

                USER_LOGIN_SUCCESS: 'Welcome!',
                USER_LOGGED_OUT_SUCCESS: 'You are now logged out of InformHer.',

                POST_ADD: 'Creating post...Please wait.',
                POST_ADD_SUCCESSFUL: 'Post created successfully!',
                POST_ADD_FAILED: 'Post creation failed.',
                POST_UPDATE: 'Editing post...Please wait.',
                POST_UPDATE_SUCCESSFUL: 'Post edited successfully!',
                POST_UPDATE_FAILED: 'Editing post failed.',
                POST_SHOW_UNAPPROVED_SUCCESSFUL: 'Unapproved posts shown.',

                USER_PROFILE_UPDATE_SUCCESSFUL: 'Profile edited successfully!',


                ERR_INVALID_USERNAME: 'Invalid username.',
                ERR_INVALID_EMAIL_ADDRESS: 'Invalid e-mail address.',
                ERR_SHORT_PASSWORD: 'Password cannot be shorter than 6 characters.',
                ERR_PASSWORDS_DO_NOT_MATCH: 'Passwords do not match.',
                ERR_CONNECTIVITY: 'The app cannot communicate with InformHer\'s servers right now. Please try again later.',

                NEW_POST: 'New Post',
                FILTER: 'Filter',
                SEARCH_RESULTS: 'Search Results',
                APPROVE: 'Approve',

                GEOLOCATION: 'Geolocation',
                CURRENT_LOCATION: 'Current location'
            })
            .translations('tl-PH', {
                _LANGUAGE_ID: 'Tagalog',
                _APP_ID: 'InformHer',

                LANGUAGE: 'Wika',

                LOGIN: 'Mag-login',
                LOGOUT: 'Mag-logout',
                REGISTER: 'Mag-rehistro',

                USERNAME: 'Username',
                PASSWORD: 'Password',
                REMEMBER_ME: 'Tandaan ako',
                FORGOT_PASSWORD: 'Nakalimutan ang password?',

                YOU: 'Ikaw',

                TERMS_OF_USE_PRE: "Sang-ayon ako sa ",
                TERMS_OF_USE: "nakatakdang kasulatan ukol sa paggamit",
                TERMS_OF_USE_POST: " ng InformHer.",

                BACK: 'Bumalik',

                SEARCH: 'Maghanap',
                ASK: 'Magtanong',
                RELATE: 'Ibahagi',
                SHOUTOUT: 'Shoutout',

                TITLE: 'Pamagat',
                AUTHOR: 'May-akda',
                DATE: 'Petsa',

                POST: 'Post',
                VIEW: 'Tingnan',

                COMMENTS: 'Mga Pahayag',
                TAP_TO_BEGIN_WRITING: 'Pindutin at magsimulang mag-type',

                LIKE: 'Like',
                EDIT: 'Baguhin',

                EMAIL_ADDRESS: 'E-mail address',
                CONFIRM_PASSWORD: 'Ikumpirma ang password',

                VIEWING_PROFILE: 'Tinitingnan ang profile',
                REGISTERED: 'Nag-rehistro noong',
                BADGE: 'Tsapa',
                BIO: 'Bio',
                TELL_SOMETHING_ABOUT_YOUR_LIFE: 'Magsulat ng tungkol sa iyong buhay',

                CONTACT_INFORMATION: 'Pakikipag-ugnayan',
                FACEBOOK_URL: 'Facebook URL',
                TWITTER_HANDLE: 'Twitter handle',
                WEBSITE_URL: 'Website URL',
                SAVE: 'I-save',
                CANCEL: 'Kanselahin',

                SETTINGS: 'Mga setting',
                ACCOUNT: 'Account',
                TRACK_MY_LOCATION: 'Tiyakin ang aking lokasyon',

                STREAM: 'Stream',
                DEFAULT_SORT: 'Default na pag-aayos',

                TITLE_ASCENDING: 'Pamagat, ascending',
                TITLE_DESCENDING: 'Pamagat, descending',
                AUTHOR_ASCENDING: 'May-akda, ascending',
                AUTHOR_DESCENDING: 'May-akda, descending',
                DATE_RECENT: 'Petsa, mas bago',
                DATE_OLDER: 'Petsa, mas luma',

                TERMS_OF_SERVICE: 'Mga Tuntunin ng Serbisyo',

                TAGS: 'Mga tag',
                TAG: 'Tag',

                CONTENT: 'Nilalaman',
                TYPE_YOUR_QUESTION_HERE: 'I-type ang iyong katanungan dito',

                SUBMIT: 'Ipasa',
                ANYTHING_YOU_WANT_TO_SHARE_HERE: 'I-type ang anumang nais mong ibahagi dito',
                NATURE_OF_YOUR_REPORT: 'Ilarawan ang detalye ng iyong kaso',
                KNOW_MY_CURRENT_LOCATION: 'Nais kong matiyak ng InformHer ang aking lokasyon',
                CONTACT_ME: 'Nais kong makipag-ugnayan ang mga kinauukulan sa InformHer sa akin ukol sa aking kaso',
                CONTACT_ME_IMMEDIATELY: 'Nais kong makipag-ugnayan ang mga kinauukulan sa InformHer sa akin agad-agad',

                SEARCH_IN: 'Maghanap sa...',
                DATE_RANGE: 'Sakop ng Petsa',
                DATE_FROM: 'Mula',
                DATE_TO: 'Hanggang',

                MOBILE: 'Mobile',
                HELP: 'Tulong',

                POSTS: 'Mga Post',
                LIKES: 'Mga Like',

                LOGGING_IN: 'Nagla-log in...Sandali lang.',
                REGISTERING: 'Pinoproseso ang iyong pagrerehistro...Sandali lang.',
                LOGGING_OUT: 'Nagla-log out...Sandali lang.',

                USER_LOGIN_SUCCESS: 'Maligayang Pagdating!',
                USER_LOGGED_OUT_SUCCESS: 'Ikaw ay naka-log out na ng InformHer.',

                ERR_INVALID_USERNAME: 'Imbalidong username.',
                ERR_INVALID_EMAIL_ADDRESS: 'Imbalidong e-mail address.',
                ERR_SHORT_PASSWORD: 'Hindi pwedeng mas maikli sa 6 na simbolo ang password.',
                ERR_PASSWORDS_DO_NOT_MATCH: 'Hundi tugma ang mga password.',
                ERR_CONNECTIVITY: 'Kasalukuyang hindi makakonekta ang app sa mga server ng InformHer. Subukan muli mamaya.',

                NEW_POST: 'Bagong Post',
                FILTER: 'Salain',
                SEARCH_RESULTS: 'Resulta ng Paghahanap',

                APPROVE: 'Mag-apruba',
                GEOLOCATION: 'Geolocation',

                CURRENT_LOCATION: 'Kasalukuyang lokasyon'
            })
            .preferredLanguage('en-PH')
            .fallbackLanguage('en-PH');
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
            .state('settings.main', {
                url: '/main',
                templateUrl: 'menus/settings.html',
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

