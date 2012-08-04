pubsub.js
=========

> The Publish/Subscribe pattern uses a topic/event channel which sits between the objects wishing to receive notifications (subscribers) and the object firing the event (the publisher). This event system allows code to define application specific events which can pass custom arguments containing values needed by the subscriber. The idea here is to avoid dependencies between the subscriber and publisher.

[Learning JavaScript Design Patterns by Addy Osmani](http://addyosmani.com/resources/essentialjsdesignpatterns/book/#observerpatternjavascript)

## Features
* No dependencies
* Small & Fast
* Topic &amp; Message subscriptions
* Subtopics

## Syntax

You can start using PubSub right away or you can create new instances from it.

```javascript
PubSub.subscribe('topic', function(subscription, message) {
    // the subscription argument is an object with the following properties
    // @topic {String} the topic that we are listening to, in this case "topic"
    // @message {Anything} the message we were listening for, if any, in this case undefined
    // @token {String} the unique ID for this subscription, used for unsubscribing

    console.log('"topic" was published with message "' + message + '"');
});
```

```javascript
    PubSub.publish('topic'); // => "topic" was published with message "undefined"

    PubSub.publish('topic', 'a message'); // => "topic" was published with message "a message"
```

Creating a new PubSub instance for use, let's say, with a specific module.
Functionality and syntax stay the same.

```javascript
    MyModule.PubSub = new PubSub();
```

Passing some options in our PubSub:

```javascript
    Events = new PubSub({
        'subtopics': true, // true is the default value
        'subtopic_marker': '--' // the default is ":"
    });

    Events.subscribe('topic', function(subscription, message) {
        console.log(subscription.topic + ' was published: ' + message);
    });
```

And then..

```javascript
    Events.publish('topic--childtopic--extradeeptopic', 'some message');
    // => "topic was published: some message"

    Events.publish('topic--childtopic', 'some message');
    // => "topic was published: some message"

    Events.publish('topic', 'some message');
    // => "topic was published: some message"
```

Subtopics allow you to in a way "bubble" published messages so that you can
do things like this:

```javascript
    PubSub.subscribe('change', function(subscription, change) {
        console.log('Something has changed from '  + change.from + ' to ' +
         change.to );
    });

    PubSub.subscribe('change:name', function(subscription, change) {
        console.log('My name has changed from ' + change.from + ' to ' +
         change.to );
    });

    PubSub.publish('change:name', {
        'from': 'A',
        'to': 'B'
    });
```

Which returns:
// => My name has changed from A to B
// => Something has changed from A to B


### Unsubscribing
By token (1)
    var token = PubSub.subscribe('click', function(subscription, message){
        console.log('Another click');
    });

    PubSub.publish('click');

    PubSub.unsubscribe(token);

By token (2)
    PubSub.subscribe('click', function(subscription, message){
        console.log('Another click');
        PubSub.unsubscribe(subscription.token);
    });

    PubSub.publish('click');

By topic
    PubSub.remove('click'); // Remove all click topics


### Topic &amp; Messages

    PubSub.subscribe('change', 'name', function(subscription, message, opts){
        console.log('My', message.toUpperCase(), 'has changed!', opts);
    });

    PubSub.publish('change', 'name', {
        'from': 'A',
        'to': 'B'
    });

    // => 'My NAME has changed!' { 'from': 'A', 'to': 'B' }

### Subtopics

    PubSub.subscribe('change', function(subscription, message){
        console.log('Something has changed!', message);
        console.dir(subscription);
    });

    PubSub.subscribe('change:name', function(subscription, message){
        console.log('My name has changed!', message);
    });

    PubSub.publish('change:name', {
        'from': 'A',
        'to': 'B'
    });

    // => 'My name has changed!' { 'from': 'A', 'to': 'B' }
    // => 'Something has changed!' { 'from': 'A', 'to': 'B' }


## Other PubSub JS libraries
* https://gist.github.com/661855
* https://github.com/mroderick/PubSubJS
* https://github.com/phiggins42/bloody-jquery-plugins/blob/master/pubsub.js
