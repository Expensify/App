import * as Sentry from '@sentry/react-native';
import isObject from 'lodash/isObject';
import type {Channel, ChannelAuthorizerGenerator, Options} from 'pusher-js/with-encryption';
import Pusher from 'pusher-js/with-encryption';
// eslint-disable-next-line no-restricted-imports
import {InteractionManager} from 'react-native';
import Onyx from 'react-native-onyx';
import Log from '@libs/Log';
import ONYXKEYS from '@src/ONYXKEYS';
import TYPE from './EventType';
import type {
    Args,
    ChunkedDataEvents,
    EventCallbackError,
    EventData,
    PusherEventName,
    PusherSubscription,
    PusherSubscriptionErrorData,
    PusherWithAuthParams,
    SocketEventCallback,
    SocketEventName,
    States,
} from './types';
import type PusherModule from './types';

let shouldForceOffline = false;

// shouldForceOffline is only used to ignore pusher events when the client has been forced offline.
// Since it's not connected to any UI, it's OK to use connectWithoutView.
Onyx.connectWithoutView({
    key: ONYXKEYS.NETWORK,
    callback: (network) => {
        if (!network) {
            return;
        }
        shouldForceOffline = !!network.shouldForceOffline;
    },
});

let socket: PusherWithAuthParams | null;
let pusherSocketID: string | undefined;
const socketEventCallbacks: SocketEventCallback[] = [];
let customAuthorizer: ChannelAuthorizerGenerator;

let resolveInitPromise: () => void;
let initPromise = new Promise<void>((resolve) => {
    resolveInitPromise = resolve;
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Pusher callbacks have varying signatures due to chunking wrapper
type BoundCallback = (eventData: any) => void;

const eventsBoundToChannels = new Map<Channel, Map<PusherEventName, Set<BoundCallback>>>();

/**
 * Trigger each of the socket event callbacks with the event information
 */
function callSocketEventCallbacks(eventName: SocketEventName, data?: EventCallbackError | States) {
    for (const cb of socketEventCallbacks) {
        cb(eventName, data);
    }
}

/**
 * Initialize our pusher lib
 * @returns resolves when Pusher has connected
 */
function init(args: Args): Promise<void> {
    return new Promise<void>((resolve) => {
        if (socket) {
            resolve();
            return;
        }

        // Use this for debugging
        // Pusher.log = (message) => {
        //     if (window.console && window.console.log) {
        //         window.console.log(message);
        //     }
        // };

        const options: Options = {
            cluster: args.cluster,
            authEndpoint: args.authEndpoint,
        };

        if (customAuthorizer) {
            options.authorizer = customAuthorizer;
        }

        socket = new Pusher(args.appKey, options);

        // Listen for connection errors and log them
        socket?.connection.bind('error', (error: EventCallbackError) => {
            callSocketEventCallbacks('error', error);
        });

        socket?.connection.bind('connected', () => {
            pusherSocketID = socket?.connection.socket_id;
            callSocketEventCallbacks('connected');
            resolve();
        });

        socket?.connection.bind('disconnected', () => {
            callSocketEventCallbacks('disconnected');
        });

        socket?.connection.bind('state_change', (states: States) => {
            callSocketEventCallbacks('state_change', states);
        });
    }).then(resolveInitPromise);
}

/**
 * Returns a Pusher channel for a channel name
 */
function getChannel(channelName: string): Channel | undefined {
    if (!socket) {
        return;
    }

    return socket.channel(channelName);
}

/**
 * Binds an event callback to a channel + eventName.
 * Returns the wrapped callback so it can be individually unbound later.
 */
function bindEventToChannel<EventName extends PusherEventName>(
    channel: Channel | undefined,
    eventName?: EventName,
    eventCallback: (data: EventData<EventName>) => void = () => {},
): BoundCallback | undefined {
    if (!eventName || !channel) {
        return undefined;
    }

    const chunkedDataEvents: Record<string, ChunkedDataEvents> = {};
    const callback = (eventData: EventData<EventName>) => {
        if (shouldForceOffline) {
            Log.info('[Pusher] Ignoring a Push event because shouldForceOffline = true');
            return;
        }

        let data: EventData<EventName>;
        try {
            data = isObject(eventData) ? eventData : (JSON.parse(eventData) as EventData<EventName>);
        } catch (err) {
            Log.alert('[Pusher] Unable to parse single JSON event data from Pusher', {error: err, eventData});
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
                eventCallback(JSON.parse(chunkedEvent.chunks.join('')) as EventData<EventName>);
            } catch (err) {
                Log.alert('[Pusher] Unable to parse chunked JSON response from Pusher', {
                    error: err,
                    eventData: chunkedEvent.chunks.join(''),
                });

                // Using console.error is helpful here because it will print a usable stack trace to the console to debug where the error comes from
                console.error(err);
            }

            delete chunkedDataEvents[data.id];
        }
    };

    channel.bind(eventName, callback);

    if (!eventsBoundToChannels.has(channel)) {
        eventsBoundToChannels.set(channel, new Map());
    }
    const eventMap = eventsBoundToChannels.get(channel);
    if (!eventMap?.has(eventName)) {
        eventMap?.set(eventName, new Set());
    }
    eventMap?.get(eventName)?.add(callback);

    return callback;
}

/**
 * Subscribe to a channel and an event.
 * Returns a PusherSubscription — a Promise (for backward-compatible .catch()/.then())
 * with an .unsubscribe() method that removes only this specific callback.
 * @param [onResubscribe] Callback to be called when reconnection happen
 */
function subscribe<EventName extends PusherEventName>(
    channelName: string,
    eventName?: EventName,
    eventCallback: (data: EventData<EventName>) => void = () => {},
    onResubscribe = () => {},
): PusherSubscription {
    let wrappedCb: BoundCallback | undefined;
    let resolvedChannel: Channel | undefined;
    let disposed = false;

    const promise = initPromise.then(
        () =>
            new Promise<void>((resolve, reject) => {
                InteractionManager.runAfterInteractions(() => {
                    if (disposed) {
                        resolve();
                        return;
                    }

                    // We cannot call subscribe() before init(). Prevent any attempt to do this on dev.
                    if (!socket) {
                        const error = new Error('[Pusher] instance not found. Pusher.subscribe() most likely has been called before Pusher.init()');

                        if (__DEV__) {
                            throw error;
                        }

                        // In production, report to Sentry without crashing the app.
                        // This can happen when disconnect() is called (e.g. during the "Upgrade Required"
                        // teardown) before this deferred InteractionManager callback runs.
                        Sentry.captureException(error, {
                            tags: {source: 'Pusher.subscribe'},
                            extra: {channelName, eventName},
                        });
                        Log.info('[Pusher] Socket disconnected before subscribe could complete, skipping subscription', false, {channelName, eventName});
                        resolve();
                        return;
                    }

                    Log.info('[Pusher] Attempting to subscribe to channel', false, {channelName, eventName});
                    let channel = getChannel(channelName);

                    if (!channel?.subscribed) {
                        channel = socket.subscribe(channelName);
                        let isBound = false;
                        channel.bind('pusher:subscription_succeeded', () => {
                            // Check so that we do not bind another event with each reconnect attempt
                            if (!isBound) {
                                if (!disposed) {
                                    wrappedCb = bindEventToChannel(channel, eventName, eventCallback);
                                    resolvedChannel = channel ?? undefined;
                                } else if (channel) {
                                    // Handle was disposed mid-handshake — clean up the channel
                                    // if no other subscribers have bound callbacks to it
                                    const eventMap = eventsBoundToChannels.get(channel);
                                    if (!eventMap || eventMap.size === 0) {
                                        eventsBoundToChannels.delete(channel);
                                        socket?.unsubscribe(channelName);
                                    }
                                }
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

                        channel.bind('pusher:subscription_error', (data: PusherSubscriptionErrorData = {}) => {
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
                        if (!disposed) {
                            wrappedCb = bindEventToChannel(channel, eventName, eventCallback);
                            resolvedChannel = channel;
                        }
                        resolve();
                    }
                });
            }),
    );

    return Object.assign(promise, {
        unsubscribe: () => {
            disposed = true;
            if (!wrappedCb || !resolvedChannel || !eventName) {
                return;
            }

            // 1. Unbind this specific callback from pusher-js
            resolvedChannel.unbind(eventName, wrappedCb);

            // 2. Remove from tracking
            const eventMap = eventsBoundToChannels.get(resolvedChannel);
            const callbacks = eventMap?.get(eventName);
            callbacks?.delete(wrappedCb);

            // 3. If last callback for this event, remove the event
            if (callbacks?.size === 0) {
                eventMap?.delete(eventName);
            }

            // 4. If last event on this channel, unsubscribe entirely
            if (eventMap?.size === 0) {
                eventsBoundToChannels.delete(resolvedChannel);
                socket?.unsubscribe(channelName);
            }

            wrappedCb = undefined;
            resolvedChannel = undefined;
        },
    });
}

/**
 * Unsubscribe from a channel and optionally a specific event.
 * This removes ALL callbacks for the given event (or all events on the channel).
 * For per-callback removal, use the .unsubscribe() method on the PusherSubscription handle.
 */
function unsubscribe(channelName: string, eventName: PusherEventName = '') {
    const channel = getChannel(channelName);

    if (!channel) {
        Log.hmmm('[Pusher] Attempted to unsubscribe or unbind from a channel, but Pusher-JS has no knowledge of it', {channelName, eventName});
        return;
    }

    if (eventName) {
        Log.info('[Pusher] Unbinding event', false, {eventName, channelName});
        channel.unbind(eventName);
        eventsBoundToChannels.get(channel)?.delete(eventName);
        if (eventsBoundToChannels.get(channel)?.size === 0) {
            Log.info(`[Pusher] After unbinding ${eventName} from channel ${channelName}, no other events were bound to that channel. Unsubscribing...`, false);
            eventsBoundToChannels.delete(channel);
            socket?.unsubscribe(channelName);
        }
    } else {
        if (!channel.subscribed) {
            Log.info('Pusher] Attempted to unsubscribe from channel, but we are not subscribed to begin with', false, {channelName});
            return;
        }
        Log.info('[Pusher] Unsubscribing from channel', false, {channelName});

        channel.unbind();
        eventsBoundToChannels.delete(channel);
        socket?.unsubscribe(channelName);
    }
}

/**
 * Are we already in the process of subscribing to this channel?
 */
function isAlreadySubscribing(channelName: string): boolean {
    if (!socket) {
        return false;
    }

    const channel = getChannel(channelName);
    return channel ? channel.subscriptionPending : false;
}

/**
 * Are we already subscribed to this channel?
 */
function isSubscribed(channelName: string): boolean {
    if (!socket) {
        return false;
    }

    const channel = getChannel(channelName);
    return channel ? channel.subscribed : false;
}

/**
 * Sends an event over a specific event/channel in pusher.
 */
function sendEvent<EventName extends PusherEventName>(channelName: string, eventName: EventName, payload: EventData<EventName>) {
    // Check to see if we are subscribed to this channel before sending the event. Sending client events over channels
    // we are not subscribed too will throw errors and cause reconnection attempts. Subscriptions are not instant and
    // can happen later than we expect.
    if (!isSubscribed(channelName)) {
        return;
    }

    if (shouldForceOffline) {
        Log.info('[Pusher] Ignoring a Send event because shouldForceOffline = true');
        return;
    }

    socket?.send_event(eventName, payload, channelName);
}

/**
 * Register a method that will be triggered when a socket event happens (like disconnecting)
 */
function registerSocketEventCallback(cb: SocketEventCallback) {
    socketEventCallbacks.push(cb);
}

/**
 * A custom authorizer allows us to take a more fine-grained approach to
 * authenticating Pusher. e.g. we can handle failed attempts to authorize
 * with an expired authToken and retry the attempt.
 */
function registerCustomAuthorizer(authorizer: ChannelAuthorizerGenerator) {
    customAuthorizer = authorizer;
}

/**
 * Disconnect from Pusher
 */
function disconnect() {
    if (!socket) {
        Log.info('[Pusher] Attempting to disconnect from Pusher before initialization has occurred, ignoring.');
        return;
    }

    socket.disconnect();
    socket = null;
    pusherSocketID = '';
    eventsBoundToChannels.clear();
    initPromise = new Promise((resolve) => {
        resolveInitPromise = resolve;
    });
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

function getPusherSocketID(): string | undefined {
    return pusherSocketID;
}

if (window) {
    /**
     * Pusher socket for debugging purposes
     */
    window.getPusherInstance = () => socket;
}

const WebPusher: PusherModule = {
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
    getPusherSocketID,
};

export default WebPusher;
