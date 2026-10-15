import type {ReportHierarchyInfo} from '@userActions/ClearReportActionErrors';

import ONYXKEYS from '@src/ONYXKEYS';
import {getReportAncestorKeys, reportAncestorsHierarchySelector, reportsParentHierarchySelector} from '@src/selectors/Report';

import type {OnyxCollection} from 'react-native-onyx';

import {useState} from 'react';
import {useOnyxState} from 'react-native-onyx';

import useOnyx from './useOnyx';
import useOnyxStateSnapshotKey, {getSnapshotAwareValue} from './useOnyxStateSnapshotKey';

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

/**
 * Subscribes to the parent hierarchy links of the given report and its ancestors only. Use this instead of
 * `useReportsParentHierarchy` when the caller only walks up from one known report, e.g. in list rows.
 */
function useReportAncestorsHierarchy(reportID: string | undefined): OnyxCollection<ReportHierarchyInfo> {
    const snapshotKey = useOnyxStateSnapshotKey();
    const [ancestorKeys, setAncestorKeys] = useState(() => getReportAncestorKeys(undefined, reportID));
    const reportAncestorsHierarchy = useOnyxState((state) => reportAncestorsHierarchySelector((key) => getSnapshotAwareValue(state, snapshotKey, key), reportID), {
        dependencies: snapshotKey ? [snapshotKey] : ancestorKeys,
    });

    const nextAncestorKeys = getReportAncestorKeys(reportAncestorsHierarchy, reportID);
    if (nextAncestorKeys.join(' ') !== ancestorKeys.join(' ')) {
        setAncestorKeys(nextAncestorKeys);
    }
    return reportAncestorsHierarchy;
}

export default useReportsParentHierarchy;
export {useReportAncestorsHierarchy};
