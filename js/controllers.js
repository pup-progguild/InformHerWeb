angular.module('informher.controllers', [])
    .controller('LoginCtrl', function($translate, $scope, $state, $http) {

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

    .controller('ProfileCtrl', function($scope, $state, $stateParams, SessionService) {
        $scope.user = SessionService.user;

        $scope.backBtnText = 'Back';
        $scope.backBtnHref = '#/stream';
        $scope.primaryBtnText = 'Edit';

        $scope.editMode = false;

        $scope.repaint = function() {
            $scope.backBtnText = $scope.editMode ? 'Cancel' : 'Back';
            $scope.backBtnHref = $scope.editMode ? '#/profile/view/' + $scope.user.id : '#/stream';
            $scope.primaryBtnText = $scope.editMode ? 'Save' : 'Edit';
            $scope.disabledClass = $scope.editMode ? '' : ' disabled';
        };

        $scope.save = function() {

        };

        $scope.reset = function() {

        };

        $scope.primaryBtnClick = function() {
            if($scope.editMode) {
                $scope.save();
                $scope.editMode = false;
            }
            else
                $scope.editMode = true;
            $scope.repaint();
        };

        $scope.backBtnClick = function() {
            if($scope.editMode) {
                $scope.reset();
                $scope.editMode = false;
                $scope.repaint();
                $state.go('profile');
            }
            else
                $state.go('stream');
        };
    })

// A simple controller that fetches a list of data from a service
    .controller('StreamCtrl', function ($scope, $stateParams, $ionicModal, PostService, TagService, SessionService) {
        var contentEl = document.getElementById('menu-center');
        var content = new ionic.views.SideMenuContent({
            el: contentEl
        });

        var leftMenuEl = document.getElementById('menu-left');
        var leftMenu = new ionic.views.SideMenu({
            el: leftMenuEl,
            width: 270
        });

        var rightMenuEl = document.getElementById('menu-right');
        var rightMenu = new ionic.views.SideMenu({
            el: rightMenuEl,
            width: 270
        });

        $scope.sideMenuController = new ionic.controllers.SideMenuController({
            content: content,
            left: leftMenu,
            right: rightMenu
        });

        $scope.user = SessionService.user;

        // "Pets" is a service returning mock data (services.js)
        $scope.posts = [];// = PostService.all();

        // TODO posts
        // TODO comments
        // TODO likes
        // TODO settings pages: account and stream
        // TODO saving and resetting profile edits
        $scope.postType = 'ask';

        $scope.title = 'hello'; // not for shoutout
        $scope.tags = ['tag1', 'tag2', 'tag3'];
        $scope.content = 'Question'; // not for shoutout

        $scope.trackLocation = false; // for shoutout only
        $scope.contact = false; // for shoutout only
        $scope.immediateContact = false; // for shoutout only

        $scope.criteria = { ask: true, relate: true, shoutout: true };
        $scope.sortAscending = { title: true, author: true, date: true };
        $scope.currentSort = 'date';

        $scope.askClass = 'active';
        $scope.relateClass = 'active';
        $scope.shoutoutClass = 'active';

        $scope.sortTitleClass = '';
        $scope.sortAuthorClass = '';
        $scope.sortDateClass = 'ion-arrow-down-c active';

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

        $scope.toggleFilter = function(category) {
            $scope.criteria[category] = !$scope.criteria[category];
            $scope.askClass = $scope.criteria.ask ? 'active' : '';
            $scope.relateClass = $scope.criteria.relate ? 'active' : '';
            $scope.shoutoutClass = $scope.criteria.shoutout ? 'active' : '';
        };

        $scope.doSort = function(sort) {
            if(sort != $scope.currentSort)
                $scope.sortAscending = { title: true, author: true, date: true };
            $scope.currentSort = sort;
            $scope.sortAscending[sort] = !$scope.sortAscending[sort];

            $scope.sortTitleClass = $scope.currentSort != 'title' ? '' : 'active ' + ($scope.sortAscending.title ? 'ion-arrow-up-c' : 'ion-arrow-down-c');
            $scope.sortAuthorClass = $scope.currentSort != 'author' ? '' : 'active ' + ($scope.sortAscending.author ? 'ion-arrow-up-c' : 'ion-arrow-down-c');
            $scope.sortDateClass = $scope.currentSort != 'date' ? '' : 'active ' + ($scope.sortAscending.date ? 'ion-arrow-up-c' : 'ion-arrow-down-c');
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

        $scope.toggleLeft = function() {
            try {
                $scope.sideMenuController.toggleLeft();
            } catch(e) {
                // TODO fix error triggered by toggleLeft
            }
        };

        $scope.toggleRight = function() {
            try {
                $scope.sideMenuController.toggleRight();
            } catch(e) {
                // TODO fix error triggered by toggleLeft
            }
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
