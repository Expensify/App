import isObject from 'lodash/isObject';
import type {Channel, ChannelAuthorizerGenerator, Options} from 'pusher-js/with-encryption';
import {InteractionManager} from 'react-native';
import Onyx from 'react-native-onyx';
import type {LiteralUnion, ValueOf} from 'type-fest';
import Log from '@libs/Log';
import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxUpdatesFromServer, ReportUserIsTyping} from '@src/types/onyx';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import TYPE from './EventType';
import Pusher from './library';
import type {SocketEventName} from './library/types';

type States = {
    previous: string;
    current: string;
};

type Args = {
    appKey: string;
    cluster: string;
    authEndpoint: string;
};

type UserIsTypingEvent = ReportUserIsTyping & {
    userLogin?: string;
};

type UserIsLeavingRoomEvent = Record<string, boolean> & {
    userLogin?: string;
};

type PusherEventMap = {
    [TYPE.USER_IS_TYPING]: UserIsTypingEvent;
    [TYPE.USER_IS_LEAVING_ROOM]: UserIsLeavingRoomEvent;
};

type EventData<EventName extends string> = {chunk?: string; id?: string; index?: number; final?: boolean} & (EventName extends keyof PusherEventMap
    ? PusherEventMap[EventName]
    : OnyxUpdatesFromServer);

type EventCallbackError = {type: ValueOf<typeof CONST.ERROR>; data: {code: number}};

type ChunkedDataEvents = {chunks: unknown[]; receivedFinal: boolean};

type SocketEventCallback = (eventName: SocketEventName, data?: States | EventCallbackError) => void;

type PusherWithAuthParams = InstanceType<typeof Pusher> & {
    config: {
        auth?: {
            params?: unknown;
        };
    };
};

type PusherEventName = LiteralUnion<DeepValueOf<typeof TYPE>, string>;

type PusherSubscribtionErrorData = {type?: string; error?: string; status?: string};

let shouldForceOffline = false;
Onyx.connect({
    key: ONYXKEYS.NETWORK,
    callback: (network) => {
        if (!network) {
            return;
        }
        shouldForceOffline = !!network.shouldForceOffline;
    },
});

let socket: PusherWithAuthParams | null;
let pusherSocketID = '';
const socketEventCallbacks: SocketEventCallback[] = [];
let customAuthorizer: ChannelAuthorizerGenerator;

const eventsBoundToChannels = new Map<Channel, Set<PusherEventName>>();

/**
 * Trigger each of the socket event callbacks with the event information
 */
function callSocketEventCallbacks(eventName: SocketEventName, data?: EventCallbackError | States) {
    socketEventCallbacks.forEach((cb) => cb(eventName, data));
}

/**
 * Initialize our pusher lib
 * @returns resolves when Pusher has connected
 */
function init(args: Args, params?: unknown): Promise<void> {
    return new Promise((resolve) => {
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
    });
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
 * Binds an event callback to a channel + eventName
 */
function bindEventToChannel<EventName extends PusherEventName>(channel: Channel | undefined, eventName?: EventName, eventCallback: (data: EventData<EventName>) => void = () => {}) {
    if (!eventName || !channel) {
        return;
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
        eventsBoundToChannels.set(channel, new Set());
    }
    eventsBoundToChannels.get(channel)?.add(eventName);
}

/**
 * Subscribe to a channel and an event
 * @param [onResubscribe] Callback to be called when reconnection happen
 */
function subscribe<EventName extends PusherEventName>(
    channelName: string,
    eventName?: EventName,
    eventCallback: (data: EventData<EventName>) => void = () => {},
    onResubscribe = () => {},
): Promise<void> {
    return new Promise((resolve, reject) => {
        InteractionManager.runAfterInteractions(() => {
            // We cannot call subscribe() before init(). Prevent any attempt to do this on dev.
            if (!socket) {
                throw new Error(`[Pusher] instance not found. Pusher.subscribe()
            most likely has been called before Pusher.init()`);
            }

            Log.info('[Pusher] Attempting to subscribe to channel', false, {channelName, eventName});
            let channel = getChannel(channelName);

            if (!channel?.subscribed) {
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

                channel.bind('pusher:subscription_error', (data: PusherSubscribtionErrorData = {}) => {
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
    });
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
        Log.info('[Pusher] Attempting to disconnect from Pusher before initialisation has occurred, ignoring.');
        return;
    }

    socket.disconnect();
    socket = null;
    pusherSocketID = '';
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

function getPusherSocketID(): string {
    return pusherSocketID;
}

if (window) {
    /**
     * Pusher socket for debugging purposes
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
    getPusherSocketID,
};

export type {EventCallbackError, States, UserIsTypingEvent, UserIsLeavingRoomEvent};
