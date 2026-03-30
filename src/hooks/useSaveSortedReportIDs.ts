import {useEffect} from 'react';
import {useSearchActionsContext} from '@components/Search/SearchContext';
import CONST from '@src/CONST';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';

/**
 * Persists sorted report IDs to Search context so that MoneyRequestReportNavigation
 * can read them without recomputing getSortedSections.
 * Only stores IDs for expense-report searches; clears the context for all other types
 * to force the fallback computation in the navigation header.
 */
function useSaveSortedReportIDs(type: SearchDataTypes, items: Array<{reportID?: string | undefined}>) {
    const {setSortedReportIDs} = useSearchActionsContext();

    useEffect(() => {
        // Only expense-report searches produce report-level IDs suitable for navigation arrows.
        // For all other types (expense, invoice, etc.) the items are transaction-level and share
        // reportIDs, so we clear the context to force the fallback computation in navigation.
        if (type !== CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT) {
            setSortedReportIDs([]);
            return;
        }

        const reportIDs = items.map((item) => item.reportID);

        setSortedReportIDs(reportIDs);
    }, [type, items, setSortedReportIDs]);
}

export default useSaveSortedReportIDs;
