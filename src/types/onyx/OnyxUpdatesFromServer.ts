import type {OnyxUpdate} from 'react-native-onyx';
import CONST from '@src/CONST';
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

function isValidOnyxUpdateFromServer(value: unknown): value is OnyxUpdatesFromServer {
    if (!value || typeof value !== 'object') {
        return false;
    }
    if (!('type' in value) || !value.type) {
        return false;
    }
    if (value.type === CONST.ONYX_UPDATE_TYPES.HTTPS) {
        if (!('request' in value) || !value.request) {
            return false;
        }

        if (!('response' in value) || !value.response) {
            return false;
        }
    }
    if (value.type === CONST.ONYX_UPDATE_TYPES.PUSHER) {
        if (!('updates' in value) || !value.updates) {
            return false;
        }
    }

    return true;
}

export {isValidOnyxUpdateFromServer};

export type {OnyxUpdatesFromServer, OnyxUpdateEvent, OnyxServerUpdate};
