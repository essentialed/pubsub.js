/** PubSub.js 0.1 (c) 2012 Essential Education
**/

var PubSub = (function(window, undefined) {
    var each, puid = 0, slice = Array.prototype.slice,
        defaults = {
            'subtopics': true,
            'subtopic_marker': ':',
            'log': false
        };

    function PubSub(opts){
        /* PubSub Constructor
         *
         * @opts {Object} Options for the PubSub instance, extends defaults.
         *
         */

        return this.initialize(opts);
    }

    function initialize(opts) {
        /* Setup new PubSub instance, make sure we have everything we need.
         */

        var settings = this.settings = {},
            o;

        // Settings
        for(o in defaults) {
            if (!defaults.hasOwnProperty(o)) { continue; }
            settings[o] = (opts && o in opts) ? opts[o] : defaults[o];
        }

        // A place to store topic subscriptions.
        this.topics = {};

        // A place to store subscriptions with both a topic & a message.
        this.topic_messages = {};

        this.puid = puid++;

        this.token = 0;

        return this;
    }

    function subscribe(topic, message, cb, context) {
        /* Subscribe to a topic.
         *
         * @topic {String} The topic to subscribe to
         * @message {String|Number|Boolean} Subscribe to a specific message [Optional]
         * @cb {Function} Callback function
         * @context {Any} The context of the callback function.
         * @returns {String} The token for this subscription, needed for unsubscribing.
         *
         * PubSub.subscribe('new_message', function(subscription) {
         *   console.log('Message has been received:', subscription.message);
         * });
         *
         * PubSub.subscribe('new_message', 'Hello', function(subscription) {
         *   console.log('The message "Hello" has been received');
         * });
         *
         *
         */

        var token = ''+this.token++,
            t;

        if (typeof message === 'function' && (cb === undefined || context === undefined)) {
            context = cb;
            cb = message;
            message = undefined;
        }

        if (typeof cb !== 'function') {
            throw Error('PubSub.Subscribe: Callback is not a function.');
        }

        if (!this.topics[topic]) {
            this.topics[topic] = [];
            this.topic_messages[topic] = {};
        }

        if (message === undefined) {
            t = this.topics[topic];

        } else {
            t = this.topic_messages[topic][message] || (
                this.topic_messages[topic][message] = []);
        }

        t.push({
            'message': message,
            'topic': topic,
            'cb': cb,
            'token': token,
            'context': context
        });

        this.log('PubSub.subscribe', topic, message, token, cb, this);

        return token;
    }

    function publish(topic, message) {
        /* Publish to a topic.
         *
         * @topic {String} The topic
         * @message {String|Number} [Optional]
         * @returns {Object} The PubSub instance.
         *
         * PubSub.publish('new_message', 'Hello World!');
         *
         * PubSub.publish('new_message', 'Hello');
         *
         */

        var self = this,
            settings = this.settings,
            subtopic_marker = settings.subtopic_marker,
            subscribers = this.topics[topic] || [],
            messages = this.topic_messages[topic],
            message_subscribers = (messages && message !== undefined) ?
                messages[message] || [] :
                [],
            publish_to = message_subscribers.concat(subscribers),
            args = slice.call(arguments, 1),
            subtopic;

        each(publish_to, function(subscriber) {
            var subscription =  {
                    'topic': subscriber.topic,
                    'message': subscriber.message,
                    'token': subscriber.token
               }

            subscriber.cb.apply(subscriber.context || self,
                [ subscription ].concat(args));

            self.log('PubSub.publish', topic, message, subscriber.cb);
        });

        if(settings.subtopics){
            subtopic = topic.split(subtopic_marker).slice(0, -1);

            if (subtopic.length &&
                (subtopic = subtopic.join(subtopic_marker))) {

                this.publish.apply(this, [
                        subtopic
                    ].concat(args));
            }
        }

        return this;
    }

    function unsubscribe(token) {
        /* Unbsubscribe a specific subscriber from a topic.
         *
         * @token {String} The token of the subscriber
         *
         * PubSub.unsubscribe('2');
         *
         */

        var self = this,
            topics = [ this.topics, this.topic_messages ],
            r;

        each(topics, function(t) {
            each(t, function(topic) {
                each(topic, function(sub, c) {
                    if (sub.length) {
                        each(sub, function(s, c) {
                            return !check(s, sub, c);
                        });
                    } else {
                        return !check(sub, topic, c);
                    }

                    function check(o, a, i) {
                        if (o.token && o.token === token) {
                            r = token;
                            a.splice(i, 1);

                            self.log('PubSub.unsubscribe', token);

                            return true;
                        }

                        return false;
                    }
                });
            });
        });

        return r || false;
    }

    function remove(topic) {
        /* Unbsubscribe all subscribers from a topic.
         *
         * @topic {String} The topic we want to unsubscribe from.
         *
         * PubSub.unsubscribe('new_message');
         *
         *
         */

        var topics = [ this.topics, this.topic_messages ],
            subtopic_marker = this.settings.subtopic_marker;

        each(topics, function(t) {
            for (var k in t) {
                if (k.split(subtopic_marker)[0] === topic) {
                    delete t[k];
                }
            }
        });

        this.log('PubSub.remove', topic);

        return this;
    }

    function log(){
        var console = window.console;

        if(!this.settings.log || console === undefined){ return this; }

        console.log.apply(console,
            Array.prototype.slice.call(arguments, 0));

        return this;
    }

    PubSub.prototype.initialize = PubSub.initialize = initialize;
    PubSub.prototype.subscribe = PubSub.subscribe = subscribe;
    PubSub.prototype.unsubscribe = PubSub.unsubscribe = unsubscribe;
    PubSub.prototype.publish = PubSub.publish = publish;
    PubSub.prototype.remove = PubSub.remove = remove;
    PubSub.prototype.log = PubSub.log = log;

    each = (function() {
        var forEach = Array.prototype.forEach,
            objToString = Object.prototype.toString;

        return function each(obj, callback){
            var length = obj.length,
                isArray = length !== undefined || !isObj(obj),
                i;

            if (forEach && obj.forEach === forEach) {
                obj.forEach(callback);

            } else if (isArray) {
                for (; i < length;) {
                    if (callback(obj[i], i++) === false) {
                        break;
                    }
                }

            } else {
                for (i in obj) {
                    if (!obj.hasOwnProperty(i)) { continue; }
                    if (callback(obj[i], i) === false) {
                        break;
                    }
                }
            }
        };

        function isObj(obj) {
            return objToString.call(obj) === '[object Object]';
        }
    })();

    return PubSub.call(PubSub);
})(this);
