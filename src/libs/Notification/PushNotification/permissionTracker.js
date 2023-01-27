import _ from 'underscore';
import lodashGet from 'lodash/get';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../../ONYXKEYS';
import * as Device from '../../actions/Device';

let isUserOptedInToPushNotifications = false;
const getDeviceIDPromise = Device.getDeviceID()
    .then((deviceID) => {
        Onyx.connect({
            key: ONYXKEYS.NVP_PUSH_NOTIFICATIONS_ENABLED,
            callback: (val) => {
                const pushNotificationOptInRecord = lodashGet(val, deviceID, []);
                const mostRecentNVPValue = _.last(pushNotificationOptInRecord);
                if (!_.has(mostRecentNVPValue, 'isEnabled')) {
                    return;
                }
                isUserOptedInToPushNotifications = mostRecentNVPValue.isEnabled;
            },
        });
    });

/**
 * @returns {Promise<Boolean>}
 */
function isUserOptedIntoPushNotifications() {
    return getDeviceIDPromise.then(() => isUserOptedInToPushNotifications);
}

export default {
    isUserOptedIntoPushNotifications,
};
