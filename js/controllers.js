angular.module('informher.controllers', [])

    .controller('LoginCtrl', function($scope, $http, $ionicModal) {
        $scope.username = 'ichi-san';
        $scope.password = 'one_one_one';
        $scope.message = 'sadfasdf';

        $ionicModal.fromTemplateUrl('modal.html', function(modal) {
            $scope.modal = modal;
        }, {
            scope: $scope,
            animation: 'slide-in-up'
        });

        $scope.submit = function() {
            $http.post('http://192.168.7.5/InformHerAPI/wwwroot/user/login', {
                    'username': $scope.username,
                    'password': $scope.password
                }
            )
                .success(function(data) {
                    location.href = "#/stream";
                })
                .error(function(data) {
                    $scope.message = "Unknown error occurred.";
                    $scope.openModal();
                    //console.log(data);
                });
        };

        $scope.openModal = function() {
            $scope.modal.show();
        };

        $scope.closeModal = function() {
            $scope.modal.hide();
        };
    })

    .controller('RegisterCtrl', function($scope, $http, $ionicModal) {
        $scope.username = 'ichi-san';
        $scope.email = 'ichi-san@example.com';
        $scope.password = 'one_one_one';
        $scope.passwordAgain = 'one_one_one';
        $scope.agree = false;

        $ionicModal.fromTemplateUrl('modal.html', function(modal) {
            $scope.modal = modal;
        }, {
            scope: $scope,
            animation: 'slide-in-up'
        });

        $scope.canRegister = function() {
            console.log($scope.username);
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
            $http.post('http://192.168.7.5/InformHerAPI/wwwroot/user/login', {
                    'username': $scope.username,
                    'email': $scope.email,
                    'password': $scope.password
                }
            )
        };

        $scope.openModal = function() {
            $scope.modal.show();
        };

        $scope.closeModal = function() {
            $scope.modal.hide();
        };
    })

    .controller('AskPostCtrl', function($scope, $http) {
        $scope.title = 'hello';
        $scope.tags = ['tag1', 'tag2', 'tag3'];
        $scope.content = 'Question';

        $scope.submit = function() {

        }
    })

    .controller('RelatePostCtrl', function($scope, $http) {
        $scope.title = 'hello';
        $scope.tags = ['tag1', 'tag2', 'tag3'];
        $scope.content = 'Question';

        $scope.submit = function() {

        }
    })

    .controller('ShoutoutPostCtrl', function($scope, $http) {
        $scope.tags = ['tag1', 'tag2', 'tag3'];
        $scope.trackLocation = false;
        $scope.contact = false;
        $scope.immediateContact = false;

        $scope.submit = function() {

        }
    })

// A simple controller that fetches a list of data from a service
    .controller('StreamCtrl', function ($scope, $stateParams, $ionicModal, PostService) {
        // "Pets" is a service returning mock data (services.js)
        $scope.posts = [];// = PostService.all();

        $scope.criteria = {};

        $scope.currentModal = '';
        $scope.modals = [];

        $ionicModal.fromTemplateUrl('new-post.html', function(modal) {
            $scope.modals['new-post'] = modal;
        }, {
            scope: $scope,
            animation: 'slide-in-up'
        });

        $ionicModal.fromTemplateUrl('sort.html', function(modal) {
            $scope.modals['sort'] = modal;
        }, {
            scope: $scope,
            animation: 'slide-in-up'
        });

        $scope.filter = function(crit) {
            $scope.criteria = crit;
            $scope.posts = PostService.filter($scope.criteria);
        };

        $scope.get = function(id) {
            PostService.get(id);
        };

        $scope.bgColorForTag = function(tag) {
            return 'rgba(0, 0, 0, 0.25)';
        };

        $scope.fgColorForTag = function(tag) {
            return '#000000';
        };

        $scope.filter($scope.criteria);

        $scope.openModal = function(name) {
            $scope.currentModal = name;
            $scope.modals[name].show();
        };

        $scope.closeModal = function() {
            $scope.modals[$scope.currentModal].hide();
            $scope.currentModal = '';
        };
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
