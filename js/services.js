(function() {
    angular.module('informher.services', ['informher.services.auth'])
        .service('ApiService', function($http) {
            var requestBaseProtocol = 'http';

            var requestBase = requestBaseProtocol + '://informherapi.cloudapp.net';
            //var requestBase = requestBaseProtocol + '://informherapi.cloudapp.net/InformHerAPI/wwwroot';
            //var requestBase = requestBaseProtocol + '://192.168.137.239';

            this.getResponse = function(method, path, body, withCredentials) {
                if(withCredentials === undefined)
                    withCredentials = false;

                return $http({
                    method: method,
                    url: requestBase + path,
                    data: (body || {}),
                    withCredentials: withCredentials
                });
            };
        })
        .service('UserService', function($http, $q, $timeout, ApiService, PersistenceService) {
            var queries = {
                'get user($0).profile': {
                    timeout: 300,
                    method: 'get',
                    path: function(id) { return '/user/profile/' + id; }
                },
                'update currentUser.profile = $0': {
                    timeout: 300,
                    method: 'post',
                    path: function() { return '/user/profile'; }
                },
                'get currentUser.data': {
                    timeout: 300,
                    method: 'get',
                    path: function() { return '/user'; }
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

            this.getCurrentUserProfile = function() {
                return PersistenceService.get('global', 'current-user');
            };

            this.setCurrentUserProfile = function(profile) {
                PersistenceService.put('global', 'current-user', profile);
            };
        })
        .service('LoadingService', function($ionicLoading, I18N) {
            var loading;

            this.showLoading = function(content, backdrop) {
                loading = $ionicLoading.show({
                    // The text to display in the loading indicator
                    content: '<i class="icon ion-loading-a"></i>' + (content !== undefined ? '<br/>' + I18N._(content) : ''),

                    // The animation to use
                    animation: 'fade-in',

                    // Will a dark overlay or backdrop cover the entire view
                    showBackdrop: backdrop,

                    // The maximum width of the loading indicator
                    // Text will be wrapped if longer than maxWidth
                    maxWidth: 270,

                    // The delay in showing the indicator
                    showDelay: 0
                });
            };

            this.hideLoading = function() {
                loading.hide();
            };
        })
        .service('PostService', function($q, $timeout, ApiService, PersistenceService) {
            var queries = {
                'get page($0).posts': {
                    timeout: 300,
                    method: 'get',
                    message: 'POST_SHOW',
                    path: function(page) { return '/posts?page=' + page; }
                },
                'get post($0)': {
                    timeout: 300,
                    method: 'get',
                    message: 'POST_SHOW',
                    path: function(id) { return '/posts/' + id; }
                },
                'get post($0).likes': {
                    timeout: 300,
                    method: 'get',
                    message: 'POST_LIKES_RETRIEVE',
                    path: function(id) { return '/posts/' + id + '/likes'; }
                },
                'new post': {
                    timeout: 300,
                    method: 'post',
                    message: 'POST_ADD',
                    path: function() { return '/posts'; }
                },
                'update post($0) = $1': {
                    timeout: 300,
                    method: 'post',
                    message: 'POST_UPDATE',
                    path: function(id) { return '/posts/' + id; }
                },
                'like post($0)': {
                    timeout: 300,
                    method: 'post',
                    message: 'POST_CREATE_LIKE',
                    path: function(id) { return '/posts/' + id + '/like'; }
                },
                'delete post($0)': {
                    timeout: 300,
                    method: 'delete',
                    message: 'POST_DELETE',
                    path: function(id) { return '/posts/' + id; }
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

            this.search = function(query, options) {
                var deferred = $q.defer();
                $timeout(function() {
                    deferred.resolve(
                        ApiService.getResponse(
                            'post',
                            '/posts/search',
                            (function() {
                                var flags = {};
                                for(var flag in options)
                                    flags[flag] = ''; // set flag
                                flags.query = query;
                                return flags;
                            })(),
                            true
                        )
                    );
                }, 300);
                return deferred.promise;
            };

            this.getPost = function(id) {
                return _.findWhere(PersistenceService.get('stream', PersistenceService.get('stream', 'mode')), { 'id': id })
                    || _.findWhere(PersistenceService.get('stream', PersistenceService.get('stream', 'mode')), { 'id': parseInt(id) });
            };
        })
        .service('CommentService', function($q, $timeout, ApiService) {
            var queries = {
                'get post($0).page($1).comments': {
                    timeout: 300,
                    method: 'get',
                    path: function(postId, page) { return '/posts/' + postId + '/comments?page=' + page; }
                },
                'get post($0).comment($1)': {
                    timeout: 300,
                    method: 'get',
                    path: function(postId, id) { return '/posts/' + postId + '/comments/' + id; }
                },
                'new post($0).comment': {
                    timeout: 300,
                    method: 'post',
                    path: function(postId) { return '/posts/' + postId + '/comments'; }
                },
                'like post($0).comment($1)': {
                    timeout: 300,
                    method: 'post',
                    path: function(postId, id) { return '/posts/' + postId + '/comments/' + id + '/like'; }
                },
                'delete post($0).comment($1)': {
                    timeout: 300,
                    method: 'delete',
                    path: function(postId, id) { return '/posts/' + postId + '/comments/' + id; }
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
                try {
                    modals.loaded[modals.current].hide();
                    modals.current = '';
                } catch(e) {

                }
            };
        })
        .factory('MessageService', function(I18N, $ionicLoading) {
            var message = {
                displayed: false,
                title: {
                    content: '',
                    color: {
                        bg: 'dark',
                        fg: 'stable'
                    }
                },
                body: {
                    content: '',
                    color: {
                        bg: 'stable',
                        fg: 'dark'
                    }
                },
                border: 'dark'
            };

            var displayMessage = function (body, title, bg, fg) {
                message = {
                    displayed: true,
                    title: {
                        content: I18N._(title),
                        color: {
                            bg: fg,
                            fg: bg
                        }
                    },
                    body: {
                        content: I18N._(body),
                        color: {
                            bg: bg,
                            fg: fg
                        }
                    },
                    border: fg
                };
                return message;
            };

            var dismissMessage = function() {
                message.displayed = false;
                return message;
            };

            var screenMessage;

            var showScreenMessage = function(body, backdrop) {
                screenMessage = $ionicLoading.show({
                    // The text to display in the loading indicator
                    content: I18N._(body),

                    // The animation to use
                    animation: 'fade-in',

                    // Will a dark overlay or backdrop cover the entire view
                    showBackdrop: backdrop,

                    // The maximum width of the loading indicator
                    // Text will be wrapped if longer than maxWidth
                    maxWidth: 270,

                    // The delay in showing the indicator
                    showDelay: 0
                });
            };

            var hideScreenMessage = function() {
                screenMessage.hide();
            };

            return {
                informationMessage: function(body, title) {
                    return displayMessage(body, title, 'stable', 'dark');
                },
                errorMessage: function(body, title) {
                    return displayMessage(body, title, 'stable', 'assertive');
                },
                dismissMessage: function() {
                    return dismissMessage();
                },
                screenMessage: function(body, backdrop) {
                    showScreenMessage(body, backdrop);
                    setTimeout(function() { hideScreenMessage(); }, backdrop ? 1000 : 1500);
                }
            };
        })
        .service('PersistenceService', function($angularCacheFactory) {
            var caches = {
                'global': 'localStorage',
                'stream': 'localStorage',
                'admin': 'localStorage',
                'post': 'localStorage'
            };

            this.get = function(cache, key) {
                return caches[cache].get(key);
            };

            this.put = function(cache, key, value) {
                caches[cache].put(key, value);
            };

            this.clear = function(cache) {
                caches[cache].removeAll();
            };

            this.remove = function(cache, key) {
                caches[cache].remove(key);
            };

            for(var i in caches)
                caches[i] = $angularCacheFactory(i, { storageMode: caches[i] } );
        })
        .service('I18N', function() {
            this._ = function(key) {
                return ("{{ '" + key + "' | translate }}");
            };
        })
    ;
})();