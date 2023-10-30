import Airship from '@ua/react-native-airship';
import shouldShowPushNotification from '../shouldShowPushNotification';

function configureForegroundNotifications() {
    Airship.push.android.setForegroundDisplayPredicate((pushPayload) => Promise.resolve(shouldShowPushNotification(pushPayload)));
}

function disableForegroundNotifications() {
    Airship.push.android.setForegroundDisplayPredicate(() => Promise.resolve(false));
}

export default {
    configureForegroundNotifications,
    disableForegroundNotifications,
};
