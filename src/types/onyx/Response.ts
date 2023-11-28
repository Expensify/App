import {OnyxUpdate} from 'react-native-onyx';

type Data = {
    phpCommandName: string;
    authWriteCommands: string[];
};

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
    title?: string;
    data?: Data;
    type?: string;
    shortLivedAuthToken?: string;
    auth?: string;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    shared_secret?: string;
};

export default Response;
