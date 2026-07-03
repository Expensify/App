import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAttributesDerivedValue} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {reportNameSelector} from '@selectors/ReportAttributes';

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
    const reportAttributesByIDSelector = (value: OnyxEntry<ReportAttributesDerivedValue>) => (reportID ? value?.reports?.[reportID] : undefined);
    const [reportAttributes] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {
        selector: reportAttributesByIDSelector,
    });
    return reportAttributes;
}

/**
 * Returns a single report's name using a selector.
 *
 * Use this when a component only needs one report's name: the selector output is a primitive string, so its
 * comparison is trivial and the component re-renders only when that specific report's name changes — not on
 * every global report attribute change.
 */
function useDerivedReportNameByReportID(reportID: string | undefined) {
    const [reportName] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {
        selector: (value: OnyxEntry<ReportAttributesDerivedValue>) => reportNameSelector(value, reportID),
    });
    return reportName;
}

export default useReportAttributes;
export {useReportAttributesByID, useDerivedReportNameByReportID};
