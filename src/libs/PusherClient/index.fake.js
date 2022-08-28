import Onyx from 'react-native-onyx';
import TYPE from './EventType';
import ONYXKEYS from '../../ONYXKEYS';

let isOffline = false;
Onyx.connect({
    key: ONYXKEYS.NETWORK,
    callback: val => isOffline = val.isOffline,
});

const ws = new WebSocket('ws://localhost:8888');
const subscriptions = {};

/**
 * @param {String} channelName
 * @param {String} event
 * @param {Function} onEvent
 * @returns {Promise}
 */
function subscribe(channelName, event, onEvent) {
    console.debug(`[Pusher-Fake] Subscribing to ${channelName} ${event}`);
    if (!subscriptions[channelName]) {
        subscriptions[channelName] = {[event]: onEvent};
        return Promise.resolve();
    }

    subscriptions[channelName][event] = onEvent;
    return Promise.resolve();
}

/**
 * @param {String} channelName
 * @param {String} event
 */
function unsubscribe(channelName, event) {
    if (event) {
        delete subscriptions[channelName][event];
        return;
    }

    delete subscriptions[channelName];
}

/**
 * @param {WebSocketMessageEvent} event
 */
function processWebSocketMessage(event) {
    const data = JSON.parse(event.data);
    console.debug('[Pusher-Fake] Event received: ', data);

    if (!subscriptions[data.channel]) {
        console.debug(`[Pusher-Fake] No subscription for channel ${data.channel}`);
        return;
    }

    const eventName = data.event.type;
    if (!subscriptions[data.channel][eventName]) {
        console.debug(`[Pusher-Fake] No subscription for event ${eventName}`);
        return;
    }

    // Events can't be sent or received when offline
    if (isOffline) {
        return;
    }

    const pushJSON = data.event.data;
    subscriptions[data.channel][eventName](pushJSON);
}

function sendEvent(channel, eventType, data) {
    // Events can't be sent or received when offline
    if (isOffline) {
        return;
    }

    ws.send(JSON.stringify({channel, event: {type: eventType, data}}));
}

ws.addEventListener('message', processWebSocketMessage);

const registerCustomAuthorizer = () => {};
const registerSocketEventCallback = () => {};
const isSubscribed = channelName => Boolean(subscriptions[channelName]);
const isAlreadySubscribing = () => false;
const connect = () => {};
const disconnect = () => {};
const reconnect = () => {};
const init = () => Promise.resolve();

export {
    subscribe,
    unsubscribe,
    TYPE,
    registerCustomAuthorizer,
    registerSocketEventCallback,
    isSubscribed,
    isAlreadySubscribing,
    sendEvent,
    connect,
    disconnect,
    reconnect,
    init,
};
