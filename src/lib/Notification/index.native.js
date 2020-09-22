import {UrbanAirship, NotificationOptionsIOS} from 'urbanairship-react-native';
import _ from 'underscore';

// By default, we set all foreground push notification options to true (only relevant to iOS)
const foregroundPresentationOptions = _.mapObject(_.invert(NotificationOptionsIOS), () => true);

/* ====== Public Functions (signatures must match index.js) ====== */

/**
 * See if user notification permissions are set, and ask for permission if not set.
 *
 * @returns {Promise}
 */
function enableUserNotifications() {
    UrbanAirship.setForegroundPresentationOptions(foregroundPresentationOptions);
    return UrbanAirship.enableUserPushNotifications();
}

function showCommentNotification({reportAction, onClick}) {
    // TODO: show "snackbar"/GROWL notification
}

export default {
    enableUserNotifications,
    showCommentNotification,
};
