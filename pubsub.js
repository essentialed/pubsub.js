/*!*
 * pubsub.js 0.3.0
 *
 * A Pub/Sub messaging system with topics, sub-topics, and messages.
 *
 * @see https://github.com/essentialed/pubsub.js
 * @author rudasn@gmail.com (Nicolas Rudas)
 * @license GPLv3
 *
 * Copyright (c) 2014 Essential Education
 */

(function(window, scope, undefined) {
    var slice = Array.prototype.slice,
        puid = 0,
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
        var t, sub = {
                'topic': '' + opts.topic,
                'message': opts.message,
                'cb': opts.callback,
                'context': opts.context,
                'token': '' + this.token++
            };

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
        var subtopic,
            settings = this.settings,
            subscribers = this.topics[topic] || [],
            messages = this.topic_messages[topic],
            message_subscribers = (messages && message !== undefined) ?
                messages[message] || [] :
                [],
            args = slice.call(arguments, 1),
            subscription, subscriber, i;

        while (subscribers.length) {
            pub.call(this, subscribers.shift());
        }

        while (message_subscribers.length) {
            pub.call(this, message_subscribers.shift());
        }

        if (settings.subtopics) {
            subtopic = topic.substring(0,
               topic.lastIndexOf(settings.subtopic_marker));

            if (subtopic) {
                this.publish.apply(this, [subtopic].concat(args));
            }
        }

        return this;

        function pub(subscriber) {
            this.log('PubSub.publish', subscriber);

            subscriber.cb.apply(subscriber.context || this,
                [subscriber].concat(args));
        }
    };

    /**
     * Unbsubscribe either by topic (multiple subscribers) or by token
     * (one subscriber).
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
            topics = this.topics,
            topic_messages = this.topic_messages,
            subtopic_marker = this.settings.subtopic_marker,
            topic_len = opts.topic ? opts.topic.length + 1 : 0,
            topic_w_marker = opts.topic ? opts.topic + subtopic_marker : '',
            count = 0,
            topic, messages, message;

        for (topic in topics) {
            if (checkSubscribers(topics[topic])) { break; }
        }

        for (topic in topic_messages) {
            messages = topic_messages[topic];

            for (message in messages) {
                if (checkSubscribers(messages[message])) { break; }
            }
        }

        return count;

        function checkSubscribers(subscribers) {
            var i = 0, l = subscribers.length, subscriber;

            for (; i < l; i++) {
                subscriber = subscribers[i];

                if ((opts.token && subscriber.token === opts.token) ||
                        (opts.topic && (subscriber.topic === opts.topic ||
                            subscriber.topic.substring(0, topic_len) ===
                                topic_w_marker))) {

                    subscribers.splice(i, 1);
                    // Our array is changing so keep up.
                    i--; l--;

                    count++;

                    self.log('PubSub.unsubscribe', subscriber);

                    // No need to continue the search if unsubscribing by token as
                    // there's only one subscriber.
                    if (opts.token) { return true; }
                }
            }
        }
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

        console.log.apply(console, slice.call(arguments, 0));

        return this;
    };

    scope.PubSub = P.call(P);

})(this, this);
