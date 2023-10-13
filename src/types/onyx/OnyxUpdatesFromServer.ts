import {OnyxUpdate} from 'react-native-onyx';
import Request from './Request';
import Response from './Response';

type OnyxUpdateEvent = {
    eventType: string;
    data: OnyxUpdate[];
};

type OnyxUpdatesFromServer = {
    type: 'https' | 'pusher';
    lastUpdateID: number | string;
    previousUpdateID: number | string;
    request?: Request;
    response?: Response;
    updates?: OnyxUpdateEvent[];
};

export type {OnyxUpdatesFromServer, OnyxUpdateEvent};
