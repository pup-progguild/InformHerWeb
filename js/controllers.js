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
                            Auth.setCredentials($scope.input.username, $scope.input.password);
                            UserService.getProfile(response.user.id)
                                .then(function(response2) {
                                    if(response2.data.status == "USER_PROFILE_FETCH_SUCESS") {
                                        $scope.user = response2.data.profile;
                                        $scope.user.id = response.user.id;
                                        $scope.user.username = response.user.username;
                                        $scope.user.email = response.user.email;
                                        localStorage.setItem('informher-current-user', JSON.stringify($scope.user));
                                    }
                                    $state.go('stream.feed');
                                });
                            break;
                        case 'register':
                            $scope.registrationSuccessful = true;
                            $scope.displayInformationMessage(response.description, "Message: " + response.status);
                            break;
                        case 'logout':
                            Auth.clearCredentials();
                            $scope.user = null;
                            localStorage.removeItem('informher-current-user');
                            $state.go('home');
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
                username: 'ichi-san',
                email: '', // for register only
                password: 'one_one_one',
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
        $scope.input = {
            'title': 'Can I has extra napkinz?',
            'content': 'I has the menstrueishunzz.',
            'tags': ['education', 'health', 'news', 'moe'],
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
            console.log("TODO refresh");
        };

        PostService.query('GET:*')
            .then(function (response) {
                if (response.data.status == "POST_SHOW_SUCCESSFUL") {
                    $scope.posts = response.data.posts.result;

                    for(var i = 0, len = $scope.posts.length; i < len; i++) {
                        var post = $scope.posts[i];
                        post.visible = true;
                    }
                }
            });

        $scope.filter = function() {
            for(var i = 0, len = $scope.posts.length; i < len; i++) {
                var post = $scope.posts[i];
                post.visible = false;

                if(post.category.name == 'ask')
                    post.visible = $scope.filterCriteria.ask;
                if(post.category.name == 'relate')
                    post.visible = $scope.filterCriteria.relate;
                if(post.category.name == 'shoutout')
                    post.visible = $scope.filterCriteria.shoutout;
            }
        };

        $scope.toggleFilter = function(which) {
            $scope.filterCriteria[which] = !$scope.filterCriteria[which];
            $scope.filter();
        };

        $scope.post = function(category) {
            $scope.input.category = category;
            PostService.query('POST', $scope.input)
                .then(function (response) {
                    console.log(response);
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
    })

    // displaying of posts' comments
    .controller('PostCtrl', function ($scope, $stateParams, PostService, CommentService) {
        $scope.input = { 'message': '' };

        $scope.onRefresh = function() {
            console.log("TODO refresh");
        };

        $scope.addComment = function() {
            CommentService.query('POST:postId.+', $stateParams.postId, $scope.input)
                .then(function (response) {
                    console.log(response);
                    if(response.data.status == "POST_COMMENT_CREATE_SUCCESS")
                        $scope.post.comments.unshift(response.data.comment.result[0]);
                });
        };

        PostService.query('GET:postId', $stateParams.postId)
            .then(function (response) {
                if (response.data.status == "POST_SHOW_SUCCESSFUL") {
                    $scope.post = response.data.posts;

                    CommentService.query('GET:postId.*', $stateParams.postId)
                        .then(function (response) {
                            if (response.data.status == "POST_COMMENT_RETRIEVE_SUCCESSFUL") {
                                $scope.post.comments = response.data.comment.result;
                                console.log($scope.post.comments);
                            }
                        });
                }
            })
        ;
    })

    .controller('UserCtrl', function ($scope, $stateParams, UserService) {

    })
;