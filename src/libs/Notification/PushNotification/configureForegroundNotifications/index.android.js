import Airship from '@ua/react-native-airship';
import shouldShowPushNotification from '../shouldShowPushNotification';

/**
 * Configures notification handling while in the foreground on iOS and Android. This is a no-op on other platforms.
 */
export default function configureForegroundNotifications() {
    Airship.push.android.setForegroundDisplayPredicate(pushPayload => Promise.resolve(shouldShowPushNotification(pushPayload)));
}
