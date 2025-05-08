import type {OnyxUpdate} from 'react-native-onyx';
import CONST from '@src/CONST';
import type Request from './Request';
import type Response from './Response';

/** Model of a onyx server update */
type OnyxServerUpdate = OnyxUpdate & {
    /** Whether the update should notify UI */
    shouldNotify?: boolean;

    /** Whether the update should be shown as a push notification */
    shouldShowPushNotification?: boolean;
};

/** Model of a onyx update event */
type OnyxUpdateEvent = {
    /** Type of the update event received from the server */
    eventType: string;

    /** Collections of data updates */
    data: OnyxServerUpdate[];
};

/** Model of onyx server updates */
type OnyxUpdatesFromServer = {
    /** Delivery method of onyx updates */
    type: 'https' | 'pusher' | 'airship';

    /** Last update ID from server */
    lastUpdateID: number | string;

    /** Previous update ID from server */
    previousUpdateID?: number | string;

    /** Whether the client should fetch pending updates from the server */
    shouldFetchPendingUpdates?: boolean;

    /** Request data sent to the server */
    request?: Request;

    /** Response data from server */
    response?: Response;

    /** Collection of onyx updates */
    updates?: OnyxUpdateEvent[];
};

/**
 * Helper function to determine if onyx update received from server is valid
 *
 * @param value - represent the onyx update received from the server
 * @returns boolean indicating if the onyx update received from the server is valid
 */
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
