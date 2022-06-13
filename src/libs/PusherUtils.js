import CONFIG from '../CONFIG';
import Log from './Log';
import * as Pusher from './Pusher/pusher';
import CONST from '../CONST';

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
    Pusher.subscribe(pusherChannelName, eventName, onEventPush)
        .catch(onSubscriptionFailed);
}

export default {
    subscribeToPrivateUserChannelEvent,
};
