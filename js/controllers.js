angular.module('informher.controllers', [])
    .controller('AuthCtrl', function ($scope, $state, ApiService, UserService, Auth, ModalService) {
        $scope.registrationSuccessful = false;

        $scope.message = {
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

        $scope.displayMessage = function (body, title, bg, fg) {
            $scope.message = {
                displayed: true,
                title: {
                    content: title,
                    color: {
                        bg: fg,
                        fg: bg
                    }
                },
                body: {
                    content: body,
                    color: {
                        bg: bg,
                        fg: fg
                    }
                },
                border: fg
            }
        };

        $scope.displayInformationMessage = function (body, title) {
            $scope.displayMessage(body, title);
        };

        $scope.displayErrorMessage = function (body, title) {
            $scope.displayMessage(body, title, 'stable', 'assertive');
        };

        $scope.dismissMessage = function () {
            $scope.message = {
                displayed: false,
                title: '',
                body: '',
                bg: 'stable-bg',
                border: 'stable-border',
                fg: 'dark'
            };
        };

        $scope.doAuth = function (authType) {
            $scope.dismissMessage();
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
                        $scope.displayErrorMessage('Invalid username', 'Error: ERR_INVALID_USERNAME');
                        return;
                    case !($scope.input.email != ''):
                        $scope.displayErrorMessage('Invalid email address', 'Error: ERR_INVALID_EMAIL_ADDRESS');
                        return;
                    case !($scope.input.password.length >= 6):
                        $scope.displayErrorMessage('Password cannot be shorter than 6 characters', 'Error: ERR_INVALID_PASSWORD');
                        return;
                    case !($scope.input.password == $scope.input.passwordConfirmation):
                        $scope.displayErrorMessage('Passwords do not match', 'Error: ERR_PASSWORDS_DO_NOT_MATCH');
                        return;
                }
            }

            ApiService.getResponse(query.method, query.path, query.body)
                .success(function (response) {
                    switch (authType) {
                        case 'login':
                            if(response.status == "USER_LOGIN_SUCCESS") {
                                Auth.setCredentials($scope.input.username, $scope.input.password, response.user.profile);
                                $scope.updateCurrentUser();
                                $state.go('stream.feed');
                            }
                            break;
                        case 'register':
                            $scope.registrationSuccessful = true;
                            $scope.displayInformationMessage(response.description, "Message: " + response.status);
                            break;
                        case 'logout':
                            if(response.status == "USER_LOGGED_OUT_SUCCESS") {
                                Auth.clearCredentials();
                                $scope.currentUser = null;
                                localStorage.removeItem('informher-current-user');
                                $state.go('home');
                            }
                            break;
                        default:
                            console.log('Unknown auth type ' + authType);
                    }
                })
                .error(function (response) {
                    response = response || { status: 'ERR_CONNECTIVITY', description: "The app cannot communicate with InformHer's servers right now. Please try again later" };
                    $scope.displayErrorMessage(response.description, "Error: " + response.status);
                    console.log(response);
                });
        };

        $scope.reset = function () {
            $scope.input = {
                username: '',
                email: '', // for register only
                password: '',
                passwordConfirmation: '', // for register only
                remember: false, // for login only
                agree: false // for register only
            };
            $scope.registrationSuccessful = false;
        };

        $scope.openTouModal = function() {
            ModalService.openModal('modalTou');
        };

        $scope.reset();

        ModalService.loadModal('modalTou', 'modals/tos.html', $scope);
    })

    // displaying of stream's posts
    .controller('StreamCtrl', function ($scope, PostService, ModalService) {
        $scope.posts = [];

        $scope.input = {
            'title': '',
            'content': '',
            'tags': [],
            'category': ''
        };

        $scope.filterCriteria = {
            ask: true,
            relate: true,
            shoutout: true
        };

        $scope.toggleLeft = function () {
            $scope.sideMenuController.toggleLeft();
        };

        $scope.onRefresh = function() {
            PostService.query('GET:*')
                .then(function (response) {
                    if (response.data.status == "POST_SHOW_SUCCESSFUL") {
                        var newPosts = response.data.posts.data;
                        for(var i = 0, len = newPosts.length; i < len; i++)
                            $scope.posts.push(newPosts[i]);

                        for(var i = 0, len = $scope.posts.length; i < len; i++) {
                            var post = $scope.posts[i];
                            post.visible = true;
                        }
                    }
                });
        };

        $scope.filter = function() {
            for(var i = 0, len = $scope.posts.length; i < len; i++) {
                var post = $scope.posts[i];
                post.visible = false;

                post.visible = $scope.filterCriteria[post.category.name];
            }
        };

        $scope.toggleFilter = function(which) {
            $scope.filterCriteria[which] = !$scope.filterCriteria[which];
            $scope.filter();
        };

        $scope.flipFilter = function() {
            $scope.toggleFilter('ask');
            $scope.toggleFilter('relate');
            $scope.toggleFilter('shoutout');
        };

        $scope.post = function(category) {
            $scope.input.category = category;
            PostService.query('POST', $scope.input)
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

        $scope.onRefresh();
    })

    // displaying of posts' comments
    .controller('PostCtrl', function ($scope, $stateParams, PostService, CommentService, ModalService) {
        $scope.input = { 'message': '' };

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