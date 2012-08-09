// Copyright 2012 Essential Education

/**
 * @fileoverview pubsub.js 0.2.0.
 * A Pub/Sub messaging system for your JavaScript apps with topics, sub-topics,
 *  and messages.
 *
 * @see https://github.com/essentialed/pubsub.js
 * @author rudasn@gmail.com (Nicolas Rudas)
 * @author wendallc@83864.com (Wendall Cada)
 */

var PubSub = this.PubSub || (function(window, undefined) {
    var each,
        puid = 0,
        slice = Array.prototype.slice,
        defaults = {
            'subtopics': true,
            'subtopic_marker': ':',
            'log': false
        };

    /**
     * PubSub
     *
     * @param {object} opts Options for the PubSub instance, extends defaults.
     * @constructor
     * @return {object} PubSub instance.
     *
     */
    function P(opts) {


        return this.__init__(opts);
    }

    /**
     * Subscribe to a topic.
     *
     * @param {string} opts.topic The topic to subscribe to.
     * @param {string|number|boolean} opts.message Subscribe to a specific
     *      message (optional).
     * @param {function} opts.callback The callback function.
     * @param {Any} opts.context The context of the callback function.
     *
     * @return {string} The token for this subscription, needed for
     *      unsubscribing.
     */
    P.prototype.subscribe = P.subscribe = function subscribe(opts) {

        var sub = {
                'topic': '' + opts.topic,
                'message': opts.message,
                'cb': opts.callback,
                'context': opts.context,
                'token': '' + this.token++
            },
            t;


        if (!this.topics[sub.topic]) {
            this.topics[sub.topic] = [];
            this.topic_messages[sub.topic] = {};
        }

        if (sub.message === undefined) {
            t = this.topics[sub.topic];

        } else {
            sub.message = '' + sub.message;

            t = this.topic_messages[sub.topic][sub.message] || (
                this.topic_messages[sub.topic][sub.message] = []);
        }

        t.push(sub);

        this.log('PubSub.subscribe', sub);

        return sub.token;
    };

    /**
     * Publish to a topic.
     *
     * @param {string} topic The topic.
     * @param {string|number} message The message to publish (optional).
     *
     * @return {object} The PubSub instance.
     */
    P.prototype.publish = P.publish = function publish(topic, message) {

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
            var subscription = {
                    'topic': subscriber.topic,
                    'message': subscriber.message,
                    'token': subscriber.token
               };

            subscriber.cb.apply(subscriber.context || self,
                [subscription].concat(args));

            self.log('PubSub.publish', topic, message, subscriber.cb);
        });

        if (settings.subtopics) {
            subtopic = topic.split(subtopic_marker).slice(0, -1);

            if (subtopic.length &&
                (subtopic = subtopic.join(subtopic_marker))) {

                this.publish.apply(this, [
                        subtopic
                    ].concat(args));
            }
        }

        return this;
    };

    /**
     * Unbsubscribe a specific subscriber from a topic.
     *
     * @param {object} opts.token The token of the subscriber to be removed.
     * @param {object} opts.topic The name of the topic to be removed.
     *
     * @return {number} The number of removed subscribers.
     */
    P.prototype.unsubscribe = P.unsubscribe = function unsubscribe(opts) {
        opts = opts || {};
        opts.topic = opts.topic ? '' + opts.topic : undefined;
        opts.token = opts.token ? '' + opts.token : undefined;

        var self = this,
            topics = [this.topics, this.topic_messages],
            subtopic_marker = this.settings.subtopic_marker,
            topic_len = opts.topic ? opts.topic.length + 1 : 0,
            topic_w_marker = opts.topic ? opts.topic + subtopic_marker : '',
            count = 0;

        if (opts.token) {
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
                        if (o.token && o.token === opts.token) {
                            a.splice(i, 1);

                            count++;

                            self.log('PubSub.unsubscribe', o);

                            return true;
                        }

                        return false;
                    }
                });
            });
            });
        }

        if (opts.topic) {
            each(topics, function(t) {
                for (var k in t) {
                    if (k === opts.topic ||
                          k.substring(0, topic_len) === topic_w_marker) {
                        delete t[k];

                        count++;

                        self.log('PubSub.unsubscribe', t[k]);
                    }
                }
            });
        }

        return count;
    };

    /**
     * A logger method using console.log.
     *
     * @param {any} The message to log.
     * @return {object} The PubSub instance.
     */
    P.prototype.log = P.log = function log() {
        var console = window.console;

        if (!this.settings.log || console === undefined) { return this; }

        console.log.apply(console, slice.call(arguments, 0).concat[this]);

        return this;
    };

    /**
     * Setup new PubSub instance, make sure we have everything we need.
     * You shouldn't be calling this directly.
     *
     * @param {object} opts Options for this PubSub instance.
     * @return {object} The PubSub instance.
     */
    P.prototype.__init__ = P.__init__ = function init(opts) {
        var settings = this.settings = {},
            o;

        // Create and extend our settings property.
        for (o in defaults) {
            if (!defaults.hasOwnProperty(o)) { continue; }
            settings[o] = (opts && o in opts) ? opts[o] : defaults[o];
        }

        // A place to store topic subscriptions.
        this.topics = {};

        // A place to store subscriptions with both a topic & a message.
        this.topic_messages = {};

        // Unique ID for this PubSub instance.
        this.puid = puid++;

        // Each PubSub instance has its own token counter.
        this.token = 0;

        return this;
    };

    each = (function() {
        var forEach = Array.prototype.forEach,
            objToString = Object.prototype.toString;

        return function each(obj, callback) {
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

    return P.call(P);

})(this);
