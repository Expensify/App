import {useMemo} from 'react';
import {useSearchStateContext} from '@components/Search/SearchContext';
import {useCurrentReportIDState} from '@hooks/useCurrentReportID';
import useIsInSidePanel from '@hooks/useIsInSidePanel';
import useOnyx from '@hooks/useOnyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

function useSidePanelContext(reportID: string): OnyxTypes.SidePanelContext | undefined {
    const isInSidePanel = useIsInSidePanel();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const {currentReportID, currentRHPReportID} = useCurrentReportIDState();
    const {currentSearchQueryJSON, selectedTransactionIDs, selectedTransactions, selectedReports} = useSearchStateContext();

    return useMemo(() => {
        if (conciergeReportID !== reportID || !isInSidePanel) {
            return undefined;
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

        return {reportID: contextReportID, selectedTransactionIDs: selectedTransactionIDsForContext, selectedReportIDs: selectedReportIDsForContext};
    }, [conciergeReportID, reportID, isInSidePanel, currentSearchQueryJSON?.type, currentRHPReportID, currentReportID, selectedTransactionIDs, selectedTransactions, selectedReports]);
}

export default useSidePanelContext;
