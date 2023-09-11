import {OnyxUpdate} from 'react-native-onyx';

type Response = {
    previousUpdateID?: number | string;
    lastUpdateID?: number | string;
    jsonCode?: number;
    onyxData?: OnyxUpdate[];
    requestID?: string;
};

export default Response;
