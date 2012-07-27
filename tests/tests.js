var pubsub_instance, test_counts = 0, data_set_size = 500;

pubsub_instance = new PubSub();

startTest(PubSub, 'PubSub');
startTest(pubsub_instance, 'PubSub Instance');


function startTest(PubSub, title) {
    test_counts++;

    var pubsub_data,
        published = []

    pubsub_data = generateData(PubSub);

    module(title + ' ('+ PubSub.puid +')');

    test('Initialize', function() {

        ok(PubSub, title + ' exists');
    });

    module(title+ ' ('+ PubSub.puid +')');

    test('Data', function() {

        ok(count(pubsub_data.data), 'Data generated for ' + title);
    });

    test('Token', function() {
        var token = PubSub.subscribe('a topic', cb);

        pubsub_data.push(token);

        expect(3);

        deepEqual(token, '501' , 'Subscribe method returns the token');

        deepEqual(pubsub_data.data[23].token, '23', 'Test data #23 has token #23');

        deepEqual(pubsub_data.data[239].token, '239', 'Test data #239 has token #239');
    });

    test('Subscribe', function() {
        var subscribers = PubSub.topics,
            subscribers_with_messages = PubSub.topic_messages,
            subscribers_length = count(subscribers),
            subscribers_with_messages_length = count(subscribers_with_messages);

        expect(6);

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
    });

    test('Publish', function() {

        equal(count(published), 0, 'No publications yet');

        PubSub.publish('Parent Topic:Topic #40');

        equal(count(published), 1, 'First publication ("Parent Topic:Topic #40")');

        PubSub.publish('Topic #43', 'Message #43');

        equal(published['Topic #43'].message, 'Message #43', 'Published "' +
            published['Topic #43'].topic + '" with message "'+  published['Topic #43'].message +'"');

        PubSub.publish('Parent Topic:Topic #42', 'Some Message');

        equal(published['Parent Topic:Topic #42'].message, 'Some Message', 'Published "' +
            published['Parent Topic:Topic #42'].topic + '" with message "Some Message"');
    });

    test('Publish to Subtopics', function() {
        PubSub.subscribe('Parent Topic', cb);

        PubSub.publish('Parent Topic:Topic #20', 'Subtopic');

        equal(published['Parent Topic'].message, 'Subtopic', 'Subtopics get published');

        equal(published['Parent Topic:Topic #20'].message, 'Subtopic', 'Both parent topics and subtopics get published');

        PubSub.publish('Topic #21:Can:Have:Many:SubTopics:That:May:Not:Have:Subsubscribers', 'Message #21');

        equal(published['Topic #21:Can:Have:Many:SubTopics:That:May:Not:Have:Subsubscribers'], undefined, 'No problem with publishing in non-existing subtopics');

        equal(published['Topic #21'].message, 'Message #21', 'Even if published topic did not have subscribers (eg. ParentTopic:NoSubscribers), the parent topic (eg. ParentTopic) still gets published');

        PubSub.subscribe('Can:Have:As:Many:SubTopics', cb);

        PubSub.publish('Can:Have:As:Many:SubTopics:As:You:Can:Think:Of');

        equal(published['Can:Have:As:Many:SubTopics'].topic,  'Can:Have:As:Many:SubTopics', 'Can have many subtopics');
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
                'token': pubsub_instance.subscribe(t, m, cb),
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
        console.log('Published:', r);
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
// test('publish', function() {

// });

// test('unsubscribe', function() {

// });

// test('remove', function() {

// });

// test('subtopics', function() {

// });

// module('Creating new PubSub Instance');

// var PubSub2 = new PubSub();

// test( "a basic test example", function() {
//   var value = "hello";
//   equal( value, "hello", "We expect value to be hello" );
// });

// test( "ok test", function() {
//     expect(2);
//   ok( true, "true succeeds" );
//   ok( "non-empty", "non-empty string succeeds" );

//   ok( false, "false fails" );
//   ok( 0, "0 fails" );
//   ok( NaN, "NaN fails" );
//   ok( "", "empty string fails" );
//   ok( null, "null fails" );
//   ok( undefined, "undefined fails" );
// });
