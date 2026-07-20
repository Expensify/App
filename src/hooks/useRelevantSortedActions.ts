import {useCallback} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {getIOUReportIDFromReportActionPreview, isReportPreviewAction} from '@libs/ReportActionsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SortedReportActionsDerivedValue} from '@src/types/onyx/DerivedValues';
import type ReportAction from '@src/types/onyx/ReportAction';
import useOnyx from './useOnyx';

const EMPTY_SORTED_ACTIONS: Record<string, ReportAction[]> = {};

/**
 * Returns only the `sortedActions` entries needed to render the last-message text for the given reports,
 * instead of subscribing to the entire RAM_ONLY_SORTED_REPORT_ACTIONS map.
 *
 * NOTE: `reportIDs` must be referentially stable across renders — memoize it at the call site.
 */
function useRelevantSortedActions(reportIDs: Array<string | undefined>): Record<string, ReportAction[]> {
    const selector = useCallback(
        (value: OnyxEntry<SortedReportActionsDerivedValue>): Record<string, ReportAction[]> => {
            if (!value) {
                return EMPTY_SORTED_ACTIONS;
            }
            const relevant: Record<string, ReportAction[]> = {};
            for (const reportID of reportIDs) {
                if (!reportID) {
                    continue;
                }
                const reportActions = value.sortedActions[reportID];
                if (reportActions) {
                    relevant[reportID] = reportActions;

                    // Scan sorted actions for REPORT_PREVIEW actions instead of only checking
                    // lastActions — the absolute last action may be a whisper, errored, or
                    // pending-deleted action while getLastVisibleAction still renders an older preview.
                    for (const action of reportActions) {
                        if (!isReportPreviewAction(action)) {
                            continue;
                        }
                        const iouReportID = getIOUReportIDFromReportActionPreview(action);
                        const iouReportActions = iouReportID ? value.sortedActions[iouReportID] : undefined;
                        if (iouReportID && iouReportActions) {
                            relevant[iouReportID] = iouReportActions;
                        }
                    }
                }
            }
            return relevant;
        },
        [reportIDs],
    );

    const [relevantSortedActions] = useOnyx(ONYXKEYS.DERIVED.RAM_ONLY_SORTED_REPORT_ACTIONS, {selector});
    return relevantSortedActions ?? EMPTY_SORTED_ACTIONS;
}

export default useRelevantSortedActions;
