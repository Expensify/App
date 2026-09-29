import type {ReportHierarchyInfo} from '@userActions/ClearReportActionErrors';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import mapOnyxCollectionItems from '@src/utils/mapOnyxCollectionItems';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import useOnyx from './useOnyx';

const reportHierarchySelector = (report: OnyxEntry<Report>): OnyxEntry<ReportHierarchyInfo> =>
    report && {
        parentReportID: report.parentReportID,
        parentReportActionID: report.parentReportActionID,
    };

const reportsParentHierarchySelector = (reports: OnyxCollection<Report>) => mapOnyxCollectionItems(reports, reportHierarchySelector);

/**
 * Subscribes to the parent hierarchy links (`parentReportID`/`parentReportActionID`) of every report so callers
 * can resolve arbitrary ancestor chains (e.g. `clearAllRelatedReportActionErrors`) without subscribing to full
 * report objects. Since these links are effectively immutable, the projected result only changes when reports
 * are added or removed, so regular report updates don't re-render the subscriber.
 */
function useReportsParentHierarchy(): OnyxCollection<ReportHierarchyInfo> {
    const [reportsParentHierarchy] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: reportsParentHierarchySelector});
    return reportsParentHierarchy;
}

export default useReportsParentHierarchy;
