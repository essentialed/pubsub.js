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

    // Subscribing
    PubSub.subscribe(topic, message /* optional */, callback, context /* optional */ );

    // Publishing
    PubSub.publish(topic, message /* optional */);

### Basic

    PubSub.subscribe('click', function(subscription, message){
        console.log('"click" happened');
    });

    PubSub.publish('click');

    PubSub.subscribe('click', 'a' function(subscription, message){
        console.log('click on a link happened');
    });

    PubSub.publish('click', 'a');

### Unsubscribing
    // By token (1)
    var token = PubSub.subscribe('click', function(subscription, message){
        console.log('Another click');
    });

    PubSub.publish('click');

    PubSub.unsubscribe(token);

    // By token (2)
    PubSub.subscribe('click', function(subscription, message){
        console.log('Another click');
        PubSub.unsubscribe(subscription.token);
    });

    PubSub.publish('click');

    // By topic
    PubSub.remove('click'); // Remove all click topics


### Topic &amp; Messages

    PubSub.subscribe('change', 'name', function(subscription, message, opts){
        console.log('My', message.toUpperCase(), 'has changed!', opts);
        // subscription.topic == 'change'
        // subscription.message == 'name'
        // subscription.token == '1' // token used to unsubscribe, String
    });

    PubSub.publish('change', 'name', {
        'from': 'A',
        'to': 'B'
    });

    // => 'My NAME has changed!' { 'from': 'A', 'to': 'B' }

### Subtopics

    PubSub.subscribe('change', function(subscription, message){
        console.log('Something has changed!', message);
        console.dir(subscription)
        // subscription.topic == 'change'
        // subscription.message == undefined
        // subscription.token == '2' // token used to unsubscribe, String
    });

    PubSub.subscribe('change:name', function(subscription, message){
        console.log('My name has changed!', message);
        // subscription.topic == 'change:name'
        // subscription.message == undefined
        // subscription.token == '3' // token used to unsubscribe, String
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
