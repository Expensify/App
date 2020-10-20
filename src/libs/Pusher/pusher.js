import _ from 'underscore';
import Pusher from './library';
import CONFIG from '../../CONFIG';

let socket;
const socketEventCallbacks = [];
let customAuthorizer;

/**
 * Trigger each of the socket event callbacks with the event information
 *
 * @param {string} eventName
 * @param {mixed} data
 */
function callSocketEventCallbacks(eventName, data) {
    _.each(socketEventCallbacks, cb => cb(eventName, data));
}

/**
 * Initialize our pusher lib
 *
 * @param {String} appKey
 * @param {Object} [params]
 * @public
 * @returns {Promise} resolves when Pusher has connected
 */
function init(appKey, params) {
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
            cluster: CONFIG.PUSHER.CLUSTER,
            authEndpoint: `${CONFIG.EXPENSIFY.API_ROOT}command=Push_Authenticate`,
        };

        if (customAuthorizer) {
            options.authorizer = customAuthorizer;
        }

        socket = new Pusher(CONFIG.PUSHER.APP_KEY, options);

        // If we want to pass params in our requests to api.php we'll need to add it to socket.config.auth.params
        // as per the documentation
        // (https://pusher.com/docs/channels/using_channels/connection#channels-options-parameter).
        // Any param mentioned here will show up in $_REQUEST when we call "Push_Authenticate". Params passed here need
        // to pass our inputRules to show up in the request.
        if (params) {
            socket.config.auth = {};
            socket.config.auth.params = params;
        }

        // Listen for connection errors and log them
        socket.connection.bind('error', (error) => {
            console.error('[Pusher] error', error);
            callSocketEventCallbacks('error', error);
        });

        socket.connection.bind('connected', () => {
            console.debug('[Pusher] connected');
            callSocketEventCallbacks('connected');
            resolve();
        });

        socket.connection.bind('disconnected', () => {
            console.debug('[Pusher] disconnected');
            callSocketEventCallbacks('disconnected');
        });

        socket.connection.bind('state_change', (states) => {
            console.debug('[Pusher] state changed', states);
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
 * @param {Boolean} [isChunked] Do we expect this channel to send chunked/separate blocks of data that need recombining?
 *
 * @private
 */
function bindEventToChannel(channel, eventName, eventCallback = () => {}, isChunked = false) {
    if (!eventName) {
        return;
    }

    const chunkedDataEvents = {};
    const callback = (eventData) => {
        if (!isChunked) {
            let data;

            try {
                data = _.isObject(eventData) ? eventData : JSON.parse(eventData);
            } catch (err) {
                console.error('Unable to parse JSON response from Pusher', 0, {error: err, eventData});
                return;
            }

            eventCallback(data);
            return;
        }

        // If we are chunking the requests, we need to construct a rolling list of all packets that have come through
        // Pusher. If we've completed one of these full packets, we'll combine the data and act on the event that it's
        // assigned to.

        // If we haven't seen this eventID yet, initialize it into our rolling list of packets.
        if (!chunkedDataEvents[eventData.id]) {
            chunkedDataEvents[eventData.id] = {chunks: [], receivedFinal: false};
        }

        // Add it to the rolling list.
        const chunkedEvent = chunkedDataEvents[eventData.id];
        chunkedEvent.chunks[eventData.index] = eventData.chunk;

        // If this is the last packet, mark that we've hit the end.
        if (eventData.final) {
            chunkedEvent.receivedFinal = true;
        }

        // Only call the event callback if we've received the last packet and we don't have any holes in the complete
        // packet.
        if (chunkedEvent.receivedFinal && chunkedEvent.chunks.length === Object.keys(chunkedEvent.chunks).length) {
            eventCallback(JSON.parse(chunkedEvent.chunks.join('')));
            try {
                eventCallback(JSON.parse(chunkedEvent.chunks.join('')));
            } catch (err) {
                console.error('[Pusher] Unable to parse chunked JSON response from Pusher', 0, {
                    error: err,
                    eventData: chunkedEvent.chunks.join('')
                });
            }

            delete chunkedDataEvents[eventData.id];
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
 * @param {Boolean} [isChunked] This parameters tells us whether or not we expect the result to come in individual
 * pieces/chunks (because it exceeds
 *  the 10kB limit that pusher has).
 *
 * @return {Promise}
 *
 * @public
 */
function subscribe(channelName, eventName, eventCallback = () => {}, isChunked = false) {
    return new Promise((resolve, reject) => {
        // We cannot call subscribe() before init(). Prevent any attempt to do this on dev.
        if (!socket) {
            throw new Error(`[Pusher] instance not found. Pusher.subscribe()
            most likely has been called before Pusher.init()`);
        }

        console.debug('[Pusher] Attempting to subscribe to channel', true, {channelName, eventName});
        let channel = getChannel(channelName);

        if (!channel || !channel.subscribed) {
            channel = socket.subscribe(channelName);
            channel.bind('pusher:subscription_succeeded', () => {
                bindEventToChannel(channel, eventName, eventCallback, isChunked);

                // Remove this event subscriber so we do not bind another
                // event with each reconnect attempt
                channel.unbind('pusher:subscription_succeeded');
                resolve();
            });

            channel.bind('pusher:subscription_error', (status) => {
                if (status === 403) {
                    console.debug('[Pusher] Issue authenticating with Pusher during subscribe attempt.', 0, {
                        channelName,
                        status
                    });
                }

                reject(status);
            });
        } else {
            bindEventToChannel(channel, eventName, eventCallback, isChunked);
            resolve();
        }
    });
}

/**
 * Waits for the subscription_succeeded event to fire before returning members or
 * returns the current members if the subscription has already succeeded.
 *
 * @param {String} channelName
 *
 * @return {Promise}
 */
function getChannelMembersAsync(channelName) {
    return new Promise((resolve, reject) => subscribe(channelName)
        .done(() => {
            const channel = getChannel(channelName);
            resolve(channel.members.members);
        })
        .fail(() => {
            console.debug('[Pusher] Unable to subscribe to presence channel while getting channel members async');
            reject();
        }));
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
        console.debug(`[Pusher] Attempted to unsubscribe or unbind from a channel,
        but Pusher-JS has no knowledge of it`, 0, {channelName, eventName});
        return;
    }

    if (eventName) {
        console.debug('[Pusher] Unbinding event', true, {eventName, channelName});
        channel.unbind(eventName);
    } else {
        if (!channel.subscribed) {
            // eslint-disable-next-line no-console
            console.warn(`[Pusher] Attempted to unsubscribe from channel,
            but we are not subscribed to begin with`, 0, {channelName});
            return;
        }

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
    socket.send_event(eventName, payload, channelName);
}

/**
 * Sends an event across multiple pieces over a channel.
 *
 * @param {String} channelName
 * @param {String} eventName
 * @param {Object} payload
 */
function sendChunkedEvent(channelName, eventName, payload) {
    const chunkSize = 9000;
    const payloadString = JSON.stringify(payload);
    const msgId = Math.random().toString();
    for (let i = 0; i * chunkSize < payloadString.length; i++) {
        socket.send_event(eventName, {
            id: msgId,
            index: i,
            chunk: payloadString.substr(i * chunkSize, chunkSize),
            final: chunkSize * (i + 1) >= payloadString.length
        }, channelName);
    }
}

/**
 * Register a method that will be triggered when a socket event happens (like disconnecting)
 *
 * @param {function} cb
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
    socket.disconnect();
    socket = null;
}

/**
 * Disconnect and Re-Connect Pusher
 */
function reconnect() {
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
    getChannelMembersAsync,
    getChannel,
    isSubscribed,
    isAlreadySubscribing,
    sendEvent,
    sendChunkedEvent,
    registerSocketEventCallback,
    registerCustomAuthorizer,
    disconnect,
    reconnect,
};
