(function() {
    angular.module('informher.services', [])
        .factory('Base64', function() {
            var keyStr = 'ABCDEFGHIJKLMNOP' +
                'QRSTUVWXYZabcdef' +
                'ghijklmnopqrstuv' +
                'wxyz0123456789+/' +
                '=';
            return {
                encode: function (input) {
                    var output = "";
                    var chr1, chr2, chr3 = "";
                    var enc1, enc2, enc3, enc4 = "";
                    var i = 0;

                    do {
                        chr1 = input.charCodeAt(i++);
                        chr2 = input.charCodeAt(i++);
                        chr3 = input.charCodeAt(i++);

                        enc1 = chr1 >> 2;
                        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                        enc4 = chr3 & 63;

                        if (isNaN(chr2)) {
                            enc3 = enc4 = 64;
                        } else if (isNaN(chr3)) {
                            enc4 = 64;
                        }

                        output = output +
                            keyStr.charAt(enc1) +
                            keyStr.charAt(enc2) +
                            keyStr.charAt(enc3) +
                            keyStr.charAt(enc4);
                        chr1 = chr2 = chr3 = "";
                        enc1 = enc2 = enc3 = enc4 = "";
                    } while (i < input.length);

                    return output;
                },

                decode: function (input) {
                    var output = "";
                    var chr1, chr2, chr3 = "";
                    var enc1, enc2, enc3, enc4 = "";
                    var i = 0;

                    // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
                    var base64test = /[^A-Za-z0-9\+\/\=]/g;
                    if (base64test.exec(input)) {
                        alert("There were invalid base64 characters in the input text.\n" +
                            "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                            "Expect errors in decoding.");
                    }
                    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

                    do {
                        enc1 = keyStr.indexOf(input.charAt(i++));
                        enc2 = keyStr.indexOf(input.charAt(i++));
                        enc3 = keyStr.indexOf(input.charAt(i++));
                        enc4 = keyStr.indexOf(input.charAt(i++));

                        chr1 = (enc1 << 2) | (enc2 >> 4);
                        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                        chr3 = ((enc3 & 3) << 6) | enc4;

                        output = output + String.fromCharCode(chr1);

                        if (enc3 != 64) {
                            output = output + String.fromCharCode(chr2);
                        }
                        if (enc4 != 64) {
                            output = output + String.fromCharCode(chr3);
                        }

                        chr1 = chr2 = chr3 = "";
                        enc1 = enc2 = enc3 = enc4 = "";

                    } while (i < input.length);

                    return output;
                }
            };
        })
        .factory('Auth', function (Base64, $http) {
            // initialize to whatever is in the cookie, if anything
            $http.defaults.headers.common.Authentication = 'Basic ' + localStorage.getItem('informher-auth');

            return {
                setCredentials: function (encoded) {
                    $http.defaults.headers.common.Authorization = 'Basic ' + encoded;
                    //localStorage.setItem('informher-auth', encoded);
                },
                clearCredentials: function () {
                    $http.defaults.headers.common.Authorization = 'Basic ';
                    localStorage.removeItem('informher-auth');
                }
            };
        })
        .service('ApiService', function($http) {
            var requestBaseProtocol = 'http';
            //var requestBase = requestBaseProtocol + '://192.168.137.91/InformHerAPI/wwwroot';
            //var requestBase = requestBaseProtocol + '://localhost/InformHerAPI/wwwroot';
            //var requestBase = requestBaseProtocol + '://informherapi.azurewebsites.net';
            var requestBase = requestBaseProtocol + '://informherapi.cloudapp.net';

            this.getResponse = function(method, path, body, config) {
                //$http.defaults.headers.common.Authentication = 'Basic ' + localStorage.getItem('informher-auth');

                return $http[method](requestBase + path, body, {withCredentials: true} || {}); //TODO: modified by awk
            };
        })
        .service('UserService', function($http, $q, $timeout, ApiService) {
            this.getProfile = function(id) { // TODO get own user profile
                var deferred = $q.defer();
                $timeout(function() {
                    deferred.resolve(ApiService.getResponse('get', id === undefined ? '/user' : '/user/profile/' + id));
                }, 1000);
                return deferred.promise;
            };

            this.getUserData = function(id) { // TODO make use of ID
                var deferred = $q.defer();
                $timeout(function() {
                    deferred.resolve(ApiService.getResponse('get', id === undefined ? '/user' : '/user'));
                }, 1000);
                return deferred.promise;
            };
        })
        .service('PostService', function($q, $timeout, ApiService) {
            var queries = {
                'GET:*': {
                    timeout: 1000,
                    method: 'get',
                    path: function() { return '/posts'; }
                },
                'GET:postId': {
                    timeout: 1000,
                    method: 'get',
                    path: function(id) { return '/posts/' + id; }
                }
            };

            this.do = function(which) {
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
        })
        .service('CommentService', function($q, $timeout, ApiService) {
            var queries = {
                'GET:postId.*': {
                    timeout: 1000,
                    method: 'get',
                    path: function(postId) { return '/posts/' + postId + '/comments'; }
                },
                'GET:postId.commentId': {
                    timeout: 1000,
                    method: 'get',
                    path: function(postId, id) { return '/posts/' + id; }
                },
                'POST:postId.+': {
                    timeout: 1000,
                    method: 'post',
                    path: function(postId) { return '/posts/' + postId + '/comments'; }
                }
            };

            this.do = function(which) {
                var query = queries[which];
                var args = Array.prototype.slice.call(arguments);
                args.shift();

                console.log(args);
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
        })
    ;
})();