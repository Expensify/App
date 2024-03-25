import type {OnyxEntry} from 'react-native-onyx';
import type {CapturedLogs} from '@src/types/onyx';

type ClientSideLoggingToolMenuOnyxProps = {
    /** Logs captured on the current device */
    capturedLogs: OnyxEntry<CapturedLogs>;

    /** Whether or not logs should be stored */
    shouldStoreLogs: OnyxEntry<boolean>;
};

type ClientSideLoggingToolProps = ClientSideLoggingToolMenuOnyxProps;

export type {CapturedLogs, ClientSideLoggingToolMenuOnyxProps, ClientSideLoggingToolProps};
