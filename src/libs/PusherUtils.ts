import type {OnyxKey} from 'react-native-onyx';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import type {OnyxUpdatesFromServer} from '@src/types/onyx';
import type {OnyxServerUpdate} from '@src/types/onyx/OnyxUpdatesFromServer';
import Log from './Log';
import NetworkConnection from './NetworkConnection';
import Pusher from './Pusher';
import type {PingPongEvent} from './Pusher/types';

type Callback<TKey extends OnyxKey> = (data: Array<OnyxServerUpdate<TKey>>) => Promise<void>;

// Keeps track of all the callbacks that need triggered for each event type
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
function subscribeToPrivateUserChannelEvent(eventName: string, accountID: string, onEvent: (pushJSON: OnyxUpdatesFromServer | PingPongEvent) => void) {
    const pusherChannelName = getUserChannelName(accountID);

    function logPusherEvent(pushJSON: OnyxUpdatesFromServer | PingPongEvent) {
        Log.info(`[Report] Handled ${eventName} event sent by Pusher`, false, pushJSON);
    }

    function onPusherResubscribeToPrivateUserChannel() {
        NetworkConnection.triggerReconnectionCallbacks('Pusher re-subscribed to private user channel');
    }

    function onEventPush(pushJSON: OnyxUpdatesFromServer | PingPongEvent) {
        logPusherEvent(pushJSON);
        onEvent(pushJSON);
    }

    function onSubscriptionFailed(error: Error) {
        Log.hmmm('Failed to subscribe to Pusher channel', {error, pusherChannelName, eventName});
    }
    Pusher.subscribe(pusherChannelName, eventName, onEventPush, onPusherResubscribeToPrivateUserChannel).catch(onSubscriptionFailed);
}

export default {
    subscribeToPrivateUserChannelEvent,
    subscribeToMultiEvent,
    triggerMultiEventHandler,
};
