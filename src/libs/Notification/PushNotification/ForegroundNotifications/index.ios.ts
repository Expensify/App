import Airship, {iOS} from '@ua/react-native-airship';
import shouldShowPushNotification from '@libs/Notification/PushNotification/shouldShowPushNotification';
import type ForegroundNotificationsModule from './types';

function configureForegroundNotifications() {
    // Set our default iOS foreground presentation to be loud with a banner
    // More info here https://developer.apple.com/documentation/usernotifications/unusernotificationcenterdelegate/1649518-usernotificationcenter
    Airship.push.iOS.setForegroundPresentationOptions([
        iOS.ForegroundPresentationOption.List,
        iOS.ForegroundPresentationOption.Banner,
        iOS.ForegroundPresentationOption.Sound,
        iOS.ForegroundPresentationOption.Badge,
    ]);

    // Set a callback to override our foreground presentation per notification depending on the app's current state.
    // Returning null keeps the default presentation. Returning [] uses no presentation (hides the notification).
    Airship.push.iOS.setForegroundPresentationOptionsCallback((pushPayload) => Promise.resolve(shouldShowPushNotification(pushPayload) ? null : []));
}

function disableForegroundNotifications() {
    Airship.push.iOS.setForegroundPresentationOptionsCallback(() => Promise.resolve([]));
}

const ForegroundNotifications: ForegroundNotificationsModule = {
    configureForegroundNotifications,
    disableForegroundNotifications,
};

export default ForegroundNotifications;
