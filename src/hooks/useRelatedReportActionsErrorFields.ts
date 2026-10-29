import type {ReportHierarchyInfo} from '@userActions/ClearReportActionErrors';

import ONYXKEYS from '@src/ONYXKEYS';
import {relatedReportActionsErrorFieldsSelector} from '@src/selectors/ReportAction';
import type {ReportActions} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import useOnyx from './useOnyx';

/**
 * Subscribes to the report actions `clearAllRelatedReportActionErrors` walks when an error is dismissed, narrowed to
 * the fields it reads: the actions of every report in `reportsParentHierarchy` (see `useReportsParentHierarchy`), of
 * the original report holding the dismissed action, and of the threads below `childRootReportID` that hang off
 * errored actions. The selector only looks up those keys instead of mapping the whole collection, so a write to an
 * unrelated report action costs a few lookups rather than a deep comparison over every action in the account.
 */
function useRelatedReportActionsErrorFields(
    reportsParentHierarchy: OnyxCollection<ReportHierarchyInfo>,
    originalReportID: string | undefined,
    childRootReportID: string | undefined,
): OnyxCollection<ReportActions> {
    const reportIDs = Object.keys(reportsParentHierarchy ?? {}).map((key) => key.slice(ONYXKEYS.COLLECTION.REPORT.length));
    const [relatedReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {
        selector: relatedReportActionsErrorFieldsSelector([...reportIDs, originalReportID], childRootReportID),
    });
    return relatedReportActions;
}

export default useRelatedReportActionsErrorFields;
