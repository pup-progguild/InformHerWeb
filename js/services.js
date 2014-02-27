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
            //var requestBase = requestBaseProtocol + '://localhost/InformHerAPI/wwwroot';
            //var requestBase = requestBaseProtocol + '://informherapi.azurewebsites.net';
            var requestBase = requestBaseProtocol + '://informherapi.cloudapp.net';

            this.getResponse = function(method, path, body) {
                return $http[method](requestBase + path, body);
            };
        })
        .factory('PostService', function($q, $timeout, ApiService) {
            var queries = {
                '*': {
                    timeout: 1000,
                    method: 'get',
                    path: function() { return '/posts'; }
                },
                'postId': {
                    timeout: 1000,
                    method: 'get',
                    path: function(id) { return '/posts/' + id; }
                }
            };

            var get = function(which) {
                var query = queries[which];
                var args = Array.prototype.slice.call(arguments);
                args.shift();

                var deferred = $q.defer();
                $timeout(function() {
                    deferred.resolve(
                        ApiService.getResponse(
                            query.method,
                            query.path.apply(this, args)
                        )
                    );
                }, query.timeout);
                return deferred.promise;
            };

            return {
                get: get
            };
        })
        .factory('CommentService', function($q, $timeout, ApiService) {
            var queries = {
                'postId.*': {
                    timeout: 1000,
                    method: 'get',
                    path: function(postId) { return '/posts/' + postId + '/comments'; }
                },
                'postId.commentId': {
                    timeout: 1000,
                    method: 'get',
                    path: function(postId, id) { return '/posts/' + id; }
                }
            };

            var get = function(which) {
                var query = queries[which];
                var args = Array.prototype.slice.call(arguments);
                args.shift();

                var deferred = $q.defer();
                $timeout(function() {
                    deferred.resolve(
                        ApiService.getResponse(
                            query.method,
                            query.path.apply(this, args)
                        )
                    );
                }, query.timeout);
                return deferred.promise;
            };

            return {
                get: get
            };
        })
    ;
})();