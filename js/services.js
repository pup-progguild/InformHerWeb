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

            if(localStorage.getItem('informher-auth') == null)
                localStorage.setItem('informher-auth', '');

            var authKey = localStorage.getItem('informher-auth');

            $http.defaults.headers.common.Authentication = 'Basic ' + (authKey != null ? authKey : '');

            return {
                setCredentials: function (username, password) {
                    var encoded = Base64.encode(username + ':' + password);
                    $http.defaults.headers.common.Authorization = 'Basic ' + encoded;
                    localStorage.setItem('informher-auth', encoded);
                },
                clearCredentials: function () {
                    $http.defaults.headers.common.Authorization = 'Basic ';
                    localStorage.setItem('informher-auth', '');
                }
            };
        })
        .service('ApiService', function($http) {
            var requestBaseProtocol = 'http';
            //var requestBase = requestBaseProtocol + '://192.168.137.91/InformHerAPI/wwwroot';
            //var requestBase = requestBaseProtocol + '://localhost/InformHerAPI/wwwroot';
            //var requestBase = requestBaseProtocol + '://informherapi.azurewebsites.net';
            var requestBase = requestBaseProtocol + '://informherapi.cloudapp.net';

            this.getResponse = function(method, path, body, withCredentials) {
                if(withCredentials === undefined)
                    withCredentials = false;
                //$http.defaults.headers.common.Authentication = 'Basic ' + localStorage.getItem('informher-auth');

                //return $http[method](requestBase + path, body || {}, {withCredentials: true}); //TODO: modified by awk
                return $http({
                    method: method,
                    url: requestBase + path,
                    data: (body || {}),
                    withCredentials: withCredentials
                });
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

            this.saveProfile = function(profileData) {
                var deferred = $q.defer();
                $timeout(function() {
                    deferred.resolve(ApiService.getResponse('post', '/user/profile', profileData, true));
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
                },
                'POST': {
                    timeout: 1000,
                    method: 'post',
                    path: function() { return '/posts'; }
                },
                'POST:postId.like': {
                    timeout: 1000,
                    method: 'post',
                    path: function(postId) { return '/posts/' + postId + '/like'; }
                }
            };

            this.query = function(which) {
                var q = queries[which];
                var args = Array.prototype.slice.call(arguments);
                args.shift();

                var deferred = $q.defer();
                $timeout(function() {
                    deferred.resolve(
                        ApiService.getResponse(
                            q.method,
                            q.path.apply(this, args),
                            q.method == 'post' ? args[args.length - 1] : {},
                            true
                        )
                    );
                }, q.timeout);
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
                    path: function(postId, id) { return '/posts/' + postId + '/comments/' + id; }
                },
                'POST:postId.+': {
                    timeout: 1000,
                    method: 'post',
                    path: function(postId) { return '/posts/' + postId + '/comments'; }
                },
                'POST:postId.commentId.like': {
                    timeout: 1000,
                    method: 'post',
                    path: function(postId, id) { return '/posts/' + postId + '/comments/' + id + '/like'; }
                }
            };

            this.query = function(which) {
                var q = queries[which];
                var args = Array.prototype.slice.call(arguments);
                args.shift();

                var deferred = $q.defer();
                $timeout(function() {
                    deferred.resolve(
                        ApiService.getResponse(
                            q.method,
                            q.path.apply(this, args),
                            q.method == 'post' ? args[args.length - 1] : {},
                            true
                        )
                    );
                }, q.timeout);
                return deferred.promise;
            };
        })
        .service('ModalService', function($ionicModal) {
            var modals = {
                current: '',
                loaded: {}
            };

            this.loadModal = function(key, url, scope) {
                $ionicModal.fromTemplateUrl(url, function(modal) {
                    modals.loaded[key] = modal;
                }, {
                    scope: scope,
                    animation: 'slide-in-up'
                });
            };

            this.openModal = function(key) {
                modals.loaded[key].show();
                modals.current = key;
            };

            this.closeModal = function() {
                modals.loaded[modals.current].hide();
                modals.current = '';
            };
        })
    ;
})();