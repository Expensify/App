import {OnyxUpdate} from 'react-native-onyx';
import CONFIG from '../CONFIG';
import Log from './Log';
import NetworkConnection from './NetworkConnection';
import * as Pusher from './Pusher/pusher';
import CONST from '../CONST';
import {PushJSON} from './Pusher/pusher';

type Callback = (data: OnyxUpdate[]) => Promise<void>;

// Keeps track of all the callbacks that need triggered for each event type
const multiEventCallbackMapping: Record<string, Callback> = {};

function subscribeToMultiEvent(eventType: string, callback: Callback) {
    multiEventCallbackMapping[eventType] = callback;
}

function triggerMultiEventHandler(eventType: string, data: OnyxUpdate[]): Promise<void> {
    if (!multiEventCallbackMapping[eventType]) {
        return Promise.resolve();
    }
    return multiEventCallbackMapping[eventType](data);
}

/**
 * Abstraction around subscribing to private user channel events. Handles all logs and errors automatically.
 */
function subscribeToPrivateUserChannelEvent(eventName: string, accountID: string, onEvent: (pushJSON: PushJSON) => void) {
    const pusherChannelName = `${CONST.PUSHER.PRIVATE_USER_CHANNEL_PREFIX}${accountID}${CONFIG.PUSHER.SUFFIX}`;

    function logPusherEvent(pushJSON: PushJSON) {
        Log.info(`[Report] Handled ${eventName} event sent by Pusher`, false, pushJSON);
    }

    function onPusherResubscribeToPrivateUserChannel() {
        NetworkConnection.triggerReconnectionCallbacks('Pusher re-subscribed to private user channel');
    }

    function onEventPush(pushJSON: PushJSON) {
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
