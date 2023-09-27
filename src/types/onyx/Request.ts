import {OnyxUpdate} from 'react-native-onyx';

type OnyxData = {
    successData?: OnyxUpdate[];
    failureData?: OnyxUpdate[];
    optimisticData?: OnyxUpdate[];
};

type RequestData = {
    command: string;
    data?: Record<string, unknown>;
    type?: string;
    shouldUseSecure?: boolean;
};

type Request = RequestData & OnyxData;

export default Request;
export type {OnyxData};
