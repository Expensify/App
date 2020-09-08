import {UrbanAirship} from 'urbanairship-react-native';

/* ====== Public Functions (signatures must match index.js) ====== */

/**
 * See if user notification permissions are set, and ask for permission if not set.
 *
 * @returns {Promise}
 */
function enableUserNotifications() {
    return UrbanAirship.enableUserPushNotifications();
}

function showCommentNotification({reportAction, onClick}) {
    // TODO: show "snackbar"/GROWL notification
}

export default {
    enableUserNotifications,
    showCommentNotification,
};
