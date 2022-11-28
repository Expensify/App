import Onyx from 'react-native-onyx';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';
import Pusher from './library';
import TYPE from './EventType';
import Log from '../Log';

let isOffline = false;
Onyx.connect({
    key: ONYXKEYS.NETWORK,
    callback: (network) => {
        if (!network) {
            return;
        }
        isOffline = Boolean(network.shouldForceOffline) || network.isOffline;
    },
});

let socket;
const socketEventCallbacks = [];
let customAuthorizer;

/**
 * Trigger each of the socket event callbacks with the event information
 *
 * @param {String} eventName
 * @param {*} data
 */
function callSocketEventCallbacks(eventName, data) {
    _.each(socketEventCallbacks, cb => cb(eventName, data));
}

/**
 * Initialize our pusher lib
 *
 * @param {Object} args
 * @param {String} args.appKey
 * @param {String} args.cluster
 * @param {String} args.authEndpoint
 * @param {Object} [params]
 * @public
 * @returns {Promise} resolves when Pusher has connected
 */
function init(args, params) {
    return new Promise((resolve) => {
        if (socket) {
            return resolve();
        }

        // Use this for debugging
        // Pusher.log = (message) => {
        //     if (window.console && window.console.log) {
        //         window.console.log(message);
        //     }
        // };

        const options = {
            cluster: args.cluster,
            authEndpoint: args.authEndpoint,
        };

        if (customAuthorizer) {
            options.authorizer = customAuthorizer;
        }

        socket = new Pusher(args.appKey, options);

        // If we want to pass params in our requests to api.php we'll need to add it to socket.config.auth.params
        // as per the documentation
        // (https://pusher.com/docs/channels/using_channels/connection#channels-options-parameter).
        // Any param mentioned here will show up in $_REQUEST when we call "AuthenticatePusher". Params passed here need
        // to pass our inputRules to show up in the request.
        if (params) {
            socket.config.auth = {};
            socket.config.auth.params = params;
        }

        // Listen for connection errors and log them
        socket.connection.bind('error', (error) => {
            callSocketEventCallbacks('error', error);
        });

        socket.connection.bind('connected', () => {
            callSocketEventCallbacks('connected');
            resolve();
        });

        socket.connection.bind('disconnected', () => {
            callSocketEventCallbacks('disconnected');
        });

        socket.connection.bind('state_change', (states) => {
            callSocketEventCallbacks('state_change', states);
        });
    });
}

/**
 * Returns a Pusher channel for a channel name
 *
 * @param {String} channelName
 *
 * @returns {Channel}
 */
function getChannel(channelName) {
    if (!socket) {
        return;
    }

    return socket.channel(channelName);
}

/**
 * Binds an event callback to a channel + eventName
 * @param {Pusher.Channel} channel
 * @param {String} eventName
 * @param {Function} [eventCallback]
 *
 * @private
 */
function bindEventToChannel(channel, eventName, eventCallback = () => {}) {
    if (!eventName) {
        return;
    }

    const chunkedDataEvents = {};
    const callback = (eventData) => {
        if (isOffline) {
            Log.info('[Pusher] Ignoring Push event because isOffline = true');
            return;
        }

        let data;
        try {
            data = _.isObject(eventData) ? eventData : JSON.parse(eventData);
        } catch (err) {
            Log.alert('[Pusher] Unable to parse JSON response from Pusher', {error: err, eventData});
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
            chunkedDataEvents[data.id] = {chunks: [], receivedFinal: false};
        }

        // Add it to the rolling list.
        const chunkedEvent = chunkedDataEvents[data.id];
        chunkedEvent.chunks[data.index] = data.chunk;

        // If this is the last packet, mark that we've hit the end.
        if (data.final) {
            chunkedEvent.receivedFinal = true;
        }

        // Only call the event callback if we've received the last packet and we don't have any holes in the complete
        // packet.
        if (chunkedEvent.receivedFinal && chunkedEvent.chunks.length === _.keys(chunkedEvent.chunks).length) {
            eventCallback(JSON.parse(chunkedEvent.chunks.join('')));
            try {
                eventCallback(JSON.parse(chunkedEvent.chunks.join('')));
            } catch (err) {
                Log.alert('[Pusher] Unable to parse chunked JSON response from Pusher', {
                    error: err,
                    eventData: chunkedEvent.chunks.join(''),
                });
            }

            delete chunkedDataEvents[data.id];
        }
    };

    channel.bind(eventName, callback);
}

/**
 * Subscribe to a channel and an event
 *
 * @param {String} channelName
 * @param {String} eventName
 * @param {Function} [eventCallback]
 * @param {Function} [onResubscribe] Callback to be called when reconnection happen
 *
 * @return {Promise}
 *
 * @public
 */
function subscribe(
    channelName,
    eventName,
    eventCallback = () => {},
    onResubscribe = () => {},
) {
    return new Promise((resolve, reject) => {
        // We cannot call subscribe() before init(). Prevent any attempt to do this on dev.
        if (!socket) {
            throw new Error(`[Pusher] instance not found. Pusher.subscribe()
            most likely has been called before Pusher.init()`);
        }

        Log.info('[Pusher] Attempting to subscribe to channel', false, {channelName, eventName});
        let channel = getChannel(channelName);

        if (!channel || !channel.subscribed) {
            channel = socket.subscribe(channelName);
            let isBound = false;
            channel.bind('pusher:subscription_succeeded', () => {
                // Check so that we do not bind another event with each reconnect attempt
                if (!isBound) {
                    bindEventToChannel(channel, eventName, eventCallback);
                    resolve();
                    isBound = true;
                    return;
                }

                // When subscribing for the first time we register a success callback that can be
                // called multiple times when the subscription succeeds again in the future
                // e.g. as a result of Pusher disconnecting and reconnecting. This callback does
                // not fire on the first subscription_succeeded event.
                onResubscribe();
            });

            channel.bind('pusher:subscription_error', (data = {}) => {
                const {type, error, status} = data;
                Log.hmmm('[Pusher] Issue authenticating with Pusher during subscribe attempt.', {
                    channelName,
                    status,
                    type,
                    error,
                });
                reject(error);
            });
        } else {
            bindEventToChannel(channel, eventName, eventCallback);
            resolve();
        }
    });
}

/**
 * Unsubscribe from a channel and optionally a specific event
 *
 * @param {String} channelName
 * @param {String} [eventName]
 * @public
 */
function unsubscribe(channelName, eventName = '') {
    const channel = getChannel(channelName);

    if (!channel) {
        Log.hmmm('[Pusher] Attempted to unsubscribe or unbind from a channel, but Pusher-JS has no knowledge of it', {channelName, eventName});
        return;
    }

    if (eventName) {
        Log.info('[Pusher] Unbinding event', false, {eventName, channelName});
        channel.unbind(eventName);
    } else {
        if (!channel.subscribed) {
            Log.info('Pusher] Attempted to unsubscribe from channel, but we are not subscribed to begin with', false, {channelName});
            return;
        }
        Log.info('[Pusher] Unsubscribing from channel', false, {channelName});

        channel.unbind();
        socket.unsubscribe(channelName);
    }
}

/**
 * Are we already in the process of subscribing to this channel?
 *
 * @param {String} channelName
 *
 * @returns {Boolean}
 */
function isAlreadySubscribing(channelName) {
    if (!socket) {
        return false;
    }

    const channel = getChannel(channelName);
    return channel ? channel.subscriptionPending : false;
}

/**
 * Are we already subscribed to this channel?
 *
 * @param {String} channelName
 *
 * @returns {Boolean}
 */
function isSubscribed(channelName) {
    if (!socket) {
        return false;
    }

    const channel = getChannel(channelName);
    return channel ? channel.subscribed : false;
}

/**
 * Sends an event over a specific event/channel in pusher.
 *
 * @param {String} channelName
 * @param {String} eventName
 * @param {Object} payload
 */
function sendEvent(channelName, eventName, payload) {
    // Check to see if we are subscribed to this channel before sending the event. Sending client events over channels
    // we are not subscribed too will throw errors and cause reconnection attempts. Subscriptions are not instant and
    // can happen later than we expect.
    if (!isSubscribed(channelName)) {
        return;
    }

    socket.send_event(eventName, payload, channelName);
}

/**
 * Register a method that will be triggered when a socket event happens (like disconnecting)
 *
 * @param {Function} cb
 */
function registerSocketEventCallback(cb) {
    socketEventCallbacks.push(cb);
}

/**
 * A custom authorizer allows us to take a more fine-grained approach to
 * authenticating Pusher. e.g. we can handle failed attempts to authorize
 * with an expired authToken and retry the attempt.
 *
 * @param {Function} authorizer
 */
function registerCustomAuthorizer(authorizer) {
    customAuthorizer = authorizer;
}

/**
 * Disconnect from Pusher
 */
function disconnect() {
    if (!socket) {
        Log.info('[Pusher] Attempting to disconnect from Pusher before initialisation has occurred, ignoring.');
        return;
    }

    socket.disconnect();
    socket = null;
}

/**
 * Disconnect and Re-Connect Pusher
 */
function reconnect() {
    if (!socket) {
        Log.info('[Pusher] Unable to reconnect since Pusher instance does not yet exist.');
        return;
    }

    Log.info('[Pusher] Reconnecting to Pusher');
    socket.disconnect();
    socket.connect();
}

if (window) {
    /**
     * Pusher socket for debugging purposes
     *
     * @returns {Function}
     */
    window.getPusherInstance = () => socket;
}

export {
    init,
    subscribe,
    unsubscribe,
    getChannel,
    isSubscribed,
    isAlreadySubscribing,
    sendEvent,
    disconnect,
    reconnect,
    registerSocketEventCallback,
    registerCustomAuthorizer,
    TYPE,
};
