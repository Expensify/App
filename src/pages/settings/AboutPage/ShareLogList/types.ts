import type {OnyxCollection} from 'react-native-onyx';
import type {Report} from '@src/types/onyx';

type BaseShareLogListOnyxProps = {
    /** All reports shared with the user */
    reports: OnyxCollection<Report>;
};

type ShareLogListProps = {
    /** The source of the log file to share */
    logSource: string;
};

type BaseShareLogListProps = BaseShareLogListOnyxProps & {
    onAttachLogToReport: (reportID: string, filename: string) => void;
};

export type {BaseShareLogListOnyxProps, BaseShareLogListProps, ShareLogListProps};
