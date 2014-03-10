angular.module('informher.controllers', [])
    .controller('AuthCtrl', function ($scope, $state, ApiService, UserService, Auth, ModalService, MessageService, Base64, PersistenceService) {
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
                        $scope.showScreenMessage('ERR_INVALID_USERNAME', false);
                        return;
                    case !($scope.input.email != ''): // check if email is invalid
                        $scope.hideLoading();
                        $scope.showScreenMessage('ERR_INVALID_EMAIL_ADDRESS', false);
                        return;
                    case !($scope.input.passwordRegister.length >= 6):
                        $scope.hideLoading();
                        $scope.showScreenMessage('ERR_SHORT_PASSWORD', false);
                        return;
                    case !($scope.input.password == $scope.input.passwordConfirmation):
                        $scope.hideLoading();
                        $scope.showScreenMessage('ERR_PASSWORDS_DO_NOT_MATCH', false);
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
                            $scope.hideLoading();
                            $scope.showScreenMessage(response.status, false);
                            if(response.status == "USER_CREATE_SUCCESSFUL")
                                $state.go('home');
                            break;
                        case 'logout':
                            if(response.status == "USER_LOGGED_OUT_SUCCESS") {
                                Auth.clearCredentials();
                                $scope.currentUser = null;
                                PersistenceService.put('global', 'current-user', null);
                                PersistenceService.clear('stream');
                                PersistenceService.clear('admin');

                                $scope.hideLoading();
                                $scope.showScreenMessage(response.status, false);
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
                    $scope.showScreenMessage(response.status, false);
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
                agree: false // for register only,
            };
        };

        $scope.openTouModal = function() {
            ModalService.openModal('modal-tou');
        };

        $scope.reset('login');
        ModalService.loadModal('modal-tou', 'modals/tos.html', $scope);
    })

    // displaying of stream's posts
    .controller('StreamCtrl', function ($scope, PersistenceService, PostService, ModalService) {
        // fields unmodifiable by the user
        $scope.posts = [];

        // === Components ===
        $scope.isLeftMenuShown = function() {
            //return $scope.sideMenuController._leftShowing;
            // TODO read ionic docs
        };

        $scope.toggleLeft = function () {
            $scope.sideMenuController.toggleLeft();
            console.log($scope.sideMenuController.isOpen());
        };

        $scope.openModal = function(key) {
            ModalService.openModal(key);
        };

        ModalService.loadModal('modal-ask', 'modals/ask.html', $scope);
        ModalService.loadModal('modal-relate', 'modals/relate.html', $scope);
        ModalService.loadModal('modal-shoutout', 'modals/shoutout.html', $scope);
        ModalService.loadModal('modal-search', 'modals/search.html', $scope);

        // === Stream mode ===

        $scope.streamMode = PersistenceService.get('stream', 'mode') || 'main';

        $scope.recallPosts = function() {
            $scope.posts = [];
            $scope.posts = $scope.filter(PersistenceService.get('stream', $scope.streamMode)) || [];
        };
        $scope.getStreamMode = function() { $scope.streamMode = PersistenceService.get('stream', 'mode'); };

        $scope.setStreamMode = function(mode) { PersistenceService.put('stream', 'mode', $scope.streamMode = mode); };

        $scope.prevPage = PersistenceService.get('stream', $scope.streamMode + '-previous-page') || 1;
        $scope.nextPage = PersistenceService.get('stream', $scope.streamMode + '-next-page') || 1;

        $scope.searchMode = PersistenceService.get('stream', 'is-search-mode') || false;
        $scope.getSearchMode = function() { return $scope.searchMode; };
        $scope.setSearchMode = function(b) {
            PersistenceService.put('stream', 'is-search-mode', $scope.searchMode = b);
            $scope.setStreamMode(b ? (($scope.approveMode ? 'approve-' : '') + 'search-results') : 'main');
            $scope.posts = [];
            $scope.recallPosts();
        };

        $scope.approveMode = PersistenceService.get('stream', 'is-approve-mode') || false;
        $scope.getApproveMode = function() {
            return $scope.approveMode;
        };
        $scope.setApproveMode = function(b) {
            PersistenceService.put('stream', 'is-approve-mode', $scope.approveMode = b);
            $scope.setStreamMode(b ? ('approve' + ($scope.approveMode ? '-search-results' : '')) : 'main');
            $scope.posts = [];
            $scope.recallPosts();
        };

        // Persist
        //$scope.setSearchMode($scope.searchMode);
        //$scope.setApproveMode($scope.approveMode);



        // === Menu mode ===
        $scope.menuMode = ['mode:'];

        $scope.isRootMenuMode = function() {
            return $scope.getAbsoluteMenuModePath() == "mode:";
        };

        $scope.getAbsoluteMenuModePath = function() {
            return $scope.menuMode.join('/');
        };

        $scope.getMenuMode = function() {
            return _.last($scope.menuMode);
        };

        $scope.getParentMenuModePath = function() {
            return $scope.getParentMenuModes().join("/");
        };

        $scope.getParentMenuModes = function() {
            return _.initial($scope.menuMode);
        };

        $scope.inMode = function(mode) {
            return $scope.getAbsoluteMenuModePath() == mode;
        };

        $scope.enterMenuMode = function(menuMode) {
            $scope.menuMode.push(menuMode);
        };

        $scope.leaveMenuMode = function() {
            if($scope.getAbsoluteMenuModePath() != "mode:")
                $scope.menuMode.pop();
        };

        $scope.goToMenuMode = function(menuModePath) {
            if(_.str.startsWith($scope.getAbsoluteMenuModePath(), "mode:") || _.str.startsWith($scope.getAbsoluteMenuModePath(), "/"))
                while(!$scope.isRootMenuMode())
                    $scope.leaveMenuMode();
            var menuModes = menuModePath.split('/');
            for(var i in menuModes) {
                var menuMode = menuModes[i];
                if(menuMode == "..")
                    $scope.leaveMenuMode();
                else if(menuMode != ".")
                    $scope.enterMenuMode(menuMode);
            }
        };

        $scope.isVisible = function(menuItem) {
            switch(menuItem) {
                case 'ask':
                case 'relate':
                case 'shoutout':
                case 'back':
                    return $scope.inMode("mode:/new-post")
                        || $scope.inMode("mode:/filter")
                        || $scope.inMode("mode:/approve/filter")
                        || (menuItem == 'back' && $scope.inMode("mode:/approve"));
                case 'search-results':
                    return $scope.inMode("mode:/filter")
                        || $scope.inMode("mode:/approve/filter");
                case 'search':
                case 'filter':
                    return $scope.inMode("mode:")
                        || $scope.inMode("mode:/approve");
                default:
                    return $scope.inMode("mode:");
            }
        };

        $scope.doAction = function(menuItem) {
            switch(menuItem) {
                case 'ask':
                case 'relate':
                case 'shoutout':
                    if($scope.inMode("mode:/new-post")) {
                        $scope.resetInput();
                        $scope.openModal('modal-' + menuItem);
                    }
                    else if($scope.inMode("mode:/filter"))
                        $scope.toggleFilter(menuItem);
                    break;
                case 'search-results':
                    $scope.toggleSearchMode();
                    break;
                case 'search':
                    $scope.openModal('modal-' + menuItem);
                    break;
                case 'back':
                    if($scope.inMode("mode:/approve"))
                        $scope.approveMode = false;
                    $scope.leaveMenuMode();
                    break;
                case 'approve':
                    $scope.approveMode = true;
                    $scope.enterMenuMode(menuItem);
                    break;
                default:
                    $scope.enterMenuMode(menuItem);
            }
        };



        // === Posts and caching ===

        $scope.onRefresh = function() {
            $scope.refreshNewer()
                .then(function() {
                    $scope.$emit('scroll.refreshComplete');
                });
        };

        $scope.refreshNewer = function() {
            return $scope.refreshPage(false, $scope.nextPage, function() {
                $scope.updatePage();
                $scope.nextPage++;
            }, function() {
                $scope.nextPage--;
            });
        };

        $scope.refreshOlder = function(showLoading) {
            if(showLoading)
                $scope.showLoading('', false);
            return $scope.refreshPage(true, $scope.prevPage, function() {
                if($scope.prevPage > 0)
                    $scope.prevPage--;
                $scope.updatePage();
            })
                .then(function() { if(showLoading) $scope.hideLoading(); });
        };

        $scope.refreshPage = function(isPush, page, success, error) {
            return PostService.query('get page($0).posts', page)
                .then(function (response) {
                    if (response.data.status == "POST_SHOW_SUCCESSFUL") {
                        var newPosts = response.data.posts.data;

                        for(var i = newPosts.length - 1, len = 0; i >= len; i--) {
                            var newPost = newPosts[i];
                            if(_.find($scope.posts, function(post) { return post.id == newPost.id }) === undefined) {
                                newPost.visible = false;
                                $scope.posts[isPush ? 'push' : 'unshift'](newPost);
                            }
                        }

                        $scope.filter();
                        $scope.rememberPosts();
                        if(success instanceof Function)
                            success(response);
                    }
                    else if(error instanceof Function)
                        error(response);
                });
        };

        $scope.refreshSearch = function(success, error) {
            var requestData = {};
            var all = $scope.searchInput.title
                && $scope.searchInput.author
                && $scope.searchInput.content
                && $scope.searchInput.tags;
            if(all)
                requestData.all = '';
            else {
                var flags = ['title', 'author', 'content', 'tags'];
                for(var i in flags) {
                    var flag = flags[i];
                    if($scope.searchInput[flag])
                        requestData[flag] = '';
                }
            }

            return PostService.search($scope.searchInput.queryString, requestData)
                .then(function(response) {
                    if (response.data.status == "POST_SEARCH_SUCCESSFUL") {
                        var newPosts = response.data.posts;


                        for(var i = newPosts.length - 1, len = 0; i >= len; i--) {
                            var newPost = newPosts[i];
                            if(_.find($scope.posts, function(post) { return post.id == newPost.id }) === undefined) {
                                newPost.visible = false;
                                $scope.posts['unshift'](newPost); // XXX COMPAT!!!!
                            }
                        }

                        $scope.filter();
                        $scope.rememberPosts();
                        if(success instanceof Function)
                            success(response);
                    }
                    else {
                        error(response);
                    }
                });
        };

        $scope.updatePage = function() {
            PersistenceService.put('stream', $scope.streamMode + '-previous-page', $scope.prevPage);
            PersistenceService.put('stream', $scope.streamMode + '-next-page', $scope.nextPage);
        };

        $scope.forgetPosts = function() {
            PersistenceService.remove('stream', 'search-results');
        };

        $scope.rememberPosts = function() {
            PersistenceService.put('stream', $scope.streamMode, $scope.posts);
        };

        $scope.initStream = function() {
            $scope.showLoading();
            if($scope.getSearchMode())
                $scope.refreshSearch(
                    function() { $scope.hideLoading(); $scope.hasSearched = true; },
                    function(response) { $scope.hideLoading(); $scope.showScreenMessage(response.data.status) }
                );
            else
                $scope.refreshNewer().then(function() { $scope.refreshOlder(false).then(function() { $scope.hideLoading(); }); });
        };

        // === Filtering ===

        $scope.filter = function(posts) {
            posts = posts || $scope.posts;
            posts = _.reject(posts, function(post) { return post == null || post === undefined; });
            for(var i = 0, len = posts.length; i < len; i++) {
                var post = posts[i];
                post.visible = false;
                post.visible = $scope.getSearchMode() ? $scope.searchInput[post.category.name] : $scope.filterCriteria[post.category.name];
            }
            return posts;
        };

        $scope.toggleFilter = function(which) {
            $scope.filterCriteria[which] = !$scope.filterCriteria[which];
            $scope.searchInput[which] = $scope.filterCriteria[which];
            $scope.filter();
        };

        $scope.search = function() {
            ModalService.closeModal();
            $scope.showLoading();
            $scope.forgetPosts();
            $scope.initStream();
        };

        $scope.toggleSearchMode = function() {
            $scope.setSearchMode(!$scope.getSearchMode());
            $scope.search();
        };

        $scope.filterCriteria = {
            ask: true,
            relate: true,
            shoutout: true
        };

        $scope.resetInput = function() {
            $scope.input = {
                title: '',
                tags: [],
                content: '',
                track: false,
                contact: false,
                urgent: false
            };
        };

        $scope.hasSearched = false;

        $scope.searchInput = $scope.searchInput || {
            queryString: '',
            title: true,
            author: false,
            content: false,
            tags: false,
            ask: true,
            relate: true,
            shoutout: true
        };



        // === Creation ===

        $scope.addTag = function(tag) {
            $scope.input.tags.push(tag);
        };

        $scope.submitPost = function(category) {
            var input = { category: category };
            switch(category) {
                case 'ask':
                case 'relate':
                    input = _.extend(input, _.pick($scope.input, 'title', 'tags', 'content'));
                    if($scope.trackLocation)
                        input.geolocation = $scope.currentUser.coords;
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
                                    messageArray.push('"location":"' + $scope.currentUser.coords + '"');
                                    break;
                                case 'contact':
                                    var hasEmail = $scope.input.email != '';
                                    var hasMobile = $scope.input.mobile != '';
                                    messageArray.push('"email":"' + $scope.input.email + '"');
                                    messageArray.push('"mobile":"' + $scope.input.mobile + '"');
                                    break;
                                case 'urgent':
                                    messageArray.push('"urgent":true');
                                    break;
                            }
                        }
                    input.title = flagArray.join(', ');
                    input.content = "{" + messageArray.join(',') + "}";
                    input.tags = $scope.input.tags;
                    break;
            }
            $scope.showLoading('POST_ADD', true);
            PostService.query('new post', input)
                .then(function (response) {
                    $scope.hideLoading();
                    $scope.showScreenMessage(response.data.status, false);
                    if(response.data.status == "POST_ADD_SUCCESSFUL") {
                        ModalService.closeModal();
                        $scope.refreshNewer();
                    }
                });
        };

        if($scope.getStreamMode() === undefined)
            $scope.setStreamMode('main');

        $scope.recallPosts();

        PostService.query('get page($0).posts', 1)
            .then(function (response) {
                if (response.data.status == "POST_SHOW_SUCCESSFUL") {
                    $scope.nextPage = response.data.posts['last_page'];
                    $scope.prevPage = response.data.posts['last_page'] - 1;
                    if($scope.prevPage < 0)
                        $scope.prevPage = 0;

                    $scope.updatePage();
                    $scope.initStream();
                }
                else {
                    $scope.showScreenMessage(response.data.status, false);
                }
            });


    })

    // displaying of posts' comments
    .controller('PostCtrl', function ($scope, $stateParams, PostService, CommentService, ModalService, PersistenceService) {
        $scope.input = { 'message': '' };
        $scope.editPost = {};

        $scope.onRefresh = function() {
            $scope.refreshNewer()
                .then(function() {
                    $scope.$emit('scroll.refreshComplete');
                });
        };

        $scope.refreshNewer = function() {
            return $scope.refreshPage(true, $scope.nextPage, function() {
                $scope.nextPage++;
            });
        };

        $scope.refreshOlder = function(showLoading) {
            if(showLoading)
                $scope.showLoading('', false);
            return $scope.refreshPage(true, $scope.prevPage, function() {
                if($scope.prevPage > 0)
                    $scope.prevPage--;
            })
                .then(function() { $scope.hideLoading(); });
        };

        $scope.refreshPage = function(isPush, page, success, error) {
            return CommentService.query('get post($0).page($1).comments', $stateParams.postId, page)
                .then(function (response) {
                    if (response.data.status == "POST_COMMENT_RETRIEVE_SUCCESSFUL") {
                        var newComments = response.data.comment.data;

                        for(var i = newComments.length - 1, len = 0; i >= len; i--) {
                            var newComment = newComments[i];
                            if(_.find($scope.post.comments, function(comment) { return comment.id == newComment.id }) === undefined) {
                                $scope.post.comments[isPush ? 'push' : 'unshift'](newComment);
                            }
                        }

                        if(success instanceof Function)
                            success();
                    }
                    else if(error instanceof Function)
                        error();
                });
        };

        $scope.onRefresh = function() {
            $scope.refreshNewer()
                .then(function() {
                    $scope.$broadcast('scroll.refreshComplete');
                });
        };

        $scope.addComment = function() {
            CommentService.query('new post($0).comment', $stateParams.postId, { 'message': $scope.input.message })
                .then(function (response) {
                    console.log(response);
                    if(response.data.status == "POST_COMMENT_CREATE_SUCCESS") {
                        $scope.post.comments.unshift(response.data.comment[0]);
                    }
                });
            $scope.input.message = '';
        };

        $scope.likePost = function() {
            var initial = $scope.post.liked;
            $scope.post.liked = !$scope.post.liked;
            PostService.query('like post($0)', $stateParams.postId, {})
                .then(function(response) {
                    if(response.data.status == "POST_CREATE_LIKE_SUCCESS") {
                        $scope.post.liked = _.contains(response.data.likes, $scope.currentUser.user_id);
                    }
                    else {
                        $scope.showScreenMessage(response.data.status);
                        $scope.post.liked = initial;
                    }
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
            ModalService.openModal('modal-edit');
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

                    for(var flagKey in flags) {
                        if(flags[flagKey])
                            flagArray.push(flagKey.toUpperCase());
                        switch(flagKey) {
                            case 'track':
                                messageArray.push('location:' + ($scope.input.track ? $scope.currentUser.coords : 'null'));
                                break;
                            case 'contact':
                                var hasEmail = $scope.input.email != '';
                                var hasMobile = $scope.input.mobile != '';
                                messageArray.push('email:' + (hasEmail ? $scope.input.email : 'null'));
                                messageArray.push('mobile:' + (hasMobile ? $scope.input.mobile : 'null'));
                                break;
                            case 'urgent':
                                messageArray.push('urgent:' + $scope.input.urgent);
                                break;
                        }
                    }
                    input.title = flagArray.join(', ');
                    input.content = "{" + messageArray.join(',') + "}";
                    input.tags = $scope.input.tags;
                    break;
            }
            $scope.showLoading('POST_UPDATE', true);
            PostService.query('update post($0) = $1', $stateParams.postId, input)
                .then(function (response) {
                    $scope.hideLoading();
                    $scope.showScreenMessage(response.data.status, false);
                    if(response.data.status == "POST_UPDATE_SUCCESSFUL") {
                        $scope.post.content = input.content;
                        ModalService.closeModal();
                    }
                });
        };

        $scope.showLoading('', true);

        // retrieving post!!!
        var post = PostService.getPost($stateParams.postId);
        if(post.category.name == "shoutout")
            post = _.extend(post, JSON.parse(post.content));
        console.log(post);
        $scope.post = post;
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
                    tags: _.pluck($scope.post.tags, 'tagname'),
                    track: $scope.post.location !== undefined,
                    urgent: $scope.post.urgent,
                    contact: $scope.post.email !== undefined || $scope.post.mobile !== undefined,
                    email: $scope.post.email || '',
                    mobile: $scope.post.mobile || ''
                };
                break;
        }

        $scope.deleteConfirm = function(which, id) {
            $scope.deleteType = which;
            $scope.deleteId  = id;
            ModalService.openModal('modal-delete');
        };

        $scope.doDeletePost = function() {
            $scope.showLoading('POST_DELETE', true);
            PostService.query('delete post($0)', $stateParams.postId)
                .then(function(response) {
                    $scope.showScreenMessage(response.data.status, false);
                    if(response.data.status == "POST_DELETE_SUCCESSFUL") {
                        var posts = PersistenceService.get('stream', PersistenceService.get('stream', 'mode'));
                        for(var i = 0, len = posts.length; i < len; i++) {
                            if(posts[i].id == $stateParams.postId) {
                                delete posts[i];
                                PersistenceService.put('stream', PersistenceService.get('stream', 'mode'), posts);
                                break;
                            }
                        }
                        $scope.goBack();
                    }
                });
        };

        /*
        $scope.doDeleteComment = function(id) {
            CommentService.query('delete post($0).comment($1)', $stateParams.postId, id)
                .then(function(response) {
                    console.log(response);
                });
        };
        */

        ModalService.loadModal('modal-edit', 'modals/' + $scope.post.category.name + '.html', $scope);
        ModalService.loadModal('modal-delete', 'modals/delete.html', $scope);

        CommentService.query('get post($0).page($1).comments', $stateParams.postId, 1)
            .then(function (response) {
                if (response.data.status == "POST_COMMENT_RETRIEVE_SUCCESSFUL") {
                    $scope.nextPage = response.data.comment['last_page'];
                    $scope.prevPage = response.data.comment['last_page'];
                    if($scope.prevPage < 0)
                        $scope.prevPage = 0;
                    $scope.refreshNewer().then(function() { $scope.refreshOlder(false); });
                }
                else {
                    $scope.showScreenMessage(response.data.status, false);
                }

                PostService.query('get post($0).likes', $stateParams.postId)
                    .then(function(response) {
                        if(response.data.status == "POST_LIKES_RETRIEVE_SUCCESSFUL")
                            $scope.post.liked = _.contains(response.data.likes, $scope.currentUser.user_id);
                        if(post.category.name == "shoutout") {
                            post = _.extend(post, JSON.parse(post.content));
                            if(post.location !== undefined) {
                                var coordsRaw = post.location.split(',');
                                var x = coordsRaw[0],
                                y = coordsRaw[1];
                                var map = L.map('map').setView([x, y], 13);
                                L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                }).addTo(map);

                                L.marker([x, y]).addTo(map)
                            }
                        }
                    })
            })
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