import type {PusherAuthorizerResult, PusherChannel} from '@pusher/pusher-websocket-react-native';
import {Pusher} from '@pusher/pusher-websocket-react-native';
import isObject from 'lodash/isObject';
import {InteractionManager} from 'react-native';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import Log from '@libs/Log';
import {authenticatePusher} from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import TYPE from './EventType';
import type {Args, ChunkedDataEvents, EventCallbackError, EventData, PusherEventName, SocketEventCallback, SocketEventName, States} from './types';
import type PusherModule from './types';

let shouldForceOffline = false;
// We have used `connectWithoutView` here because it is not connected to any UI
Onyx.connectWithoutView({
    key: ONYXKEYS.NETWORK,
    callback: (network) => {
        if (!network) {
            return;
        }
        shouldForceOffline = !!network.shouldForceOffline;
    },
});

let socket: Pusher | null;
let pusherSocketID: string | undefined;
const socketEventCallbacks: SocketEventCallback[] = [];

let resolveInitPromise: () => void;
let initPromise = new Promise<void>((resolve) => {
    resolveInitPromise = resolve;
});

const eventsBoundToChannels = new Map<string, Map<PusherEventName, (eventData: EventData<PusherEventName>) => void>>();
let channels: Record<string, ValueOf<typeof CONST.PUSHER.CHANNEL_STATUS>> = {};

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

        socket = Pusher.getInstance();
        socket.init({
            apiKey: args.appKey,
            cluster: args.cluster,
            onConnectionStateChange: (currentState: string, previousState: string) => {
                if (currentState === CONST.PUSHER.STATE.CONNECTED) {
                    socket?.getSocketId().then((id: string) => {
                        pusherSocketID = id;
                        callSocketEventCallbacks('connected');
                        resolve();
                    });
                }
                if (currentState === CONST.PUSHER.STATE.DISCONNECTED) {
                    callSocketEventCallbacks('disconnected');
                }
                callSocketEventCallbacks('state_change', {previous: previousState, current: currentState});
            },
            onError: (message: string) => callSocketEventCallbacks('error', {data: {message}}),
            onAuthorizer: (channelName: string, socketId: string) => authenticatePusher(socketId, channelName) as Promise<PusherAuthorizerResult>,
        });
        socket.connect();
    }).then(resolveInitPromise);
}

/**
 * Returns a Pusher channel for a channel name
 */
function getChannel(channelName: string): PusherChannel | undefined {
    if (!socket) {
        return;
    }

    return socket.getChannel(channelName);
}

/**
 * Parses JSON data that may be single or double-encoded
 * This handles cases where the backend sometimes sends double-encoded JSON
 * Reference issue: https://github.com/Expensify/App/issues/60332
 */
function parseEventData<EventName extends PusherEventName>(eventData: EventData<EventName>): EventData<EventName> | null {
    if (isObject(eventData)) {
        return eventData;
    }

    if (typeof eventData !== 'string') {
        Log.alert('[Pusher] Event data is neither object nor string', {eventData});
        return null;
    }

    try {
        const firstParse = JSON.parse(eventData) as EventData<EventName> | string;

        // If result is still a string, it was double-encoded - parse again
        if (typeof firstParse === 'string') {
            return JSON.parse(firstParse) as EventData<EventName>;
        }

        return firstParse;
    } catch (error) {
        Log.alert('[Pusher] Failed to parse event data', {
            error: error instanceof Error ? error.message : 'Unknown error',
            eventData,
        });
        return null;
    }
}

/**
 * Binds an event callback to a channel + eventName
 */
function bindEventToChannel<EventName extends PusherEventName>(channel: string, eventName?: EventName, eventCallback: (data: EventData<EventName>) => void = () => {}) {
    if (!eventName) {
        return;
    }

    const chunkedDataEvents: Record<string, ChunkedDataEvents> = {};
    const callback = (eventData: EventData<EventName>) => {
        if (shouldForceOffline) {
            Log.info('[Pusher] Ignoring a Push event because shouldForceOffline = true');
            return;
        }

        const data = parseEventData(eventData);
        if (!data) {
            // Error already logged in parseEventData
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

    if (!eventsBoundToChannels.has(channel)) {
        eventsBoundToChannels.set(channel, new Map());
    }

    eventsBoundToChannels.get(channel)?.set(eventName, callback as (eventData: EventData<PusherEventName>) => void);
}

/**
 * Subscribe to a channel and an event
 */
function subscribe<EventName extends PusherEventName>(
    channelName: string,
    eventName?: EventName,
    eventCallback: (data: EventData<EventName>) => void = () => {},
    onResubscribe = () => {},
): Promise<void> {
    return initPromise.then(
        () =>
            new Promise((resolve, reject) => {
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                InteractionManager.runAfterInteractions(() => {
                    // We cannot call subscribe() before init(). Prevent any attempt to do this on dev.
                    if (!socket) {
                        throw new Error(`[Pusher] instance not found. Pusher.subscribe()
            most likely has been called before Pusher.init()`);
                    }

                    Log.info('[Pusher] Attempting to subscribe to channel', false, {channelName, eventName});

                    if (!channels[channelName]) {
                        channels[channelName] = CONST.PUSHER.CHANNEL_STATUS.SUBSCRIBING;
                        socket.subscribe({
                            channelName,
                            onEvent: (event) => {
                                const callback = eventsBoundToChannels.get(event.channelName)?.get(event.eventName);
                                callback?.(event.data as EventData<PusherEventName>);
                            },
                            onSubscriptionSucceeded: () => {
                                channels[channelName] = CONST.PUSHER.CHANNEL_STATUS.SUBSCRIBED;
                                bindEventToChannel(channelName, eventName, eventCallback);
                                resolve();
                                // When subscribing for the first time we register a success callback that can be
                                // called multiple times when the subscription succeeds again in the future
                                // e.g. as a result of Pusher disconnecting and reconnecting. This callback does
                                // not fire on the first subscription_succeeded event.
                                onResubscribe();
                            },
                            onSubscriptionError: (name: string, message: string) => {
                                delete channels[channelName];
                                Log.hmmm('[Pusher] Issue authenticating with Pusher during subscribe attempt.', {
                                    channelName,
                                    message,
                                });
                                reject(message);
                            },
                        });
                    } else {
                        bindEventToChannel(channelName, eventName, eventCallback);
                        resolve();
                    }
                });
            }),
    );
}

/**
 * Unsubscribe from a channel and optionally a specific event
 */
function unsubscribe(channelName: string, eventName: PusherEventName = '') {
    const channel = getChannel(channelName);

    if (!channel) {
        Log.hmmm('[Pusher] Attempted to unsubscribe or unbind from a channel, but Pusher-JS has no knowledge of it', {channelName, eventName});
        return;
    }

    if (eventName) {
        Log.info('[Pusher] Unbinding event', false, {eventName, channelName});
        eventsBoundToChannels.get(channelName)?.delete(eventName);
        if (eventsBoundToChannels.get(channelName)?.size === 0) {
            Log.info(`[Pusher] After unbinding ${eventName} from channel ${channelName}, no other events were bound to that channel. Unsubscribing...`, false);
            eventsBoundToChannels.delete(channelName);
            delete channels[channelName];
            socket?.unsubscribe({channelName});
        }
    } else {
        Log.info('[Pusher] Unsubscribing from channel', false, {channelName});
        eventsBoundToChannels.delete(channelName);
        delete channels[channelName];
        socket?.unsubscribe({channelName});
    }
}

/**
 * Are we already in the process of subscribing to this channel?
 */
function isAlreadySubscribing(channelName: string): boolean {
    if (!socket) {
        return false;
    }

    return channels[channelName] === CONST.PUSHER.CHANNEL_STATUS.SUBSCRIBING;
}

/**
 * Are we already subscribed to this channel?
 */
function isSubscribed(channelName: string): boolean {
    if (!socket) {
        return false;
    }

    return channels[channelName] === CONST.PUSHER.CHANNEL_STATUS.SUBSCRIBED;
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

    socket?.trigger({channelName, eventName, data: JSON.stringify(payload)});
}

/**
 * Register a method that will be triggered when a socket event happens (like disconnecting)
 */
function registerSocketEventCallback(cb: SocketEventCallback) {
    socketEventCallbacks.push(cb);
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
    channels = {};
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

const MobilePusher: PusherModule = {
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
    TYPE,
    getPusherSocketID,
};

export default MobilePusher;
