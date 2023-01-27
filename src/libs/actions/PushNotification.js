import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import * as Device from './Device';
import PushNotificationPermissionTracker from '../Notification/PushNotification/permissionTracker';

/**
 * Record that user opted-in or opted-out of push notifications on the current device.
 * NOTE: This is purely for record-keeping purposes, and does not affect whether our server will attempt to send notifications to this user.
 *
 * @param {Boolean} isOptingIn
 */
function setPushNotificationOptInStatus(isOptingIn) {
    Promise.all([
        Device.getDeviceID(),
        PushNotificationPermissionTracker.isUserOptedIntoPushNotifications(),
    ])
        .then(([
            deviceID,
            isUserOptedInToPushNotifications,
        ]) => {
            const commandName = isOptingIn ? 'OptInToPushNotifications' : 'OptOutOfPushNotifications';
            const optimisticData = [
                {
                    onyxMethod: CONST.ONYX.METHOD.MERGE,
                    key: ONYXKEYS.PUSH_NOTIFICATIONS_ENABLED,
                    value: isOptingIn,
                },
            ];
            const failureData = [
                {
                    onyxMethod: CONST.ONYX.METHOD.MERGE,
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
