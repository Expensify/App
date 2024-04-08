import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {Beta, Report} from '@src/types/onyx';

type BaseShareLogListOnyxProps = {
    /** Beta features list */
    betas: OnyxEntry<Beta[]>;

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
