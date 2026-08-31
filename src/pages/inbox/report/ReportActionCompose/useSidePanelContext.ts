import {useSearchQueryContext, useSearchSelectionContext} from '@components/Search/SearchContext';

import {useCurrentReportIDState} from '@hooks/useCurrentReportID';
import useIsInSidePanel from '@hooks/useIsInSidePanel';
import useOnyx from '@hooks/useOnyx';

import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';

import type {ReportsSplitNavigatorParamList} from '@navigation/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import {useRoute} from '@react-navigation/native';
import {useMemo} from 'react';

function useSidePanelContext(reportID: string): OnyxTypes.SidePanelContext | undefined {
    const isInSidePanel = useIsInSidePanel();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const {currentReportID, currentRHPReportID} = useCurrentReportIDState();
    const {currentSearchQueryJSON} = useSearchQueryContext();
    const {selectedTransactionIDs, selectedTransactions, selectedReports} = useSearchSelectionContext();
    // On native there is no side panel: the source report is threaded onto this Concierge screen's route params
    // (see SidePanelButton/index.native.tsx). Reading it here keeps it scoped to this navigation entry, so a second
    // Concierge screen pushed later (e.g. via search) has its own param and can't collide.
    const route = useRoute<PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>>();
    const sourceReportID = route.params?.sourceReportID;

    return useMemo(() => {
        if (conciergeReportID !== reportID) {
            return undefined;
        }

        // Native (no side panel): use the source report captured when Concierge Anywhere was opened via the sidebar
        // button. Mirrors the {reportID} context the side panel builds on web. The button drops a self-referencing
        // source report, but it can only do so when CONCIERGE_REPORT_ID is already cached — on the create/open path
        // it is not, so guard here as well (reportID is the Concierge report by the check above).
        if (!isInSidePanel) {
            return sourceReportID && sourceReportID !== reportID ? {reportID: sourceReportID} : undefined;
        }

        const contextReportID = currentRHPReportID ?? currentReportID ?? undefined;

        // selectedTransactions (map) is populated from the Search list; selectedTransactionIDs (array)
        // is populated from the report table view. The two are mutually exclusive.
        const txIDsFromMap = !isEmptyObject(selectedTransactions)
            ? Object.entries(selectedTransactions)
                  .filter(([, info]) => info.isSelected && !!info.transaction)
                  .map(([id]) => id)
            : [];
        const allTransactionIDs = txIDsFromMap.length > 0 ? txIDsFromMap : selectedTransactionIDs;
        const selectedTransactionIDsForContext = allTransactionIDs.length > 0 ? allTransactionIDs.join(',') : undefined;

        const selectedReportIDsForContext =
            selectedReports.length > 0
                ? selectedReports
                      .map((r) => r.reportID)
                      .filter((id): id is string => !!id)
                      .join(',') || undefined
                : undefined;

        // This condition is reached when we are either in the global Reports => Reports page, or within a single expense report having multiple transactions.
        // If we have selectedReportIDs, that means we're in the Reports page, otherwise we're in the expense report RHP.
        if (currentSearchQueryJSON?.type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT) {
            return selectedReportIDsForContext ? {selectedReportIDs: selectedReportIDsForContext} : {reportID: contextReportID, selectedTransactionIDs: selectedTransactionIDsForContext};
        }

        if (!contextReportID && !selectedTransactionIDsForContext && !selectedReportIDsForContext) {
            return undefined;
        }

        // On Spend > Expenses (EXPENSE search) the selected transactions can span multiple reports,
        // so contextReportID doesn't correspond to them. Send selectedReportIDs (+ selectedTransactionIDs)
        // instead of an invalid reportID. We only do this while no report is open in the RHP: once the user
        // opens a report from the list (currentRHPReportID is set) contextReportID is a valid, meaningful
        // report, so we fall through to the default return and keep sending reportID.
        if (currentSearchQueryJSON?.type === CONST.SEARCH.DATA_TYPES.EXPENSE && !currentRHPReportID && selectedReportIDsForContext) {
            return {selectedTransactionIDs: selectedTransactionIDsForContext, selectedReportIDs: selectedReportIDsForContext};
        }

        return {reportID: contextReportID, selectedTransactionIDs: selectedTransactionIDsForContext, selectedReportIDs: selectedReportIDsForContext};
    }, [
        conciergeReportID,
        reportID,
        isInSidePanel,
        sourceReportID,
        currentSearchQueryJSON?.type,
        currentRHPReportID,
        currentReportID,
        selectedTransactionIDs,
        selectedTransactions,
        selectedReports,
    ]);
}

export default useSidePanelContext;
