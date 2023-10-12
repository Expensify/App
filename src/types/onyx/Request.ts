import {OnyxUpdate} from 'react-native-onyx';

type Request = {
    command: string;
    data?: Record<string, unknown>;
    type?: string;
    shouldUseSecure?: boolean;
    successData?: OnyxUpdate[];
    failureData?: OnyxUpdate[];
};

export default Request;
