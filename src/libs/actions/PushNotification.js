import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import * as Device from './Device';

let isUserOptedInToPushNotifications = false;
Onyx.connect({
    key: ONYXKEYS.PUSH_NOTIFICATIONS_ENABLED,
    callback: (val) => (isUserOptedInToPushNotifications = val),
});

/**
 * Record that user opted-in or opted-out of push notifications on the current device.
 *
 * @param {Boolean} isOptingIn
 */
function setPushNotificationOptInStatus(isOptingIn) {
    Device.getDeviceID().then((deviceID) => {
        const commandName = isOptingIn ? 'OptInToPushNotifications' : 'OptOutOfPushNotifications';
        const optimisticData = [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.PUSH_NOTIFICATIONS_ENABLED,
                value: isOptingIn,
            },
        ];
        const failureData = [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.PUSH_NOTIFICATIONS_ENABLED,
                value: isUserOptedInToPushNotifications,
            },
        ];
        API.write(commandName, {deviceID}, {optimisticData, failureData});
    });
}

export {
    // eslint-disable-next-line import/prefer-default-export
    setPushNotificationOptInStatus,
};
