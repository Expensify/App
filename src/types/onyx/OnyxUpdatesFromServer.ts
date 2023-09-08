import {OnyxUpdate} from 'react-native-onyx';
import Request from './Request';
import Response from './Response';

type OnyxUpdatesFromServerData = {
    lastUpdateID: number | string;
    request?: Request;
    response?: Response;
    updates?: OnyxUpdate[];
};

type OnyxUpdatesFromServer = {
    lastUpdateIDFromServer: number | string;
    previousUpdateIDFromServer: number | string;
    type: 'https' | 'pusher';
    data: OnyxUpdatesFromServerData;
};

export default OnyxUpdatesFromServer;
