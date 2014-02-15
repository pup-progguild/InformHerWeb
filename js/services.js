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
                author: 'Temoko-chan',
                date: 1147483648,
                tags: ['childbirth', 'menstruation'],
                content: 'I have the D. What should I do?'
            },
            {
                id: 1,
                category: 'relate',
                title: 'Hello again',
                author: 'Temoko-chan',
                date: 1147483648,
                tags: ['childbirth', 'menstruation'],
                content: 'I have the D. I should go. My planet needs me.'
            },
            {
                id: 2,
                category: 'ask',
                title: 'Hello',
                author: 'Temoko-chan',
                date: 1147483648,
                tags: ['childbirth', 'menstruation'],
                content: 'I have the D. What should I do?'
            },
            {
                id: 3,
                category: 'shoutout',
                title: 'Hello again',
                author: 'Temoko-chan',
                date: 1147483648,
                tags: ['childbirth', 'menstruation'],
                content: 'I have the D. I should go. My planet needs me.'
            }
        ];

        return {
            all: function() {
                return posts;
            },
            get: function(id) {
                for(var i = 0, len = posts.length; i < len; i++)
                    if(posts[i].id == id)
                        return posts[i];
                return {};
            },
            filter: function(crit) {
                var f = [];
                for(var i = 0, len = posts.length; i < len; i++)
                    if(crit.category == posts[i].category)
                        f.push(posts[i]);
                return f;
            }
        }
    });
