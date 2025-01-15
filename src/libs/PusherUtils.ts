import type {OnyxUpdate} from 'react-native-onyx';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import type {OnyxUpdatesFromServer} from '@src/types/onyx';
import Log from './Log';
import NetworkConnection from './NetworkConnection';
import * as Pusher from './Pusher/pusher';

type Callback = (data: OnyxUpdate[]) => Promise<void>;

// Keeps track of all the callbacks that need triggered for each event type
const multiEventCallbackMapping: Record<string, Callback> = {};

function getUserChannelName(accountID: string) {
    return `${CONST.PUSHER.PRIVATE_USER_CHANNEL_PREFIX}${accountID}${CONFIG.PUSHER.SUFFIX}` as const;
}

function subscribeToMultiEvent(eventType: string, callback: Callback) {
    multiEventCallbackMapping[eventType] = callback;
}

function triggerMultiEventHandler(eventType: string, data: OnyxUpdate[]): Promise<void> {
    if (!multiEventCallbackMapping[eventType]) {
        Log.warn('[PusherUtils] Received unexpected multi-event', {eventType});
        return Promise.resolve();
    }
    return multiEventCallbackMapping[eventType](data);
}

/**
 * Abstraction around subscribing to private user channel events. Handles all logs and errors automatically.
 */
function subscribeToPrivateUserChannelEvent(eventName: string, accountID: string, onEvent: (pushJSON: OnyxUpdatesFromServer | Pusher.PingPongEvent) => void) {
    const pusherChannelName = getUserChannelName(accountID);

    function logPusherEvent(pushJSON: OnyxUpdatesFromServer | Pusher.PingPongEvent) {
        Log.info(`[Report] Handled ${eventName} event sent by Pusher`, false, pushJSON);
    }

    function onPusherResubscribeToPrivateUserChannel() {
        NetworkConnection.triggerReconnectionCallbacks('Pusher re-subscribed to private user channel');
    }

    function onEventPush(pushJSON: OnyxUpdatesFromServer | Pusher.PingPongEvent) {
        logPusherEvent(pushJSON);
        onEvent(pushJSON);
    }

    function onSubscriptionFailed(error: Error) {
        Log.hmmm('Failed to subscribe to Pusher channel', {error, pusherChannelName, eventName});
    }
    Pusher.subscribe(pusherChannelName, eventName, onEventPush, onPusherResubscribeToPrivateUserChannel).catch(onSubscriptionFailed);
}

export default {
    getUserChannelName,
    subscribeToPrivateUserChannelEvent,
    subscribeToMultiEvent,
    triggerMultiEventHandler,
};
