angular.module('informher.services', [])

/**
 * A simple example service that returns some data.
 */
    .factory('PostService', function () {
        // Might use a resource here that returns a JSON array


        // Some fake testing data
        var posts = [
            {
                id: 0,
                category: 'ask',
                title: 'Hello',
                author: 1,
                date: 1147483648,
                tags: ['childbirth', 'menstruation'],
                content: 'I have the D. What should I do?'
            },
            {
                id: 1,
                category: 'relate',
                title: 'Hello again',
                author: 2,
                date: 1147483648,
                tags: ['childbirth', 'menstruation'],
                content: 'I have the D. I should go. My planet needs me.'
            },
            {
                id: 2,
                category: 'ask',
                title: 'Hello',
                author: 3,
                date: 1147483648,
                tags: ['childbirth', 'menstruation'],
                content: 'I have the D. What should I do?'
            },
            {
                id: 3,
                category: 'shoutout',
                title: 'Hello again',
                author: 4,
                date: 1147483648,
                tags: ['childbirth', 'menstruation'],
                content: 'I have the D. I should go. My planet needs me.'
            },
            {
                id: 0,
                category: 'ask',
                title: 'Hello',
                author: 1,
                date: 1147483648,
                tags: ['childbirth', 'menstruation'],
                content: 'I have the D. What should I do?'
            },
            {
                id: 2,
                category: 'ask',
                title: 'Hello',
                author: 3,
                date: 1147483648,
                tags: ['childbirth', 'menstruation'],
                content: 'I have the D. What should I do?'
            },
            {
                id: 3,
                category: 'shoutout',
                title: 'Hello again',
                author: 4,
                date: 1147483648,
                tags: ['childbirth', 'menstruation'],
                content: 'I have the D. I should go. My planet needs me.'
            }
        ];

        return {
            get: function(id) {
                return _.select(posts, function(post) { return post.id == id; })[0];
            },
            filter: function(crit) {
                return posts;
                //return _.where(posts, crit);
            }
        }
    })
    .factory('TagService', function() {
        return {
            colorForTag: function(tag) {
                return {
                    bg: 'rgba(0, 0, 0, 0.25)',
                    fg: 'rgba(0, 0, 0, 1)'
                };
            }
        }
    })
;
