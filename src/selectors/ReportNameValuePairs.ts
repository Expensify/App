import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ReportNameValuePairs} from '@src/types/onyx';
import mapOnyxCollectionItems from '@src/utils/mapOnyxCollectionItems';

type ReportNameValuePairsSelector<T> = (reportNameValuePairs: OnyxEntry<ReportNameValuePairs>) => T;

const createReportNameValuePairsSelector = <T>(reportNameValuePairs: OnyxCollection<ReportNameValuePairs>, reportNameValuePairsSelector: ReportNameValuePairsSelector<T>) =>
    mapOnyxCollectionItems(reportNameValuePairs, reportNameValuePairsSelector);

// eslint-disable-next-line import/prefer-default-export
export {createReportNameValuePairsSelector};
