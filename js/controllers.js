angular.module('informher.controllers', [])

    .controller('LoginCtrl', function($scope, $http) {
        $scope.username = 'ichi-san';
        $scope.password = 'one_one_one';
        //$scope.remember = false;

        $scope.submit = function() {
            //if($scope.remember)
            $http.post('http://192.168.7.5/InformHerAPI/wwwroot/user/login', {
                    'username': $scope.username,
                    'password': $scope.password
                }
            )
                .success(function(data) {
                    location.href = "#/stream";
                })
                .error(function(data) {

                });
        }
    })

    .controller('RegisterCtrl', function($scope, $http) {
        $scope.username = 'ichi-san';
        $scope.email = 'ichi-san@example.com';
        $scope.password = 'one_one_one';
        $scope.passwordAgain = 'one_one_one';
        $scope.agree = false;

        $scope.submit = function() {
            $http.post('http://192.168.7.5/InformHerAPI/wwwroot/user/login', {
                    'username': $scope.username,
                    'email': $scope.email,
                    'password': $scope.password
                }
            )
        }
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
    .controller('StreamCtrl', function ($scope, PostService) {
        // "Pets" is a service returning mock data (services.js)
        $scope.posts = PostService.all();

        $scope.filter = function(c) {
            return PostService.filter(c);
        }
    })


// A simple controller that shows a tapped item's data
    .controller('PostCtrl', function ($scope, $stateParams, PostService) {
        // "Pets" is a service returning mock data (services.js)
        $scope.post = PostService.get($stateParams.postId);
    });
