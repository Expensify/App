import Airship, {iOS} from '@ua/react-native-airship';
import shouldShowPushNotification from '../shouldShowPushNotification';

export default function configureForegroundNotifications() {
    // Set our default iOS foreground presentation to be loud with a banner
    // More info here https://developer.apple.com/documentation/usernotifications/unusernotificationcenterdelegate/1649518-usernotificationcenter
    Airship.push.iOS.setForegroundPresentationOptions([
        iOS.ForegroundPresentationOption.List,
        iOS.ForegroundPresentationOption.Banner,
        iOS.ForegroundPresentationOption.Sound,
        iOS.ForegroundPresentationOption.Badge,
    ]);

    Airship.push.iOS.setForegroundPresentationOptionsCallback(pushPayload => Promise.resolve(shouldShowPushNotification(pushPayload) ? null : []));
}
