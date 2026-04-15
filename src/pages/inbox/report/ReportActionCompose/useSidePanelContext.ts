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
    const {currentSearchQueryJSON, selectedTransactions, selectedReports} = useSearchStateContext();

    return useMemo(() => {
        if (conciergeReportID !== reportID || !isInSidePanel) {
            return undefined;
        }

        const contextReportID = currentRHPReportID ?? currentReportID ?? undefined;
        if (contextReportID) {
            return {reportID: contextReportID};
        }

        const searchType = currentSearchQueryJSON?.type;

        if (searchType === CONST.SEARCH.DATA_TYPES.EXPENSE) {
            const selectedTransactionIDsForContext = !isEmptyObject(selectedTransactions)
                ? Object.entries(selectedTransactions)
                      .filter(([, info]) => info.isSelected && !!info.transaction)
                      .map(([id]) => id)
                      .join(',') || undefined
                : undefined;
            return selectedTransactionIDsForContext ? {selectedTransactionIDs: selectedTransactionIDsForContext} : undefined;
        }

        if (searchType === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT) {
            const selectedReportIDsForContext =
                selectedReports.length > 0
                    ? selectedReports
                          .map((r) => r.reportID)
                          .filter((id): id is string => !!id)
                          .join(',') || undefined
                    : undefined;
            return selectedReportIDsForContext ? {selectedReportIDs: selectedReportIDsForContext} : undefined;
        }

        return undefined;
    }, [conciergeReportID, reportID, isInSidePanel, currentSearchQueryJSON?.type, selectedTransactions, selectedReports, currentRHPReportID, currentReportID]);
}

export default useSidePanelContext;
