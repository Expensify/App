import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import type {AnyOnyxUpdatesFromServer, OnyxServerUpdate} from '@src/types/onyx/OnyxUpdatesFromServer';

import type {OnyxKey} from 'react-native-onyx';

import type {PingPongEvent} from './Pusher/types';

import {reconnect} from './actions/Reconnect';
import getPlatform from './getPlatform';
import Log from './Log';
import Pusher from './Pusher';

type Callback<TKey extends OnyxKey> = (data: Array<OnyxServerUpdate<TKey>>) => Promise<void>;

// Keeps track of all the callbacks that need triggered for each event type
// Using `any` because callbacks can be registered with different key types dynamically.
// 'any' was introduced during migration away from OnyxKey union for TypeScript performance improvement
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const multiEventCallbackMapping: Record<string, Callback<any>> = {};

function getUserChannelName(accountID: string) {
    return `${CONST.PUSHER.PRIVATE_USER_CHANNEL_PREFIX}${accountID}${CONFIG.PUSHER.SUFFIX}` as const;
}

function subscribeToMultiEvent<TKey extends OnyxKey>(eventType: string, callback: Callback<TKey>) {
    multiEventCallbackMapping[eventType] = callback;
}

function triggerMultiEventHandler<TKey extends OnyxKey>(eventType: string, data: Array<OnyxServerUpdate<TKey>>): Promise<void> {
    if (!multiEventCallbackMapping[eventType]) {
        Log.warn('[PusherUtils] Received unexpected multi-event', {eventType});
        return Promise.resolve();
    }
    return (multiEventCallbackMapping[eventType] as Callback<TKey>)(data);
}

/**
 * Abstraction around subscribing to private user channel events. Handles all logs and errors automatically.
 */
function subscribeToPrivateUserChannelEvent(eventName: string, accountID: string, onEvent: (pushJSON: AnyOnyxUpdatesFromServer | PingPongEvent) => void) {
    const pusherChannelName = getUserChannelName(accountID);

    function logPusherEvent(pushJSON: AnyOnyxUpdatesFromServer | PingPongEvent) {
        Log.info(`[Report] Handled ${eventName} event sent by Pusher`, false, pushJSON);
    }

    function onEventPush(pushJSON: AnyOnyxUpdatesFromServer | PingPongEvent) {
        logPusherEvent(pushJSON);
        onEvent(pushJSON);
    }

    function onSubscriptionFailed(error: Error) {
        Log.hmmm('Failed to subscribe to Pusher channel', {error, pusherChannelName, eventName});
    }
    Pusher.subscribe(pusherChannelName, eventName, onEventPush).catch(onSubscriptionFailed);
}

let unregisterPrivateUserChannelResubscribe: (() => void) | undefined;
let didSocketGoUnavailable = false;
let hasBoundSocketStateListener = false;

// Not bound at module load: Pusher imports Session, which reaches back here through API middleware, so `Pusher`
// is still undefined while this module is being evaluated.
function bindSocketStateListenerOnce() {
    if (hasBoundSocketStateListener) {
        return;
    }
    hasBoundSocketStateListener = true;
    Pusher.registerSocketEventCallback((eventName, data) => {
        if (eventName !== 'state_change' || !data || !('current' in data) || data.current !== 'unavailable') {
            return;
        }
        didSocketGoUnavailable = true;
    });
}

function onPrivateUserChannelResubscribe(accountID: string) {
    bindSocketStateListenerOnce();
    unregisterPrivateUserChannelResubscribe?.();
    unregisterPrivateUserChannelResubscribe = Pusher.onChannelResubscribe(getUserChannelName(accountID), () => {
        if (getPlatform() === CONST.PLATFORM.WEB && !didSocketGoUnavailable) {
            Log.info('[PusherUtils] Skipping reconnect, socket recovered without going unavailable');
            return;
        }
        didSocketGoUnavailable = false;
        Log.info('[PusherUtils] Pusher re-subscribed to private user channel, triggering reconnect');
        reconnect();
    });

    return unregisterPrivateUserChannelResubscribe;
}

export default {
    subscribeToPrivateUserChannelEvent,
    onPrivateUserChannelResubscribe,
    subscribeToMultiEvent,
    triggerMultiEventHandler,
};
