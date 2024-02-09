import {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {Beta} from '@src/types/onyx';

type BaseShareLogListOnyxProps = {
    /** Beta features list */
    betas: OnyxEntry<Beta[]>;

    /** All reports shared with the user */
    reports: OnyxCollection<Report>;
};

type ShareLogListProps = {
    logSource: string;
};

export type {BaseShareLogListOnyxProps, ShareLogListProps};
