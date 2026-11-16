import type {ReportHierarchyInfo} from '@userActions/ClearReportActionErrors';

import ONYXKEYS from '@src/ONYXKEYS';
import {reportParentChainSelector} from '@src/selectors/Report';

import type {OnyxCollection} from 'react-native-onyx';

import useOnyx from './useOnyx';

/**
 * Subscribes to the parent hierarchy links (`parentReportID`/`parentReportActionID`) of the given report and its
 * ancestors so callers can walk the ancestor chain (e.g. `clearAllRelatedReportActionErrors`) without subscribing to
 * full report objects. The selector only looks up the reports on that chain, and since these links are effectively
 * immutable, the result only changes when a report on the chain is added or removed.
 */
function useReportsParentHierarchy(reportID: string | undefined): OnyxCollection<ReportHierarchyInfo> {
    const [reportsParentHierarchy] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: reportParentChainSelector(reportID)});
    return reportsParentHierarchy;
}

export default useReportsParentHierarchy;
