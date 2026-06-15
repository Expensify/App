import {useCallback, useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import reportByIDsSelector from '@src/selectors/Attributes';
import type {ReportAttributesDerivedValue} from '@src/types/onyx';
import useOnyx from './useOnyx';

/**
 * Returns `reports` from the REPORT_ATTRIBUTES derived value.
 *
 * This hook intentionally avoids using a selector. When a selector is passed to
 * `useOnyx`, it forces a `deepEqual` comparison on every Onyx update cycle. Because
 * `reports` is a large `Record<string, ReportAttributes>`, that deep comparison is
 * O(n) and expensive.
 */
function useReportAttributes() {
    const [reportAttributes] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);
    return reportAttributes?.reports;
}

/**
 * Returns a single report's attributes using a selector.
 * Deep comparison is cheap (single small object), so re-renders only occur
 * when that specific report's attributes change — not on every global report change.
 */
function useReportAttributesByID(reportID: string | undefined) {
    const reportAttributesByIDSelector = (value: {reports?: Record<string, unknown>} | undefined) => (reportID ? value?.reports?.[reportID] : undefined);
    const [reportAttributes] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {
        selector: reportAttributesByIDSelector,
    });
    return reportAttributes;
}

/**
 * Returns report attributes for multiple specific report IDs.
 * Uses reportByIDsSelector to filter down to only the requested reports.
 */
function useReportAttributesByIDs(reportIDs: Array<string | undefined>) {
    // Join to a stable string so useMemo compares by content, not array reference.
    // This guards against callers that pass new inline array literals on every render.
    const reportIDsKey = reportIDs.join(',');
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const filteredReportIDs = useMemo(() => reportIDs.filter((id): id is string => !!id), [reportIDsKey]);
    const reportAttributesSelector = useCallback((attributes: OnyxEntry<ReportAttributesDerivedValue>) => reportByIDsSelector(filteredReportIDs)(attributes), [filteredReportIDs]);
    const [reportAttributes] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {
        selector: reportAttributesSelector,
    });
    return reportAttributes;
}

export default useReportAttributes;
export {useReportAttributesByID, useReportAttributesByIDs};
