"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CONFIG_1 = require("@src/CONFIG");
var CONST_1 = require("@src/CONST");
var Log_1 = require("./Log");
var NetworkConnection_1 = require("./NetworkConnection");
var Pusher_1 = require("./Pusher");
// Keeps track of all the callbacks that need triggered for each event type
var multiEventCallbackMapping = {};
function getUserChannelName(accountID) {
    return "".concat(CONST_1.default.PUSHER.PRIVATE_USER_CHANNEL_PREFIX).concat(accountID).concat(CONFIG_1.default.PUSHER.SUFFIX);
}
function subscribeToMultiEvent(eventType, callback) {
    multiEventCallbackMapping[eventType] = callback;
}
function triggerMultiEventHandler(eventType, data) {
    if (!multiEventCallbackMapping[eventType]) {
        Log_1.default.warn('[PusherUtils] Received unexpected multi-event', { eventType: eventType });
        return Promise.resolve();
    }
    return multiEventCallbackMapping[eventType](data);
}
/**
 * Abstraction around subscribing to private user channel events. Handles all logs and errors automatically.
 */
function subscribeToPrivateUserChannelEvent(eventName, accountID, onEvent) {
    var pusherChannelName = getUserChannelName(accountID);
    function logPusherEvent(pushJSON) {
        Log_1.default.info("[Report] Handled ".concat(eventName, " event sent by Pusher"), false, pushJSON);
    }
    function onPusherResubscribeToPrivateUserChannel() {
        NetworkConnection_1.default.triggerReconnectionCallbacks('Pusher re-subscribed to private user channel');
    }
    function onEventPush(pushJSON) {
        logPusherEvent(pushJSON);
        onEvent(pushJSON);
    }
    function onSubscriptionFailed(error) {
        Log_1.default.hmmm('Failed to subscribe to Pusher channel', { error: error, pusherChannelName: pusherChannelName, eventName: eventName });
    }
    Pusher_1.default.subscribe(pusherChannelName, eventName, onEventPush, onPusherResubscribeToPrivateUserChannel).catch(onSubscriptionFailed);
}
exports.default = {
    subscribeToPrivateUserChannelEvent: subscribeToPrivateUserChannelEvent,
    subscribeToMultiEvent: subscribeToMultiEvent,
    triggerMultiEventHandler: triggerMultiEventHandler,
};
