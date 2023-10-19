import {OnyxUpdate} from 'react-native-onyx';

type Response = {
    previousUpdateID?: number | string;
    lastUpdateID?: number | string;
    jsonCode?: number | string;
    onyxData?: OnyxUpdate[];
    requestID?: string;
    shouldPauseQueue?: boolean;
    authToken?: string;
    encryptedAuthToken?: string;
    message?: string;
};

export default Response;
