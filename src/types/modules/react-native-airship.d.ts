import '@ua/react-native-airship';
import type {PushNotificationData} from '@libs/Notification/PushNotification/NotificationType';

declare module '@ua/react-native-airship' {
    type PushPayloadOverride = Omit<PushPayload, 'extras'> & {
        extras?: {
            payload: PushNotificationData | string;
        };
    };
}
