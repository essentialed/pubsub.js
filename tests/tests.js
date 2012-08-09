var test_counts = 0, data_set_size = 3500;

var pubsub_instance = new PubSub(),
    pubsub_instance_no_subtopics = new PubSub({
        'subtopics': false
    });

startTest(PubSub, 'PubSub');
startTest(pubsub_instance, 'PubSub Instance');
startTest(pubsub_instance_no_subtopics, 'PubSub Instance (No subtopics)');


function startTest(PubSub, title) {
    test_counts++;

    var pubsub_data,
        published = [],
        has_subtopics = PubSub.settings.subtopics;

    pubsub_data = generateData(PubSub);

    module(title + ' ('+ PubSub.puid +')');

    test('Initialize', function() {

        ok(PubSub, title + ' exists');

        equal(typeof PubSub.settings.subtopics, typeof true, 'settings.subtopic is a boolean => ' + PubSub.settings.subtopics);
        equal(typeof PubSub.settings.subtopic_marker, typeof '', 'settings.subtopic_marker is a string => '+ PubSub.settings.subtopic_marker);
        equal(typeof PubSub.settings.log, typeof true, 'settings.log is a boolean => '+ PubSub.settings.log );
    });

    module(title+ ' ('+ PubSub.puid +')');

    test('Data', function() {

        ok(count(pubsub_data.data), 'Data generated for ' + title);
    });

    test('Token', function() {
        // Set-up
        var token = PubSub.subscribe({
            'topic': 'a topic',
            'callback': cb
        });

        pubsub_data.push(token);

        // Tests
        expect(3);

        deepEqual(token,  ''+ (data_set_size + 1)  , 'Subscribe method returns the token');

        deepEqual(pubsub_data.data[23].token, '23', 'Test data #23 has token #23');

        deepEqual(pubsub_data.data[239].token, '239', 'Test data #239 has token #239');
    });

    test('Subscribe', function() {

        // Set-up
        var subscribers = PubSub.topics,
            subscribers_with_messages = PubSub.topic_messages,
            subscribers_length = count(subscribers),
            subscribers_with_messages_length = count(subscribers_with_messages);

        // Tests
        expect(11);

        deepEqual(subscribers_length, pubsub_data.data.length,
            'topic array is created and incremented OK');

        deepEqual(subscribers_with_messages_length, pubsub_data.data.length,
            'topic_messages array is created and incremented OK');

        deepEqual(pubsub_data.data[42],
            subscribers['Parent Topic:'+pubsub_data.topic + '42'][0],
            'Subscribers with no message appear only in topics');

        deepEqual({}, subscribers_with_messages['Parent Topic:'+pubsub_data.topic + '42'],
            'Subscribers with no message appear only in topics');

        deepEqual(pubsub_data.data[43],
            subscribers_with_messages[pubsub_data.topic + '43'][pubsub_data.message + '43'][0],
            'Subscribers with message appear only in topic_messages');

        deepEqual([],
            subscribers[pubsub_data.topic + '43'],
            'Subscribers with message appear only in topic_messages');

        // Context
        var context = {
                'any_object': 'can be a context'
            };

        PubSub.subscribe({
            'topic': 'subscribe with context',
            'message': 'and a message',
            'context': context,
            'callback': function(sub) {
                deepEqual( context, this, '"this" in the callback is the context passed (last argument when subscribing)' );

                deepEqual( sub.message, 'and a message', 'Providing context does not influence other things' );
            }
        });

        PubSub.subscribe({
            'topic': 'subscribe only with context',
            'context': context,
            'callback': function(sub, message) {
                deepEqual( context, this, '"this" in the callback is the context passed (last argument when subscribing)' );

                deepEqual( message, 'another message', 'Providing context does not influence other things, like messages' );
            }
        });

        PubSub.subscribe({
            'topic': 'subscribe with no context',
            'callback': function(sub) {
                deepEqual( PubSub, this, '"this" in the callback is the PubSub instance if no context is passed' );
            }
        });

        PubSub.publish('subscribe with context', 'and a message');

        PubSub.publish('subscribe only with context', 'another message');

        PubSub.publish('subscribe with no context');
    });

    test('Publish', function() {

        expect(4);

        equal(count(published), 0, 'No publications yet');

        PubSub.publish('Parent Topic:Topic #40');

        equal(count(published), 1, 'First publication ("Parent Topic:Topic #40")');


        PubSub.publish('Topic #43', 'Message #43');

        PubSub.publish('Parent Topic:Topic #42', 'Some Message');

        equal(published['Topic #43'].message, 'Message #43', 'Published "' +
            published['Topic #43'].topic + '" with message "'+  published['Topic #43'].message +'"');

        equal(published['Parent Topic:Topic #42'].message, 'Some Message', 'Published "' +
            published['Parent Topic:Topic #42'].topic + '" with message "Some Message"');
    });

    test('Subtopics ('+(has_subtopics?'ON':'OFF')+')', function() {

        // Set-up
        PubSub.subscribe({
            'topic': 'Can:Have:As:Many:SubTopics',
            'callback': cb
        });

        PubSub.publish('Can:Have:As:Many:SubTopics:As:You:Can:Think:Of');

        if(has_subtopics) {

            // Set-up
            PubSub.subscribe({
                'topic': 'Can:Have:As:Many:SubTopics',
                'callback': cb
            });

            PubSub.subscribe({
                'topic': 'Parent Topic',
                'callback': cb
            });

            PubSub.publish('Parent Topic:Topic #20', 'Subtopic');

            PubSub.publish('Topic #21:Can:Have:Many:SubTopics:That:May:Not:Have:Subsubscribers', 'Message #21');

            // Tests
            expect(5);

            equal(published['Parent Topic'].message, 'Subtopic', 'Subtopics get published');

            equal(published['Parent Topic:Topic #20'].message, 'Subtopic', 'Both parent topics and subtopics get published');


            equal(published['Topic #21:Can:Have:Many:SubTopics:That:May:Not:Have:Subsubscribers'], undefined, 'No problem with publishing in non-existing subtopics');


            equal(published['Topic #21'].message, 'Message #21', 'Even if published topic did not have subscribers (eg. ParentTopic:NoSubscribers), the parent topic (eg. ParentTopic) still gets published');


            equal(published['Can:Have:As:Many:SubTopics'].topic,  'Can:Have:As:Many:SubTopics', 'Can have many subtopics');

        } else {

            // Tests
            expect(2);

            equal(published['Can:Have:As:Many:SubTopics:As:You:Can:Think:Of'],  undefined, 'Nothing happens if publishing to topics which have no subscribers');

            equal(published['Can:Have:As:Many:SubTopics'],  undefined, 'No subtopics are published if "subtopic" setting is false');
        }
    });

    test('Unsubscribe', function() {

        var token_call_count = 0,
            token = PubSub.subscribe({
                'topic': 'unsubscribe token test',
                'callback': function(sub) {
                    if(token_call_count === 0) {
                        ok(sub.token === token, 'Subscriptions return a token which can be used to unsubscribe');

                    } else if(token_call_count > 0) {
                        ok(token_call_count === 1, 'Unsubscribing with token actually works');
                    }

                    token_call_count++;
                }
            });

        PubSub.publish('unsubscribe token test');

        PubSub.publish('unsubscribe token test');

        PubSub.unsubscribe({
            'token': token
        });

        PubSub.publish('unsubscribe token test');
        PubSub.publish('unsubscribe token test');
        PubSub.publish('unsubscribe token test');

        equal(PubSub.topics['unsubscribe token test'].length, 0, 'Unsubscribing with token removes the subscription from the topics object');

        equal(count(PubSub.topic_messages['unsubscribe token test']), 0, 'Unsubscribing with token removes the subscription from the topic_messages object');

        PubSub.subscribe({
            'topic': 'Unsubscribing:with:topic:instead:of:token',
            'callback': cb
        });

        PubSub.unsubscribe({
            'topic': 'Unsubscribing:with:topic:instead:of:token'
        });

        ok(PubSub.topics['Unsubscribing:with:topic:instead:of:token'] === undefined, 'Unsubscribing with *specific* topic deletes everything from the topics object');

        ok(PubSub.topic_messages['Unsubscribing:with:topic:instead:of:token'] === undefined, 'Unsubscribing with *specific* topic deletes everything from the topic_messages object');

        PubSub.subscribe({
            'topic': 'Unsubscribing:with:topic:instead:of:token',
            'callback': cb
        });

        PubSub.unsubscribe({
            'topic': 'Unsubscribing:with:topic'
        });

        ok(PubSub.topics['Unsubscribing:with:topic:instead:of:token'] === undefined, 'Unsubscribing with parent topic deletes everything from the topics object');

        ok(PubSub.topic_messages['Unsubscribing:with:topic:instead:of:token'] === undefined, 'Unsubscribing with parent topic deletes everything from the topic_messages object');

        PubSub.subscribe({
            'topic': 'Unsubscribing:with:topic:instead:of:token',
            'callback': cb
        });

        PubSub.unsubscribe({
            'topic': 'Unsubscribing:with:top'
        });

        equal(PubSub.topics['Unsubscribing:with:topic:instead:of:token'].length, 1, 'When unsubscribing with topic the topic\'s  (or subtopic\s)full name must be provided');
    });

    function generateData(pubsub_instance){
        var i = 0,
            r = [],
            topic = 'Topic #',
            message = 'Message #',
            token, m, t;

        for (; i <= data_set_size; i++) {
            t = i % 2 ? topic + i : 'Parent Topic:' + topic + i;
            m = i % 2 ? message + i : undefined;

            r.push({
                'topic': t,
                'message': m,
                'token': pubsub_instance.subscribe({
                    'topic': t,
                    'message': m,
                    'callback': cb
                }),
                'context': undefined,
                'cb': cb
            });
        };

        return {
            'data': r,
            'topic': topic,
            'message': message,
            'push': function(token) {
                this.data.push({
                    'topic': this.topic + token,
                    'message': this.topic + token,
                    'token': token,
                    'context': undefined,
                    'cb': cb
                });
            }
        };
    }

    function cb(r, m) {
        r = copy(r);
        published[r.topic] = r;
        published[r.topic].message = m || r.message;
        // console.log('Published:', r);
    }

    function count(obj) {
        var i = 0;
        for(var k in obj){ if(!obj.hasOwnProperty(k)){continue;}i++;}
        return i;
    }

    function copy(obj) {
        var r = {};
        for(var k in obj) {
            if(!obj.hasOwnProperty(k)){continue;}
            r[k] = obj[k];
        }
        return r;
    }
}
