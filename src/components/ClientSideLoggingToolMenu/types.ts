import type {OnyxEntry} from 'react-native-onyx';
import type {CapturedLogs, Log} from '@src/types/onyx';

type BaseClientSideLoggingToolMenuOnyxProps = {
    /** Logs captured on the current device */
    capturedLogs: OnyxEntry<CapturedLogs>;

    /** Whether or not logs should be stored */
    shouldStoreLogs: OnyxEntry<boolean>;
};

type BaseClientSideLoggingToolProps = {
    /** Locally created file */
    file?: {path: string; newFileName: string; size: number};
    /** Action to run when pressing Share button */
    onShareLogs?: () => void;
    /** Action to run when toggling the switch */
    onToggleSwitch: (logs: Log[]) => void;
    /** Action to run when enabling logging */
    onEnableLogging?: () => void;
} & BaseClientSideLoggingToolMenuOnyxProps;

export type {BaseClientSideLoggingToolMenuOnyxProps, BaseClientSideLoggingToolProps};
