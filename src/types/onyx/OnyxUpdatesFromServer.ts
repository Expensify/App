import type {OnyxKey, OnyxUpdate} from 'react-native-onyx';
import CONST from '@src/CONST';
import type Request from './Request';
import type {AnyOnyxUpdate, AnyRequest} from './Request';
import type Response from './Response';

/**
 * Model of a onyx server update
 *
 * This type was created as a solution during the migration away from the large OnyxKey union and is useful for contexts where the specific Onyx keys are not known ahead of time.
 * It should only be used in legacy code where providing exact key types would require major restructuring.
 */
type AnyOnyxServerUpdate = AnyOnyxUpdate & {
    /** Whether the update should notify UI */
    shouldNotify?: boolean;

    /** Whether the update should be shown as a push notification */
    shouldShowPushNotification?: boolean;
};

/** Model of a onyx server update */
type OnyxServerUpdate<TKey extends OnyxKey> = OnyxUpdate<TKey> & {
    /** Whether the update should notify UI */
    shouldNotify?: boolean;

    /** Whether the update should be shown as a push notification */
    shouldShowPushNotification?: boolean;
};

/** Model of a onyx update event */
type OnyxUpdateEvent<TKey extends OnyxKey> = {
    /** Type of the update event received from the server */
    eventType: string;

    /** Collections of data updates */
    data: Array<OnyxServerUpdate<TKey>>;
};

/** Generic base for types of onyx server updates */
type OnyxUpdatesFromServerBase<TKey extends OnyxKey, TRequest> = {
    /** Delivery method of onyx updates */
    type: 'https' | 'pusher' | 'airship';

    /** Last update ID from server */
    lastUpdateID: number | string;

    /** Previous update ID from server */
    previousUpdateID?: number | string;

    /** Whether the client should fetch pending updates from the server */
    shouldFetchPendingUpdates?: boolean;

    /** Request data sent to the server */
    request?: TRequest;

    /** Response data from server */
    response?: Response<TKey>;

    /** Collection of onyx updates */
    updates?: Array<OnyxUpdateEvent<TKey>>;
};

/**
 * Model of onyx server updates
 *
 * This type was created as a solution during the migration away from the large OnyxKey union and is useful for contexts where the specific Onyx keys are not known ahead of time.
 * It should only be used in legacy code where providing exact key types would require major restructuring.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyOnyxUpdatesFromServer = OnyxUpdatesFromServerBase<any, AnyRequest>;

/** Model of onyx server updates */
type OnyxUpdatesFromServer<TKey extends OnyxKey> = OnyxUpdatesFromServerBase<TKey, Request<TKey>>;

/**
 * Helper function to determine if onyx update received from server is valid
 *
 * @param value - represent the onyx update received from the server
 * @returns boolean indicating if the onyx update received from the server is valid
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isValidOnyxUpdateFromServer(value: unknown): value is AnyOnyxUpdatesFromServer {
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

export type {OnyxUpdatesFromServer, AnyOnyxUpdatesFromServer, OnyxUpdateEvent, OnyxServerUpdate, AnyOnyxServerUpdate};
