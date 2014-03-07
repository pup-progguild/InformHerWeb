angular.module('informher.controllers', [])
    .controller('AuthCtrl', function ($scope, $state, ApiService, UserService, Auth, ModalService, MessageService, PersistenceService, Base64) {
        $scope.registrationSuccessful = false;

        $scope.doAuth = function (authType) {
            $scope.message = MessageService.dismissMessage();
            $scope.showLoading((function(authType) {
                switch(authType) {
                    case 'login': return 'Logging in...Please wait.';
                    case 'register': return 'Processing your registration...Please wait.';
                    case 'logout': return 'Logging out...Please wait.';
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
                        'username': $scope.input.username,
                        'email': $scope.input.email,
                        'password': $scope.input.password,
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
                    case !($scope.input.username != ''):
                        $scope.message = MessageService.errorMessage('Invalid username', 'Error: ERR_INVALID_USERNAME');
                        return;
                    case !($scope.input.email != ''):
                        $scope.message = MessageService.errorMessage('Invalid email address', 'Error: ERR_INVALID_EMAIL_ADDRESS');
                        return;
                    case !($scope.input.password.length >= 6):
                        $scope.message = MessageService.errorMessage('Password cannot be shorter than 6 characters', 'Error: ERR_INVALID_PASSWORD');
                        return;
                    case !($scope.input.password == $scope.input.passwordConfirmation):
                        $scope.message = MessageService.errorMessage('Passwords do not match', 'Error: ERR_PASSWORDS_DO_NOT_MATCH');
                        return;
                }
            }

            ApiService.getResponse(query.method, query.path, query.body)
                .success(function (response) {
                    switch (authType) {
                        case 'login':
                            if(response.status == "USER_LOGIN_SUCCESS") {
                                Auth.setCredentials($scope.input.username, $scope.input.password, response.user.profile);
                                UserService.getUserData()
                                    .then(function(response2) {
                                        if(response2.data.status == "USER_HOME_RETRIEVE_SUCCESS") {
                                            response.user.profile = _.extend(response.user.profile, _.omit(response2.data, 'status'));
                                            UserService.setCurrentUserProfile(response.user.profile);

                                            $scope.updateCurrentUser();

                                            if($scope.input.remember)
                                                PersistenceService.set('informher-remember', Base64.encode($scope.input.username + ':' + $scope.input.password));
                                            else
                                                PersistenceService.reset('informher-remember');
                                            $scope.hideLoading();
                                            $state.go('stream.feed');
                                        }
                                    });
                            }
                            break;
                        case 'register':
                            $scope.registrationSuccessful = true;
                            $scope.hideLoading();
                            $scope.message = MessageService.informationMessage(response.description, "Message: " + response.status);
                            break;
                        case 'logout':
                            if(response.status == "USER_LOGGED_OUT_SUCCESS") {
                                Auth.clearCredentials();
                                $scope.currentUser = null;
                                PersistenceService.set('informher-current-user', null);
                                $scope.hideLoading();
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
                    $scope.message = MessageService.errorMessage(response.description, "Error: " + response.status);
                    console.log(response);
                });
        };

        $scope.reset = function(authType) {
            var authPair = Base64.decode(PersistenceService.get('informher-remember'));
            var username = authPair.substring(0, authPair.indexOf(':'));
            var password = authPair.substring(authPair.indexOf(':') + 1);
            var isLogin = authType == 'login';
            $scope.input = {
                username: username,
                email: '', // for register only
                password: password,
                passwordConfirmation: '', // for register only
                remember: PersistenceService.get('informher-remember') != '', // for login only
                agree: false // for register only
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
    .controller('StreamCtrl', function ($scope, PostService, ModalService, MessageService) {
        // fields unmodifiable by the user
        $scope.posts = [];
        $scope.currentPage = 0;

        $scope.input = {
            'title': '',
            'author': '', //for search only
            'content': '',
            'dateFrom': '', //for search only
            'dateTo': '', //for search only
            'tags': [],
            'category': ''
        };

        $scope.mode = 'initial';

        $scope.filterCriteria = {
            ask: true,
            relate: true,
            shoutout: true
        };

        $scope.searchMode = false;

        $scope.toggleLeft = function () {
            $scope.sideMenuController.toggleLeft();
        };

        $scope.onRefresh = function() {
            PostService.query('GET:*')
                .then(function (response) {
                    if (response.data.status == "POST_SHOW_SUCCESSFUL") {
                        var newPosts = response.data.posts.data;

                        for(var i = 0, len = newPosts.length; i < len; i++) {
                            var newPost = newPosts[i];
                            if(_.find($scope.posts, function(post) { return post.id == newPost.id }) === undefined)
                                $scope.posts.push(newPost);
                        }

                        for(i = 0, len = $scope.posts.length; i < len; i++) {
                            var post = $scope.posts[i];
                            post.visible = true;
                        }
                    }
                });
            $scope.$emit('scroll.refreshComplete');
        };

        $scope.filter = function() {
            console.log($scope.posts);
            for(var i = 0, len = $scope.posts.length; i < len; i++) {
                var post = $scope.posts[i];
                post.visible = false;

                if(!$scope.searchMode)
                    post.visible = $scope.filterCriteria[post.category.name];
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

        $scope.post = function(category) {
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
            PostService.query('POST', input)
                .then(function (response) {
                    ModalService.closeModal();
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

        $scope.onRefresh();
    })

    // displaying of posts' comments
    .controller('PostCtrl', function ($scope, $stateParams, PostService, CommentService, ModalService) {
        $scope.input = { 'message': '' };
        $scope.editPost = {};

        $scope.onRefresh = function() {
            // TODO configure for pagination
            CommentService.query('GET:postId.*', $stateParams.postId)
                .then(function (response) {
                    if (response.data.status == "POST_COMMENT_RETRIEVE_SUCCESSFUL") {
                        var newPosts = response.data.comment.data;
                        for(var i = 0, len = newPosts.length; i < len; i++)
                            $scope.post.comments.push(newPosts[i]);
                    }
                });

            $scope.$broadcast('scroll.refreshComplete');
        };

        $scope.addComment = function() {
            CommentService.query('POST:postId.+', $stateParams.postId, $scope.input)
                .then(function (response) {
                    if(response.data.status == "POST_COMMENT_CREATE_SUCCESS") {
                        $scope.post.comments.unshift(response.data.comment[0]);
                        $scope.input = '';
                    }
                });
        };

        PostService.query('GET:postId', $stateParams.postId)
            .then(function (response) {
                if (response.data.status == "POST_SHOW_SUCCESSFUL") {
                    $scope.post = response.data.posts;

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
                                tags: _.pluck($scope.post.tags, 'tagname'),

                            };
                            break;
                    }
                    console.log($scope.post);

                    ModalService.loadModal('modalEdit', 'modals/' + $scope.post.category.name + '.html', $scope);
                    CommentService.query('GET:postId.*', $stateParams.postId)
                        .then(function (response) {
                            if (response.data.status == "POST_COMMENT_RETRIEVE_SUCCESSFUL") {
                                $scope.post.comments = response.data.comment.data;
                            }
                        });
                }
            })
        ;

        $scope.likePost = function() {
            PostService.query('POST:postId.like', $stateParams.postId, {})
                .then(function(response) {
                    console.log(response);
                });
        };

        $scope.likeComment = function(id) {
            CommentService.query('POST:postId.commentId.like', $stateParams.postId, id, {})
                .then(function(response) {
                    console.log(response);
                });
        };

        $scope.edit = function() {
            ModalService.openModal('modalEdit');
        };
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
        };

        $scope.save = function() {
            $scope.doSave();
        };

        $scope.doSave = function() {
            UserService.saveProfile($scope.user)
                .then(function(response) {
                    if(response.data.status == "USER_PROFILE_UPDATE_SUCCESSFUL") {
                        $scope.isEditMode = false;
                    }
                });
        };

        $scope.updateUserProfile = function() {
            UserService.getProfile($stateParams.userId)
                .then(function(response) {
                    if(response.data.status == "USER_PROFILE_FETCH_SUCESS") {
                        $scope.user = response.data.profile;
                        $scope.pristineUser = response.data.profile;
                    }
                });
        };

        $scope.updateUserProfile();
    })
;