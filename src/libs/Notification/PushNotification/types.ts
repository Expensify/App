import type {ValueOf} from 'type-fest';
import type {NotificationDataMap} from './NotificationType';
import type NotificationType from './NotificationType';

type Init = () => void;
type Register = (notificationID: string | number) => void;
type Deregister = () => void;
type OnReceived = <T extends ValueOf<typeof NotificationType>>(notificationType: T, callback: (data: NotificationDataMap[T]) => Promise<void>) => void;
type OnSelected = <T extends ValueOf<typeof NotificationType>>(notificationType: T, callback: (data: NotificationDataMap[T]) => Promise<void>) => void;
type ClearNotifications = () => void;

type PushNotification = {
    init: Init;
    register: Register;
    deregister: Deregister;
    onReceived: OnReceived;
    onSelected: OnSelected;
    TYPE: typeof NotificationType;
    clearNotifications: ClearNotifications;
};

export default PushNotification;
export type {ClearNotifications, Deregister, Init, OnReceived, OnSelected, Register};
