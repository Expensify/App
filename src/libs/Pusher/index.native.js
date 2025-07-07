"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var pusher_websocket_react_native_1 = require("@pusher/pusher-websocket-react-native");
var isObject_1 = require("lodash/isObject");
var react_native_1 = require("react-native");
var react_native_onyx_1 = require("react-native-onyx");
var Log_1 = require("@libs/Log");
var Session_1 = require("@userActions/Session");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EventType_1 = require("./EventType");
var shouldForceOffline = false;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NETWORK,
    callback: function (network) {
        if (!network) {
            return;
        }
        shouldForceOffline = !!network.shouldForceOffline;
    },
});
var socket;
var pusherSocketID;
var socketEventCallbacks = [];
var resolveInitPromise;
var initPromise = new Promise(function (resolve) {
    resolveInitPromise = resolve;
});
var eventsBoundToChannels = new Map();
var channels = {};
/**
 * Trigger each of the socket event callbacks with the event information
 */
function callSocketEventCallbacks(eventName, data) {
    socketEventCallbacks.forEach(function (cb) { return cb(eventName, data); });
}
/**
 * Initialize our pusher lib
 * @returns resolves when Pusher has connected
 */
function init(args) {
    return new Promise(function (resolve) {
        if (socket) {
            resolve();
            return;
        }
        socket = pusher_websocket_react_native_1.Pusher.getInstance();
        socket.init({
            apiKey: args.appKey,
            cluster: args.cluster,
            onConnectionStateChange: function (currentState, previousState) {
                if (currentState === CONST_1.default.PUSHER.STATE.CONNECTED) {
                    socket === null || socket === void 0 ? void 0 : socket.getSocketId().then(function (id) {
                        pusherSocketID = id;
                        callSocketEventCallbacks('connected');
                        resolve();
                    });
                }
                if (currentState === CONST_1.default.PUSHER.STATE.DISCONNECTED) {
                    callSocketEventCallbacks('disconnected');
                }
                callSocketEventCallbacks('state_change', { previous: previousState, current: currentState });
            },
            onError: function (message) { return callSocketEventCallbacks('error', { data: { message: message } }); },
            onAuthorizer: function (channelName, socketId) { return (0, Session_1.authenticatePusher)(socketId, channelName); },
        });
        socket.connect();
    }).then(resolveInitPromise);
}
/**
 * Returns a Pusher channel for a channel name
 */
function getChannel(channelName) {
    if (!socket) {
        return;
    }
    return socket.getChannel(channelName);
}
/**
 * Binds an event callback to a channel + eventName
 */
function bindEventToChannel(channel, eventName, eventCallback) {
    var _a;
    if (eventCallback === void 0) { eventCallback = function () { }; }
    if (!eventName) {
        return;
    }
    var chunkedDataEvents = {};
    var callback = function (eventData) {
        if (shouldForceOffline) {
            Log_1.default.info('[Pusher] Ignoring a Push event because shouldForceOffline = true');
            return;
        }
        var data;
        try {
            data = (0, isObject_1.default)(eventData) ? eventData : JSON.parse(eventData);
        }
        catch (err) {
            Log_1.default.alert('[Pusher] Unable to parse single JSON event data from Pusher', { error: err, eventData: eventData });
            return;
        }
        if (data.id === undefined || data.chunk === undefined || data.final === undefined) {
            eventCallback(data);
            return;
        }
        // If we are chunking the requests, we need to construct a rolling list of all packets that have come through
        // Pusher. If we've completed one of these full packets, we'll combine the data and act on the event that it's
        // assigned to.
        // If we haven't seen this eventID yet, initialize it into our rolling list of packets.
        if (!chunkedDataEvents[data.id]) {
            chunkedDataEvents[data.id] = { chunks: [], receivedFinal: false };
        }
        // Add it to the rolling list.
        var chunkedEvent = chunkedDataEvents[data.id];
        if (data.index !== undefined) {
            chunkedEvent.chunks[data.index] = data.chunk;
        }
        // If this is the last packet, mark that we've hit the end.
        if (data.final) {
            chunkedEvent.receivedFinal = true;
        }
        // Only call the event callback if we've received the last packet and we don't have any holes in the complete
        // packet.
        if (chunkedEvent.receivedFinal && chunkedEvent.chunks.length === Object.keys(chunkedEvent.chunks).length) {
            try {
                eventCallback(JSON.parse(chunkedEvent.chunks.join('')));
            }
            catch (err) {
                Log_1.default.alert('[Pusher] Unable to parse chunked JSON response from Pusher', {
                    error: err,
                    eventData: chunkedEvent.chunks.join(''),
                });
                // Using console.error is helpful here because it will print a usable stack trace to the console to debug where the error comes from
                console.error(err);
            }
            delete chunkedDataEvents[data.id];
        }
    };
    if (!eventsBoundToChannels.has(channel)) {
        eventsBoundToChannels.set(channel, new Map());
    }
    (_a = eventsBoundToChannels.get(channel)) === null || _a === void 0 ? void 0 : _a.set(eventName, callback);
}
/**
 * Subscribe to a channel and an event
 */
function subscribe(channelName, eventName, eventCallback, onResubscribe) {
    if (eventCallback === void 0) { eventCallback = function () { }; }
    if (onResubscribe === void 0) { onResubscribe = function () { }; }
    return initPromise.then(function () {
        return new Promise(function (resolve, reject) {
            react_native_1.InteractionManager.runAfterInteractions(function () {
                // We cannot call subscribe() before init(). Prevent any attempt to do this on dev.
                if (!socket) {
                    throw new Error("[Pusher] instance not found. Pusher.subscribe()\n            most likely has been called before Pusher.init()");
                }
                Log_1.default.info('[Pusher] Attempting to subscribe to channel', false, { channelName: channelName, eventName: eventName });
                if (!channels[channelName]) {
                    channels[channelName] = CONST_1.default.PUSHER.CHANNEL_STATUS.SUBSCRIBING;
                    socket.subscribe({
                        channelName: channelName,
                        onEvent: function (event) {
                            var _a;
                            var callback = (_a = eventsBoundToChannels.get(event.channelName)) === null || _a === void 0 ? void 0 : _a.get(event.eventName);
                            callback === null || callback === void 0 ? void 0 : callback(event.data);
                        },
                        onSubscriptionSucceeded: function () {
                            channels[channelName] = CONST_1.default.PUSHER.CHANNEL_STATUS.SUBSCRIBED;
                            bindEventToChannel(channelName, eventName, eventCallback);
                            resolve();
                            // When subscribing for the first time we register a success callback that can be
                            // called multiple times when the subscription succeeds again in the future
                            // e.g. as a result of Pusher disconnecting and reconnecting. This callback does
                            // not fire on the first subscription_succeeded event.
                            onResubscribe();
                        },
                        onSubscriptionError: function (name, message) {
                            delete channels[channelName];
                            Log_1.default.hmmm('[Pusher] Issue authenticating with Pusher during subscribe attempt.', {
                                channelName: channelName,
                                message: message,
                            });
                            reject(message);
                        },
                    });
                }
                else {
                    bindEventToChannel(channelName, eventName, eventCallback);
                    resolve();
                }
            });
        });
    });
}
/**
 * Unsubscribe from a channel and optionally a specific event
 */
function unsubscribe(channelName, eventName) {
    var _a, _b;
    if (eventName === void 0) { eventName = ''; }
    var channel = getChannel(channelName);
    if (!channel) {
        Log_1.default.hmmm('[Pusher] Attempted to unsubscribe or unbind from a channel, but Pusher-JS has no knowledge of it', { channelName: channelName, eventName: eventName });
        return;
    }
    if (eventName) {
        Log_1.default.info('[Pusher] Unbinding event', false, { eventName: eventName, channelName: channelName });
        (_a = eventsBoundToChannels.get(channelName)) === null || _a === void 0 ? void 0 : _a.delete(eventName);
        if (((_b = eventsBoundToChannels.get(channelName)) === null || _b === void 0 ? void 0 : _b.size) === 0) {
            Log_1.default.info("[Pusher] After unbinding ".concat(eventName, " from channel ").concat(channelName, ", no other events were bound to that channel. Unsubscribing..."), false);
            eventsBoundToChannels.delete(channelName);
            delete channels[channelName];
            socket === null || socket === void 0 ? void 0 : socket.unsubscribe({ channelName: channelName });
        }
    }
    else {
        Log_1.default.info('[Pusher] Unsubscribing from channel', false, { channelName: channelName });
        eventsBoundToChannels.delete(channelName);
        delete channels[channelName];
        socket === null || socket === void 0 ? void 0 : socket.unsubscribe({ channelName: channelName });
    }
}
/**
 * Are we already in the process of subscribing to this channel?
 */
function isAlreadySubscribing(channelName) {
    if (!socket) {
        return false;
    }
    return channels[channelName] === CONST_1.default.PUSHER.CHANNEL_STATUS.SUBSCRIBING;
}
/**
 * Are we already subscribed to this channel?
 */
function isSubscribed(channelName) {
    if (!socket) {
        return false;
    }
    return channels[channelName] === CONST_1.default.PUSHER.CHANNEL_STATUS.SUBSCRIBED;
}
/**
 * Sends an event over a specific event/channel in pusher.
 */
function sendEvent(channelName, eventName, payload) {
    // Check to see if we are subscribed to this channel before sending the event. Sending client events over channels
    // we are not subscribed too will throw errors and cause reconnection attempts. Subscriptions are not instant and
    // can happen later than we expect.
    if (!isSubscribed(channelName)) {
        return;
    }
    if (shouldForceOffline) {
        Log_1.default.info('[Pusher] Ignoring a Send event because shouldForceOffline = true');
        return;
    }
    socket === null || socket === void 0 ? void 0 : socket.trigger({ channelName: channelName, eventName: eventName, data: JSON.stringify(payload) });
}
/**
 * Register a method that will be triggered when a socket event happens (like disconnecting)
 */
function registerSocketEventCallback(cb) {
    socketEventCallbacks.push(cb);
}
/**
 * Disconnect from Pusher
 */
function disconnect() {
    if (!socket) {
        Log_1.default.info('[Pusher] Attempting to disconnect from Pusher before initialization has occurred, ignoring.');
        return;
    }
    socket.disconnect();
    socket = null;
    pusherSocketID = '';
    channels = {};
    eventsBoundToChannels.clear();
    initPromise = new Promise(function (resolve) {
        resolveInitPromise = resolve;
    });
}
/**
 * Disconnect and Re-Connect Pusher
 */
function reconnect() {
    if (!socket) {
        Log_1.default.info('[Pusher] Unable to reconnect since Pusher instance does not yet exist.');
        return;
    }
    Log_1.default.info('[Pusher] Reconnecting to Pusher');
    socket.disconnect();
    socket.connect();
}
function getPusherSocketID() {
    return pusherSocketID;
}
if (window) {
    /**
     * Pusher socket for debugging purposes
     */
    window.getPusherInstance = function () { return socket; };
}
var MobilePusher = {
    init: init,
    subscribe: subscribe,
    unsubscribe: unsubscribe,
    getChannel: getChannel,
    isSubscribed: isSubscribed,
    isAlreadySubscribing: isAlreadySubscribing,
    sendEvent: sendEvent,
    disconnect: disconnect,
    reconnect: reconnect,
    registerSocketEventCallback: registerSocketEventCallback,
    TYPE: EventType_1.default,
    getPusherSocketID: getPusherSocketID,
};
exports.default = MobilePusher;
