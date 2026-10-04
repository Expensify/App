import type {ReportHierarchyInfo} from '@userActions/ClearReportActionErrors';

import ONYXKEYS from '@src/ONYXKEYS';
import {reportsParentHierarchySelector} from '@src/selectors/Report';

import type {OnyxCollection} from 'react-native-onyx';

import useOnyx from './useOnyx';

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
