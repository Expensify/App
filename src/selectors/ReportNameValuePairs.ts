import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ReportNameValuePairs} from '@src/types/onyx';
import mapOnyxCollectionItems from '@src/utils/mapOnyxCollectionItems';

type ReportNameValuePairsSelector<T> = (reportNameValuePairs: OnyxEntry<ReportNameValuePairs>) => T;

const createReportNameValuePairsSelector = <T>(reportNameValuePairs: OnyxCollection<ReportNameValuePairs>, reportNameValuePairsSelector: ReportNameValuePairsSelector<T>) =>
    mapOnyxCollectionItems(reportNameValuePairs, reportNameValuePairsSelector);

type PrivateIsArchivedMap = Record<string, string | undefined>;

/**
 * Selector that creates a map of report IDs to their private_isArchived values
 */
const privateIsArchivedMapSelector = (all: OnyxCollection<ReportNameValuePairs>): PrivateIsArchivedMap => {
    const map: PrivateIsArchivedMap = {};
    if (!all) {
        return map;
    }

    for (const [key, value] of Object.entries(all)) {
        map[key] = value?.private_isArchived;
    }
    return map;
};

export {createReportNameValuePairsSelector, privateIsArchivedMapSelector};
export type {PrivateIsArchivedMap};
