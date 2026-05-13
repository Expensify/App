import {useMemo} from 'react';
import {getFilteredReportActionsForReportView} from '@libs/ReportActionsUtils';
import usePaginatedReportActions from './usePaginatedReportActions';

type UsePaginatedReportActionsOptions = NonNullable<Parameters<typeof usePaginatedReportActions>[2]>;

/**
 * Paginated report actions for a money / expense report plus the filtered view used for IOU / thread logic.
 * Pair with {@link useTransactionThreadReport} so transaction-thread derivation shares the same action list.
 */
function useMoneyRequestReportPaginatedFilteredActions(
    reportID: string | undefined,
    reportActionID?: string,
    paginatedReportActionsOptions?: UsePaginatedReportActionsOptions,
) {
    const paginationResult = usePaginatedReportActions(reportID, reportActionID, paginatedReportActionsOptions);

    const reportActions = useMemo(() => getFilteredReportActionsForReportView(paginationResult.reportActions), [paginationResult.reportActions]);

    return {
        ...paginationResult,
        reportActions,
    };
}

export default useMoneyRequestReportPaginatedFilteredActions;
export type {UsePaginatedReportActionsOptions};
