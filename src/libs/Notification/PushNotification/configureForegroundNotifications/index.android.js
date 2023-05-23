import Airship from '@ua/react-native-airship';
import shouldShowPushNotification from '../shouldShowPushNotification';

export default function configureForegroundNotifications() {
    Airship.push.android.setForegroundDisplayPredicate((pushPayload) => Promise.resolve(shouldShowPushNotification(pushPayload)));
}
