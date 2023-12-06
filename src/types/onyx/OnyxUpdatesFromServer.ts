import {OnyxUpdate} from 'react-native-onyx';
import Request from './Request';
import Response from './Response';

type OnyxServerUpdate = OnyxUpdate & {shouldNotify?: boolean};

type OnyxUpdateEvent = {
    eventType: string;
    data: OnyxServerUpdate[];
};

type OnyxUpdatesFromServer = {
    type: 'https' | 'pusher';
    lastUpdateID: number | string;
    previousUpdateID: number | string;
    request?: Request;
    response?: Response;
    updates?: OnyxUpdateEvent[];
};

export type {OnyxUpdatesFromServer, OnyxUpdateEvent, OnyxServerUpdate};
