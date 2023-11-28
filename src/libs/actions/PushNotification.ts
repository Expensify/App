import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import ONYXKEYS from '@src/ONYXKEYS';
import * as Device from './Device';

let isUserOptedInToPushNotifications = false;
Onyx.connect({
    key: ONYXKEYS.PUSH_NOTIFICATIONS_ENABLED,
    callback: (value) => {
        if (value === null) {
            return;
        }
        isUserOptedInToPushNotifications = value;
    },
});

/**
 * Record that user opted-in or opted-out of push notifications on the current device.
 */
function setPushNotificationOptInStatus(isOptingIn: boolean) {
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
