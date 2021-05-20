import PushNotification from 'react-native-push-notification';
import NotificationGenerator from './NotificationGenerator';

const notificationQueue = [];
let currentlyProcessingNotification = null;
let onNotification = () => {};
let channelInitialized = false;

PushNotification.configure({onNotification});

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
 * Process the notification queue.
 */
function processQueue() {
    currentlyProcessingNotification = notificationQueue.shift();
    if (currentlyProcessingNotification) {
        const {notification, handler} = this.current;

        // Bind notification event handler, if it exists
        onNotification = handler || (() => {});

        // Trigger local push notification
        PushNotification.localNotification({
            channelId: getChannel(),
            ...notification,
        });

        // Continue to process notification queue
        processQueue();
    }
}

/**
 * Add a new notification to the queue and start processing the queue if necessary.
 *
 * @param {Object} notification
 * @param {Function} handler
 */
function queueNotification(notification, handler) {
    // Add notification to the queue
    notificationQueue.push({notification, handler});

    // Begin processing the queue if it is not already processing
    if (!currentlyProcessingNotification) {
        processQueue();
    }
}

/**
 * Create a report comment notification
 *
 * @param {Object} params
 * @param {Object} params.reportAction
 * @param {Function} params.onClick
 */
// TODO: maybe rename this from onClick to something more generic, maybe just onPress?
function showCommentNotification({reportAction, onClick}) {
    queueNotification(NotificationGenerator.getReportActionNotificationPayload(reportAction), onClick);
}

export default {
    showCommentNotification,

    // This notification is unused on iOS/Android
    showUpdateAvailableNotification: () => {},
};
