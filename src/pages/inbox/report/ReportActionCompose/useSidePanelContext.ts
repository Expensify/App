import {useMemo} from 'react';
import {useSearchQueryContext, useSearchSelectionContext} from '@components/Search/SearchContext';
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
    const {currentSearchQueryJSON} = useSearchQueryContext();
    const {selectedTransactionIDs, selectedTransactions, selectedReports} = useSearchSelectionContext();

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

        // Spend => Expenses: a flat list of expenses. Only the selected expenses are meaningful here.
        if (currentSearchQueryJSON?.type === CONST.SEARCH.DATA_TYPES.EXPENSE) {
            return selectedTransactionIDsForContext ? {selectedTransactionIDs: selectedTransactionIDsForContext} : undefined;
        }

        // Spend => Reports: a list of reports with one or more selected. Only the selected reports are meaningful here.
        if (selectedReportIDsForContext) {
            return {selectedReportIDs: selectedReportIDsForContext};
        }

        // Expense report view: a single report is open with its child transactions, optionally with some of them selected.
        if (contextReportID) {
            return {reportID: contextReportID, selectedTransactionIDs: selectedTransactionIDsForContext};
        }

        return undefined;
    }, [conciergeReportID, reportID, isInSidePanel, currentSearchQueryJSON?.type, currentRHPReportID, currentReportID, selectedTransactionIDs, selectedTransactions, selectedReports]);
}

export default useSidePanelContext;
