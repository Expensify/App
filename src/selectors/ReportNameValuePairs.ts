import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {isArchivedReport} from '@libs/ReportUtils';
import type {ArchivedReportsIDSet} from '@libs/SearchUIUtils';
import type {ReportNameValuePairs} from '@src/types/onyx';
import mapOnyxCollectionItems from '@src/utils/mapOnyxCollectionItems';

type ReportNameValuePairsSelector<T> = (reportNameValuePairs: OnyxEntry<ReportNameValuePairs>) => T;

const createReportNameValuePairsSelector = <T>(reportNameValuePairs: OnyxCollection<ReportNameValuePairs>, reportNameValuePairsSelector: ReportNameValuePairsSelector<T>) =>
    mapOnyxCollectionItems(reportNameValuePairs, reportNameValuePairsSelector);

/**
 * Selector that extracts only the private_isArchived property from report name value pairs
 */
const privateIsArchivedSelector = (reportNameValuePairs: OnyxEntry<ReportNameValuePairs>) => reportNameValuePairs?.private_isArchived;

/**
 * Selector that creates a Set of archived report IDs from report name value pairs
 */
const archivedReportsIdSetSelector = (all: OnyxCollection<ReportNameValuePairs>): ArchivedReportsIDSet => {
    const ids = new Set<string>();
    if (!all) {
        return ids;
    }

    for (const [key, value] of Object.entries(all)) {
        if (isArchivedReport(value)) {
            ids.add(key);
        }
    }
    return ids;
};

export {createReportNameValuePairsSelector, archivedReportsIdSetSelector, privateIsArchivedSelector};
