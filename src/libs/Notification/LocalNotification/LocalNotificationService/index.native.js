import PushNotification from 'react-native-push-notification';
import LocalNotification from '../LocalNotification';

/*
 * Note: react-native-push-notification uses a single global event handler for `onNotification`.
 * So in order to provide an API similar to that of BrowserNotifications,
 * where we can simply pass a payload and an `onPress` callback, we need to process each notification by:
 *
 *     1. Setting the global `onNotification` event handler to be the `onPress` callback for the given notification.
 *     2. Triggering the local push notification.
 *     3. Resetting the global `onNotification` event handler.
 *
 * That's why we need to process notifications in a queue – otherwise we could produce the following race condition:
 *
 *     1. A notification + callback is dispatched (call it X)
 *     2. We set the global `onNotification` event handler to be X.onPress
 *     3. Another notification + callback is dispatched (call it Y)
 *     4. We set the global `onNotification` event handler to be Y.onPress
 *     5. X.notification is displayed.
 *     6. The user taps X.notification, and Y.onPress is executed. 😵
 */

const notificationQueue = [];
let currentlyProcessingNotification = null;
let onNotification = () => {};
let channelInitialized = false;

PushNotification.configure({
    onNotification: e => onNotification(e),
});

/**
 * Get the local notification channel (required for Android)
 *
 * @returns {String} – The channel ID
 * @throws {Error} – If the channel could not be initialized.
 */
function getChannel() {
    const CHANNEL_ID = 'local_push_notification';
    if (channelInitialized) {
        return CHANNEL_ID;
    }

    PushNotification.createChannel(
        {
            channelId: CHANNEL_ID,
            channelName: CHANNEL_ID,
        },
        (created) => {
            if (created) {
                channelInitialized = true;
                console.debug(`[LOCAL_NOTIFICATION] Local notification channel ${CHANNEL_ID} initialized`);
                return CHANNEL_ID;
            }

            // Channel not initialized
            throw new Error('Local notification channel not initialized');
        },
    );
}

/**
 * Process the notification queue recursively.
 *
 * @throws {Error}
 */
function processQueue() {
    currentlyProcessingNotification = notificationQueue.shift();
    if (currentlyProcessingNotification) {
        // Bind notification event handler
        onNotification = currentlyProcessingNotification.onPress;

        // Trigger local push notification
        PushNotification.localNotification({
            channelId: getChannel(),
            title: currentlyProcessingNotification.title,
            message: currentlyProcessingNotification.message,
        });

        // Continue to process notification queue
        processQueue();
    }
}

/**
 * Add a new notification to the queue and start processing the queue if necessary.
 *
 * @param {LocalNotification} notification
 * @throws {Error}
 */
function queueNotification(notification) {
    if (!(notification instanceof LocalNotification)) {
        throw new Error('Attempting to queue invalid LocalNotification');
    }

    // Add notification to the queue
    notificationQueue.push(notification);

    // Begin processing the queue if it is not already processing
    if (!currentlyProcessingNotification) {
        processQueue();
    }
}

export default {
    queueNotification,
};
