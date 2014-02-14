(function() {
	'use strict';
    var app = angular.module('InformHer', ['onsen.directives']);
    app.controller('LoginCtrl', function($scope, $http) {
        $scope.message = "";
        $scope.user = { name: 'ichi-san', pass: 'one_one_one' };
        $scope.submit = function() {
            $scope.message = "";
            $http.post('http://192.168.7.5/InformHerAPI/wwwroot/user/login', {
                username: $scope.user.name,
                password: $scope.user.pass
            })
                .success(function(data) {
                    console.log(data);
                })
                .error(function(response) {
                    switch(response.status) {
                    case "USER_LOGIN_FAILED":
                        $scope.message = response.description;
                        break;
                    default:
                        $scope.message = "An unknown error has occurred. Please contact InformHer's development team and send this technical information:<br><br>" +
                            "description: <strong>" + response.description + "</strong><br>" +
                            "status: <strong>" + response.status + "</strong>"
                    }
                })
            ;
        };
    })
    .controller('RegisterCtrl', function($scope, $http) {
        $scope.submit = function() {
            //$http.put('http://informherapi.azurewebsites.net/user')
        };
    });
})();
