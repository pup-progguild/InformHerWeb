angular.module('informher.controllers', [])
    .controller('AuthCtrl', function ($scope, $state, ApiService, UserService, Auth, ModalService, MessageService, Base64, PersistenceService) {
        $scope.registrationSuccessful = false;

        $scope.doAuth = function (authType) {
            $scope.message = MessageService.dismissMessage();
            $scope.showLoading((function(authType) {
                switch(authType) {
                    case 'login': return 'LOGGING_IN';
                    case 'register': return 'REGISTERING';
                    case 'logout': return 'LOGGING_OUT';
                }
                return 'Unknown auth type';
            })(authType));
            var queries = {
                'login': {
                    'path': '/user/login',
                    'method': 'post',
                    'body': {
                        'username': $scope.input.username,
                        'password': $scope.input.password,
                        'remember': $scope.input.remember
                    }
                },
                'register': {
                    'path': '/user',
                    'method': 'post',
                    'body': {
                        'username': $scope.input.usernameRegister,
                        'email': $scope.input.email,
                        'password': $scope.input.passwordRegister,
                        'password_confirmation': $scope.input.passwordConfirmation
                    }
                },
                'logout': {
                    'path': '/user/logout',
                    'method': 'get'
                }
            }, query = queries[authType];

            if (authType == 'register') {
                switch (!false) {
                    case !($scope.input.usernameRegister != ''):
                        $scope.hideLoading();
                        $scope.message = MessageService.errorMessage('ERR_INVALID_USERNAME', 'Error: ERR_INVALID_USERNAME');
                        return;
                    case !($scope.input.email != ''): // check if email is invalid
                        $scope.hideLoading();
                        $scope.message = MessageService.errorMessage('ERR_INVALID_EMAIL_ADDRESS', 'Error: ERR_INVALID_EMAIL_ADDRESS');
                        return;
                    case !($scope.input.passwordRegister.length >= 6):
                        $scope.hideLoading();
                        $scope.message = MessageService.errorMessage('ERR_SHORT_PASSWORD', 'Error: ERR_SHORT_PASSWORD');
                        return;
                    case !($scope.input.password == $scope.input.passwordConfirmation):
                        $scope.hideLoading();
                        $scope.message = MessageService.errorMessage('ERR_PASSWORDS_DO_NOT_MATCH', 'Error: ERR_PASSWORDS_DO_NOT_MATCH');
                        return;
                }
            }

            ApiService.getResponse(query.method, query.path, query.body)
                .success(function (response) {
                    switch (authType) {
                        case 'login':
                            if(response.status == "USER_LOGIN_SUCCESS") {
                                Auth.setCredentials($scope.input.username, $scope.input.password);
                                UserService.query('get currentUser.data')
                                    .then(function(response2) {
                                        if(response2.data.status == "USER_HOME_RETRIEVE_SUCCESS") {
                                            response.user.profile = _.extend(response.user.profile, _.omit(response2.data, 'status'));

                                            UserService.setCurrentUserProfile(response.user.profile);
                                            $scope.updateCurrentUser();

                                            if(PersistenceService.get('global', 'track'))
                                                $scope.getLocation();

                                            if($scope.input.remember)
                                                PersistenceService.put('global', 'remember', Base64.encode($scope.input.username + ':' + $scope.input.password));
                                            else
                                                PersistenceService.put('global', 'remember', '');
                                            $scope.hideLoading();
                                            $scope.showScreenMessage(response.status);
                                            $state.go('stream.feed');
                                        }
                                    });
                            }
                            break;
                        case 'register':
                            if(response.status == "USER_CREATE_SUCCESSFUL") {
                                $scope.registrationSuccessful = true;

                                $scope.hideLoading();
                                //$scope.showScreenMessage(response.status);
                                $scope.message = MessageService.informationMessage(response.description, "Message: " + response.status);
                            }
                            break;
                        case 'logout':
                            if(response.status == "USER_LOGGED_OUT_SUCCESS") {
                                Auth.clearCredentials();
                                $scope.currentUser = null;
                                PersistenceService.put('global', 'current-user', null);
                                PersistenceService.clear('stream');
                                PersistenceService.clear('admin');

                                $scope.hideLoading();
                                $scope.showScreenMessage(response.status);
                                $state.go('home');
                            }
                            break;
                        default:
                            console.log('Unknown auth type ' + authType);
                    }
                })
                .error(function (response) {
                    $scope.hideLoading();
                    response = response || { status: 'ERR_CONNECTIVITY', description: "The app cannot communicate with InformHer's servers right now. Please try again later" };
                    $scope.message = MessageService.errorMessage(response.status, "Error: " + response.status);
                });
        };

        $scope.reset = function(authType) {
            var authPair = Base64.decode(PersistenceService.get('global', 'remember'));
            var username = authPair.substring(0, authPair.indexOf(':'));
            var password = authPair.substring(authPair.indexOf(':') + 1);
            var isLogin = authType == 'login';
            $scope.input = {
                username: username,
                usernameRegister: '', // for register only
                email: '', // for register only
                password: password,
                passwordRegister: '', // for register only
                passwordConfirmation: '', // for register only
                remember: PersistenceService.get('global', 'remember') != '', // for login only
                agree: false, // for register only,
            };
            $scope.registrationSuccessful = false;
        };

        $scope.openTouModal = function() {
            ModalService.openModal('modalTou');
        };

        $scope.reset('login');
        ModalService.loadModal('modalTou', 'modals/tos.html', $scope);
    })

    // displaying of stream's posts
    .controller('StreamCtrl', function ($scope, PersistenceService, PostService, ModalService) {
        // fields unmodifiable by the user
        $scope.posts = [];
        $scope.currentPage = PersistenceService.get('stream', 'page') || 1;

        $scope.input = {
            'title': '',
            'author': '', //for search only
            'content': '',
            'dateFrom': '', //for search only
            'dateTo': '', //for search only
            'tags': [],
            'category': ''
        };

        $scope.mode = 'initial'; // TODO admin
        // TODO load from cache

        $scope.filterCriteria = {
            ask: true,
            relate: true,
            shoutout: true
        };

        $scope.searchMode = false;

        $scope.isLeftMenuShown = function() {
            //return $scope.sideMenuController._leftShowing;
        };

        $scope.toggleLeft = function () {
            $scope.sideMenuController.toggleLeft();
            console.log($scope.sideMenuController.isOpen());
        };

        $scope.onRefresh = function(showLoading) {
            if(showLoading)
                $scope.showLoading('', false);
            PostService.query('get page($0).posts', $scope.currentPage)
                .then(function (response) {
                    if (response.data.status == "POST_SHOW_SUCCESSFUL") {
                        var newPosts = response.data.posts.data;
                        var oldPosts = PersistenceService.get('stream', 'posts') || [];

                        for(var i = 0, len = newPosts.length; i < len; i++) {
                            var newPost = newPosts[i];
                            if(_.find(oldPosts, function(post) { return post.id == newPost.id }) === undefined) {
                                newPost.visible = true;
                                oldPosts.push(newPost);
                            }
                        }

                        PersistenceService.put('stream', 'posts', oldPosts);
                        $scope.showPosts();
                        $scope.updatePage();
                        $scope.currentPage++;
                    }

                    if(showLoading)
                        $scope.hideLoading();
                });
            $scope.$emit('scroll.refreshComplete');
        };

        $scope.updatePage = function() {
            PersistenceService.put('stream', 'page', $scope.currentPage);
        };

        $scope.showPosts = function() {
            $scope.posts = PersistenceService.get('stream', 'posts');
        };

        $scope.filter = function() {
            for(var i = 0, len = $scope.posts.length; i < len; i++) {
                var post = $scope.posts[i];
                post.visible = false;

                if(!$scope.searchMode)
                    post.visible = $scope.filterCriteria[post.category.name];
                else {
                    // TODO search mode
                }
            }
        };

        $scope.toggleFilter = function(which) {
            $scope.filterCriteria[which] = !$scope.filterCriteria[which];
            $scope.filter();
        };

        $scope.toggleSearchMode = function() {
            $scope.searchMode = !$scope.searchMode;
            $scope.filter();
        };

        $scope.search = function() {
            $scope.searchMode = true;
            $scope.filter();
        };

        $scope.submitPost = function(category) {
            var input = { category: category };
            switch(category) {
                case 'ask':
                case 'relate':
                    input = _.extend(input, _.pick($scope.input, 'title', 'tags', 'content'));
                    break;
                case 'shoutout':
                    var flags = {
                        'track': $scope.input.track,
                        'contact': $scope.input.contact,
                        'urgent': $scope.input.urgent
                    };
                    var flagArray = [];
                    var messageArray = [];
                    for(var flagKey in flags)
                        if(flags[flagKey]) {
                            flagArray.push(flagKey.toUpperCase());
                            switch(flagKey) {
                                case 'track':
                                    messageArray.push('My current location is ' + '0' + '.');
                                    break;
                                case 'contact':
                                    var hasEmail = $scope.input.email != '';
                                    var hasMobile = $scope.input.mobile != '';
                                    messageArray.push(
                                        'You can contact me '
                                        + (hasEmail ? 'via email: ' + $scope.input.email : '')
                                        + (hasEmail && hasMobile ? ', or ' : '')
                                        + (hasMobile ? 'via mobile: ' + $scope.input.mobile : '')
                                        + '.'
                                    );
                                    break;
                                case 'urgent':
                                    messageArray.push('I am expecting your response as soon as possible.');
                                    break;
                            }
                        }
                    messageArray.push('');
                    input.title = flagArray.join(', ');
                    break;
            }
            PostService.query('new post', input)
                .then(function (response) {
                    $scope.hideLoading();
                    $scope.showScreenMessage(response.data.status);
                    if(response.data.status == "POST_ADD_SUCCESSFUL") {
                        ModalService.closeModal();
                        $scope.onRefresh(false);
                    }
                });
        };

        $scope.openModal = function(key) {
            ModalService.openModal(key);
        };

        $scope.addTag = function(tag) {
            $scope.input.tags.push(tag);
        };

        ModalService.loadModal('modalAsk', 'modals/ask.html', $scope);
        ModalService.loadModal('modalRelate', 'modals/relate.html', $scope);
        ModalService.loadModal('modalShoutout', 'modals/shoutout.html', $scope);
        ModalService.loadModal('modalSearch', 'modals/search.html', $scope);

        if($scope.posts.length == 0)
            $scope.onRefresh(true);
    })

    // displaying of posts' comments
    .controller('PostCtrl', function ($scope, $stateParams, PostService, CommentService, ModalService) {
        $scope.input = { 'message': '' };
        $scope.editPost = {};
        $scope.liked = false;

        $scope.fetchComments = function() {
            return CommentService.query('get post($0).page($1).comments', $stateParams.postId, 0)
                .then(function (response) {
                    if (response.data.status == "POST_COMMENT_RETRIEVE_SUCCESSFUL") {
                        var newPosts = response.data.comment.data;

                        console.log($scope.post);

                        for(var i = 0, len = newPosts.length; i < len; i++) {
                            var newPost = newPosts[i];
                            if(_.find($scope.post.comments, function(post) { return post.id == newPost.id }) === undefined)
                                $scope.post.comments.push(newPost);
                        }
                    }
                });
        };

        $scope.onRefresh = function() {
            $scope.fetchComments()
                .then(function() {
                    $scope.$broadcast('scroll.refreshComplete');
                });
        };

        $scope.addComment = function() {
            $scope.input = '';
            CommentService.query('new post($0).comment', $stateParams.postId, $scope.input)
                .then(function (response) {
                    if(response.data.status == "POST_COMMENT_CREATE_SUCCESS") {
                        $scope.post.comments.unshift(response.data.comment[0]);
                        $scope.showScreenMessage(response.data.status);
                    }
                });
        };

        $scope.likePost = function() {
            $scope.liked = !$scope.liked;
            PostService.query('like post($0)', $stateParams.postId, {})
                .then(function(response) {
                    console.log(response);
                });
        };

        $scope.likeComment = function(id) {
            console.log(_.find($scope.post.comments, function(comment) { return comment.id == id }));
            CommentService.query('like post($0).comment($1)', $stateParams.postId, id, {})
                .then(function(response) {
                    console.log(response);
                });
        };

        $scope.edit = function() {
            ModalService.openModal('modalEdit');
        };

        $scope.submitPost = function(category) {
            var input = { category: category };
            switch(category) {
                case 'ask':
                case 'relate':
                    input = _.extend(input, _.pick($scope.input, 'title', 'tags', 'content'));
                    break;
                case 'shoutout':
                    var flags = {
                        'track': $scope.input.track,
                        'contact': $scope.input.contact,
                        'urgent': $scope.input.urgent
                    };
                    var flagArray = [];
                    var messageArray = [];
                    for(var flagKey in flags)
                        if(flags[flagKey]) {
                            flagArray.push(flagKey.toUpperCase());
                            switch(flagKey) {
                                case 'track':
                                    messageArray.push('My current location is ' + '0' + '.');
                                    break;
                                case 'contact':
                                    var hasEmail = $scope.input.email != '';
                                    var hasMobile = $scope.input.mobile != '';
                                    messageArray.push(
                                        'You can contact me '
                                            + (hasEmail ? 'via email: ' + $scope.input.email : '')
                                            + (hasEmail && hasMobile ? ', or ' : '')
                                            + (hasMobile ? 'via mobile: ' + $scope.input.mobile : '')
                                            + '.'
                                    );
                                    break;
                                case 'urgent':
                                    messageArray.push('I am expecting your response as soon as possible.');
                                    break;
                            }
                        }
                    messageArray.push('');
                    input.title = flagArray.join(', ');
                    break;
            }
            $scope.showLoading('POST_UPDATE', true);
            PostService.query('update post($0) = $1', $stateParams.postId, input)
                .then(function (response) {
                    $scope.post.content = input.content;
                    $scope.showScreenMessage(response.data.status, false);
                    ModalService.closeModal();
                });
        };

        $scope.showLoading('', true);
        PostService.query('get post($0)', $stateParams.postId)
            .then(function (response) {
                if (response.data.status == "POST_SHOW_SUCCESSFUL") {
                    $scope.post = response.data.posts;
                    $scope.post.comments = [];

                    switch($scope.post.category.name) {
                        case 'ask':
                        case 'relate':
                            $scope.input = {
                                title: $scope.post.title,
                                tags: _.pluck($scope.post.tags, 'tagname'),
                                content: $scope.post.content
                            };
                            break;
                        case 'shoutout':
                            $scope.input = {
                                tags: _.pluck($scope.post.tags, 'tagname')

                            };
                            break;
                    }

                    ModalService.loadModal('modalEdit', 'modals/' + $scope.post.category.name + '.html', $scope);
                    console.log($scope.post.comment_count);
                    $scope.fetchComments()
                        .then(function() {
                            $scope.hideLoading();
                        });
                    /*
                    CommentService.query('GET:postId.*', $stateParams.postId)
                        .then(function (response) {
                            if (response.data.status == "POST_COMMENT_RETRIEVE_SUCCESSFUL") {
                                $scope.post.comments = response.data.comment.data;
                                $scope.hideLoading();
                            }
                        });
                        */
                    $scope.onRefresh();
                }
            })
        ;
    })

    .controller('UserCtrl', function ($scope, $stateParams, UserService) {
        $scope.user = {};

        $scope.isEditMode = false;

        $scope.editMode = function() {
            $scope.isEditMode = true;
        };

        $scope.reset = function() {
            $scope.doReset();
            $scope.isEditMode = false;
        };

        $scope.doReset = function() {
            $scope.user = $scope.pristineUser;
            $scope.isEditMode = false;
        };

        $scope.save = function() {
            $scope.doSave();
        };

        $scope.cancel = function() {
            $scope.doReset();
        };

        $scope.doSave = function() {
            $scope.showLoading('USER_PROFILE_UPDATE', true);
            UserService.query('update currentUser.profile = $0', $scope.user)
                .then(function(response) {
                    $scope.hideLoading();
                    $scope.showScreenMessage(response.data.status);
                    if(response.data.status == "USER_PROFILE_UPDATE_SUCCESSFUL") {
                        $scope.isEditMode = false;
                    }
                });
        };

        $scope.updateUserProfile = function() {
            $scope.showLoading('USER_PROFILE_FETCH', true);
            UserService.query('get user($0).profile', $stateParams.userId)
                .then(function(response) {
                    if(response.data.status == "USER_PROFILE_FETCH_SUCESS") {
                        $scope.hideLoading();
                        $scope.user = response.data.profile;
                        $scope.pristineUser = response.data.profile;
                        $scope.isEditMode = false;
                    }
                });
        };

        $scope.updateUserProfile();
    })
;