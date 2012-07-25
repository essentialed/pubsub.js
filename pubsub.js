/** PubSub.js 0.1

(c) 2012 Essential Education
*/

;(function(window, context, module_name, undefined) {
    var each, uid = 0,
        defaults = {
            'subtopic': false,
            'subtopic_marker': ':',
            'log': false
        };

    function PubSub(opts){

        return this.initialize();
    }

    function initialize(opts) {

        var settings = this.settings = {},
            o;

        for(o in defaults) {
            if (!defaults.hasOwnProperty(o)) { continue; }
            settings[o] = (opts && o in opts) ? opts[o] : defaults[o];
        }

        this.topics = {};

        this.topic_messages = {};

        return this;
    }

    function subscribe(topic, message, fn) {
        /* Subscribe to a topic
         * @topic - String - the topic, string
         * @message - Anything that can be used as an object key [Optional]
         * @fn - Function - the callback
         */

        var token = ''+uid++,
            t;

        if (typeof message === 'function' && fn === undefined) {
            fn = message;
            message = undefined;
        }

        if (typeof fn !== 'function') {
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
            'fn': fn,
            'token': token
        });

        this.log('PubSub.subscribe', topic, message, token, fn, this);

        return token;
    }

    function publish(topic, message, parent_topic) {
        var self = this,
            subscribers = this.topics[topic] || [],
            messages = this.topic_messages[topic],
            has_message = message !== undefined,
            message_subscribers = (has_message && messages) ?
                messages[message] || [] :
                [],
            publish_to = message_subscribers.concat(subscribers),
            settings = this.settings,
            subtopic_marker = settings.subtopic_marker,
            t = parent_topic || topic,
            subtopic;

        each(publish_to, function(subscriber) {
            subscriber.fn(message, t, subscriber.token);

            self.log('PubSub.publish', t, message, subscriber.fn);
        });

        if(settings.subtopic){
            subtopic = topic.split(subtopic_marker).slice(0, -1);

            if (subtopic.length) {
                this.publish(subtopic.join(subtopic_marker),
                     message, topic);
            }
        }

        return this;
    }

    function unsubscribe(token) {
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

    return context[module_name] = PubSub.call(PubSub);

})(this, this, 'PubSub');
