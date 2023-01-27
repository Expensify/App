import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../../ONYXKEYS';

let isUserOptedInToPushNotifications = false;
Onyx.connect({
    key: ONYXKEYS.PUSH_NOTIFICATIONS_ENABLED,
    callback: val => isUserOptedInToPushNotifications = val,
});

/**
 * @returns {Promise<Boolean>}
 */
function isUserOptedIntoPushNotifications() {
    return isUserOptedInToPushNotifications;
}

export default {
    isUserOptedIntoPushNotifications,
};
