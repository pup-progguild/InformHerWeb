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
        var requestBase = requestBaseProtocol + '://192.168.137.91/InformHerAPI/wwwroot/';

        this.getResponse = function(method, path, body) {
            return $http[method](requestBase + path, body);
        }
    })
;