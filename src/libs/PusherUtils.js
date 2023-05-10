import CONFIG from '../CONFIG';
import Log from './Log';
import NetworkConnection from './NetworkConnection';
import * as Pusher from './Pusher/pusher';
import CONST from '../CONST';

// Keeps track of all the callbacks that need triggered for each event type
const multiEventCallbackMapping = {};

/**
 * @param {String} eventType
 * @param {Function} callback
 */
function subscribeToMultiEvent(eventType, callback) {
    multiEventCallbackMapping[eventType] = callback;
}

/**
 * @param {String} eventType
 * @param {Mixed} data
 */
function triggerMultiEventHandler(eventType, data) {
    if (!multiEventCallbackMapping[eventType]) {
        return;
    }
    multiEventCallbackMapping[eventType](data);
}

/**
 * Abstraction around subscribing to private user channel events. Handles all logs and errors automatically.
 *
 * @param {String} eventName
 * @param {String} accountID
 * @param {Function} onEvent
 */
function subscribeToPrivateUserChannelEvent(eventName, accountID, onEvent) {
    const pusherChannelName = `${CONST.PUSHER.PRIVATE_USER_CHANNEL_PREFIX}${accountID}${CONFIG.PUSHER.SUFFIX}`;

    /**
     * @param {Object} pushJSON
     */
    function logPusherEvent(pushJSON) {
        Log.info(`[Report] Handled ${eventName} event sent by Pusher`, false, pushJSON);
    }

    function onPusherResubscribeToPrivateUserChannel() {
        NetworkConnection.triggerReconnectionCallbacks('Pusher re-subscribed to private user channel');
    }

    /**
     * @param {*} pushJSON
     */
    function onEventPush(pushJSON) {
        logPusherEvent(pushJSON);
        onEvent(pushJSON);
    }

    /**
     * @param {*} error
     */
    function onSubscriptionFailed(error) {
        Log.hmmm('Failed to subscribe to Pusher channel', false, {error, pusherChannelName, eventName});
    }
    Pusher.subscribe(pusherChannelName, eventName, onEventPush, onPusherResubscribeToPrivateUserChannel).catch(onSubscriptionFailed);
}

export default {
    subscribeToPrivateUserChannelEvent,
    subscribeToMultiEvent,
    triggerMultiEventHandler,
};
