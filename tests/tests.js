var testData = (function generateData(){
    var count = 500,
        i = 0,
        r = [],
        topic = 'Topic #',
        message = 'Message #',
        token, m, t;

    for (; i <= count; i++) {
        t = topic + i;
        m = i % 2 ? message + i : undefined;

        r.push({
            'topic': t,
            'message': m,
            'token': PubSub.subscribe(t, m, cb),
            'context': undefined,
            'cb': cb
        });
    }

    return {
        'data': r,
        'count': count,
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
})();

module('Using PubSub directly (window.PubSub)');

test('Token', function() {
    var token = PubSub.subscribe('a topic', cb);
    testData.push(token);

    expect(3);

    deepEqual(token, '501', 'Subscribe method returns the token');

    deepEqual(testData.data[23].token, '23', 'Test data #23 has token #23');

    deepEqual(testData.data[239].token, '239', 'Test data #239 has token #239');

});

test('Subscribe', function() {
    var subscribers = PubSub.topics,
        subscribers_with_messages = PubSub.topic_messages,
        subscribers_length = count(subscribers),
        subscribers_with_messages_length = count(subscribers_with_messages);

    expect(6);

    deepEqual(subscribers_length, testData.data.length,
        'topic array is created and incremented OK');

    deepEqual(subscribers_with_messages_length, testData.data.length,
        'topic_messages array is created and incremented OK');

    deepEqual(testData.data[42],
        subscribers[testData.topic + '42'][0],
        'Subscribers with no message appear only in topics');

    deepEqual({}, subscribers_with_messages[testData.topic + '42'],
        'Subscribers with no message appear only in topics');

    deepEqual(testData.data[43],
        subscribers_with_messages[testData.topic + '43'][testData.message + '43'][0],
        'Subscribers with message appear only in topic_messages');

    deepEqual([],
        subscribers[testData.topic + '43'],
        'Subscribers with message appear only in topic_messages');
});

function cb() {}

function count(what) {
    var i = 0;
    for(var k in what){i++;}
    return i;
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
