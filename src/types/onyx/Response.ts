import {OnyxUpdate} from 'react-native-onyx';

type Response = {
    previousUpdateID?: number;
    lastUpdateID?: number;
    jsonCode?: number;
    onyxData?: OnyxUpdate[];
    requestID?: string;
};

export default Response;
