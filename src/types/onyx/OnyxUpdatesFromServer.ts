import type {OnyxUpdate} from 'react-native-onyx';
import type Request from './Request';
import type Response from './Response';

type OnyxServerUpdate = OnyxUpdate & {
    shouldNotify?: boolean;
    shouldShowPushNotification?: boolean;
};

type OnyxUpdateEvent = {
    eventType: string;
    data: OnyxServerUpdate[];
};

type OnyxUpdatesFromServer = {
    type: 'https' | 'pusher' | 'airship';
    lastUpdateID: number | string;
    previousUpdateID: number | string;
    request?: Request;
    response?: Response;
    updates?: OnyxUpdateEvent[];
};

export type {OnyxUpdatesFromServer, OnyxUpdateEvent, OnyxServerUpdate};
