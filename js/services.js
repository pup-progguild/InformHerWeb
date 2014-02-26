(function() {
    angular.module('informher.services', [])
        .service('UserService', function() {
            this.user = null;

            this.getLoggedUser = function() {
                return this.user;
            };

            this.setLoggedUser = function(user) {
                this.user = user;
            }
        })
        .service('ApiService', function($http) {
            var requestBaseProtocol = 'http';
            //var requestBase = requestBaseProtocol + '://192.168.137.91/InformHerAPI/wwwroot';
            var requestBase = requestBaseProtocol + '://localhost/InformHerAPI/wwwroot';
            //var requestBase = requestBaseProtocol + '://informherapi.azurewebsites.net';

            this.getResponse = function(method, path, body) {
                return $http[method](requestBase + path, body);
            };
        })
        .service('PostService', function(ApiService) {
            this.getAllPosts = function() {
                return ApiService.getResponse('get', '/posts')
                    .then( // try
                    function(response) {
                        console.log(response);
                    }, // catch
                    function(response) {
                        console.log(response);
                    });
            }
        })
    ;
})();