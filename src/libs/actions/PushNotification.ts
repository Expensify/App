import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import ONYXKEYS from '@src/ONYXKEYS';
import * as Device from './Device';

let isUserOptedInToPushNotifications = false;
Onyx.connect({
    key: ONYXKEYS.PUSH_NOTIFICATIONS_ENABLED,
    callback: (value) => {
        if (value === undefined) {
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
        const commandName = isOptingIn ? WRITE_COMMANDS.OPT_IN_TO_PUSH_NOTIFICATIONS : WRITE_COMMANDS.OPT_OUT_OF_PUSH_NOTIFICATIONS;
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
        API.write(commandName, {deviceID: deviceID ?? null}, {optimisticData, failureData});
    });
}

export {
    // eslint-disable-next-line import/prefer-default-export
    setPushNotificationOptInStatus,
};
