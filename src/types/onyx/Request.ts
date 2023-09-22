import {OnyxUpdate} from 'react-native-onyx';
import Response from './Response';

type Request = {
    command: string;
    commandName?: string;
    data?: Record<string, unknown>;
    type?: string;
    shouldUseSecure?: boolean;
    successData?: OnyxUpdate[];
    failureData?: OnyxUpdate[];

    resolve?: (value: Response) => void;
    reject?: (value?: unknown) => void;
};

export default Request;
