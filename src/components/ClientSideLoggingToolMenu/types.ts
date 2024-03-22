import type {OnyxEntry} from 'react-native-onyx';
import type {Log} from '@libs/Console';

type CapturedLogs = Record<number, Log>;

type ClientSideLoggingToolMenuOnyxProps = {
    /** Logs captured on the current device */
    capturedLogs: OnyxEntry<CapturedLogs>;

    /** Whether or not logs should be stored */
    shouldStoreLogs: OnyxEntry<boolean>;
};

type ClientSideLoggingToolProps = ClientSideLoggingToolMenuOnyxProps;

export type {CapturedLogs, ClientSideLoggingToolMenuOnyxProps, ClientSideLoggingToolProps};
