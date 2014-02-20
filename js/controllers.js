angular.module('informher.controllers', [])
    .controller('LoginCtrl', function($scope, $state, $http) {

        /* -------- *
         *  FIELDS  *
         * -------- */

        $scope.user = {
            name: '',
            pass: '',
            remember: false
        };

        /* --------- *
         *  METHODS  *
         * --------- */

        $scope.messageClass = 'card hidden';

        $scope.hideMessage = function() {
            $scope.messageClass = 'card hidden';
        };

        $scope.displayMessage = function(message, title, messageType) {
            $scope.messageClass = 'card';
            $scope.message = message;
            $scope.messageTitle = title;
            $scope.messageType = messageType;
        };

        $scope.submit = function() {
            $scope.hideMessage();
            $http.post('http://192.168.7.5/InformHerAPI/wwwroot/user/login', {
                    'username': $scope.user.name,
                    'password': $scope.user.pass
                }
            )
                .success(function() {
                    $state.go('stream');
                })
                .error(function(data) {
                    switch(data.status) {
                        case "USER_LOGIN_FAILED":
                            $scope.displayMessage(data.description, data.status, "Error");
                    }
                    console.log(data);
                });
        };
    })

    .controller('RegisterCtrl', function($scope, $ionicModal, $http) {

        /* -------- *
         *  FIELDS  *
         * -------- */

        /*
        $scope.username = 'ichi-san';
        $scope.email = 'ichi-san@example.com';
        $scope.password = 'one_one_one';
        $scope.passwordAgain = 'one_one_one';
        $scope.agree = false;
        */

        /* --------- *
         *  METHODS  *
         * --------- */

        $scope.canRegister = function() {
            return ($scope.username != '')
                && ($scope.email != '')
                && ($scope.acceptPassword($scope.password))
                && ($scope.password == $scope.passwordAgain)
                && ($scope.agree);
        };

        $scope.acceptPassword = function() {
            return ('' + $scope.password).length > 6;
        };

        $scope.submit = function() {
            $http.post('http://192.168.7.5/InformHerAPI/wwwroot/index.php/user/login', {
                    'username': $scope.username,
                    'email': $scope.email,
                    'password': $scope.password
                }
            )
        };

        /* -------- *
         *  MODALS  *
         * -------- */

        $ionicModal.fromTemplateUrl('eula.html', function(modal) {
            $scope.modal = modal;
        }, {
            scope: $scope,
            animation: 'slide-in-up'
        });

        $scope.openModal = function() {
            $scope.modal.show();
        };

        $scope.closeModal = function() {
            $scope.modal.hide();
        };
    })

// A simple controller that fetches a list of data from a service
    .controller('StreamCtrl', function ($scope, $stateParams, $ionicActionSheet, $ionicModal, PostService, TagService) {
        // "Pets" is a service returning mock data (services.js)
        $scope.posts = [];// = PostService.all();

        $scope.postType = 'ask';

        $scope.title = 'hello'; // not for shoutout
        $scope.tags = ['tag1', 'tag2', 'tag3'];
        $scope.content = 'Question'; // not for shoutout

        $scope.trackLocation = false; // for shoutout only
        $scope.contact = false; // for shoutout only
        $scope.immediateContact = false; // for shoutout only

        $scope.criteria = { ask: true, relate: true, shoutout: true };
        $scope.sortAscending = { title: false, author: false, date: false };
        $scope.currentSort = 'date';

        $scope.onRefresh = function() {
            console.log('Refresh complete!');
            $scope.posts = PostService.all();
            $scope.$broadcast('scroll.refreshComplete');
        };

        $scope.colorForTag = function(tag) {
            return TagService.colorForTag(tag);
        };

        $scope.filter = function() {
            $scope.posts = PostService.filter($scope.criteria);
        };

        $scope.get = function(id) {
            PostService.get(id);
        };

        $scope.submit = function() {

        };

        /* -------- *
         *  MODALS  *
         * -------- */

        $scope.modalUrls = ['ask.html', 'relate.html', 'shoutout.html'];
        $scope.currentModal = '';
        $scope.modals = [];

        _.each($scope.modalUrls, function(templateUrl) {
            $ionicModal.fromTemplateUrl(templateUrl, function(modal) { $scope.modals[templateUrl] = modal; },
                {
                    scope: $scope,
                    animation: 'slide-in-up'
                });
        });

        $scope.openModal = function(name) {
            $scope.currentModal = name;
            $scope.modals[name].show();
        };

        $scope.closeModal = function() {
            $scope.modals[$scope.currentModal].hide();
            $scope.currentModal = '';
        };

        /* --------------- *
         *  ACTION SHEETS  *
         * --------------- */

        $scope.showMenu = function(mode) {
            var categories = ['ask', 'relate', 'shoutout'];
            var modes = {
                'new-post': {
                    buttons: [
                        { text: 'Ask' },
                        { text: 'Relate' },
                        { text: 'Shoutout' }
                    ],
                    titleText: 'New Post',
                    cancelText: 'Cancel',
                    cancel: function() {},
                    buttonClicked: function(index) {
                        var postType = categories[index];
                        $scope.postType = postType;
                        $scope.openModal(postType + '.html');
                        return true;
                    }
                },
                'sort': {
                    buttons: [
                        { text: ($scope.currentSort == 'title' ? '-> ' : '') + 'Title' + ($scope.currentSort == 'title' ? ': ' + ($scope.sortAscending['title'] ? 'Ascending' : 'Descending') : '') },
                        { text: ($scope.currentSort == 'author' ? '-> ' : '') + 'Author' + ($scope.currentSort == 'author' ? ': ' + ($scope.sortAscending['author'] ? 'Ascending' : 'Descending') : '') },
                        { text: ($scope.currentSort == 'date' ? '-> ' : '') + 'Date' + ($scope.currentSort == 'date' ? ': ' + ($scope.sortAscending['date'] ? 'Ascending' : 'Descending') : '') }
                    ],
                    titleText: 'Sort',
                    cancelText: 'Cancel',
                    cancel: function() {},
                    buttonClicked: function(index) {
                        var sorts = ['title', 'author', 'date'];
                        if($scope.currentSort != sorts[index])
                            $scope.sortAscending = { title: false, author: false, date: false };
                        $scope.currentSort = sorts[index];
                        $scope.sortAscending[$scope.currentSort] = !$scope.sortAscending[$scope.currentSort];
                        return $scope.showMenu('sort');
                    }
                },
                'filter': {
                    buttons: [
                        { text: 'Ask: ' + ($scope.criteria.ask ? 'SHOW' : 'HIDE') },
                        { text: 'Relate: ' + ($scope.criteria.relate ? 'SHOW' : 'HIDE') },
                        { text: 'Shoutout: ' + ($scope.criteria.shoutout ? 'SHOW' : 'HIDE') }
                    ],
                    titleText: 'Filter',
                    cancelText: 'Close',
                    cancel: function() {},
                    buttonClicked: function(index) {
                        switch(index) {
                            case 0:
                                $scope.criteria.ask = !$scope.criteria.ask;
                                break;
                            case 1:
                                $scope.criteria.relate = !$scope.criteria.relate;
                                break;
                            case 2:
                                $scope.criteria.shoutout = !$scope.criteria.shoutout;
                                break;
                        }
                        $scope.filter();
                        return $scope.showMenu('filter');
                    }
                }
            };

            $ionicActionSheet.show(modes[mode]);

            return true;
        };

        /* ---------------- *
         *  DEFAULT METHOD  *
         * ---------------- */

        $scope.filter($scope.criteria);
    })

// A simple controller that shows a tapped item's data
    .controller('PostCtrl', function ($scope, $stateParams, PostService) {
        // "Pets" is a service returning mock data (services.js)
        $scope.post = PostService.get($stateParams.postId);

        $scope.formatDate = function(date) {
            return new Date(date).toString();
        };

        $scope.goBack = function() {

        };
    });
