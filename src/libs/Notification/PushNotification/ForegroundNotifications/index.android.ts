import Airship from '@ua/react-native-airship';
import shouldShowPushNotification from '@libs/Notification/PushNotification/shouldShowPushNotification';
import ForegroundNotificationsType from './types';

function configureForegroundNotifications() {
    Airship.push.android.setForegroundDisplayPredicate((pushPayload) => Promise.resolve(shouldShowPushNotification(pushPayload)));
}

function disableForegroundNotifications() {
    Airship.push.android.setForegroundDisplayPredicate(() => Promise.resolve(false));
}

const ForegroundNotifications: ForegroundNotificationsType = {
    configureForegroundNotifications,
    disableForegroundNotifications,
};

export default ForegroundNotifications;
