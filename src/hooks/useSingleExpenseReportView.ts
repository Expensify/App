import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {ValueOf} from 'type-fest';

import {isSentMoneyReportSelector} from '@selectors/ReportAction';

import useOnyx from './useOnyx';

type UseSingleExpenseReportViewResult = {
    /** The view the user picked for single-expense reports, defaulting to the expense view */
    singleExpenseReportView: ValueOf<typeof CONST.REPORT_LAYOUT.SINGLE_EXPENSE_REPORT_VIEW>;

    /** Whether single-expense reports should render in the table view */
    shouldUseTableViewForSingleExpense: boolean;

    /** Whether the saved preference is still loading from storage */
    isLoading: boolean;
};

/**
 * Returns the user's saved view for single-expense reports (expense view or table view).
 *
 * Pass the report's ID to apply the view to that report. A "Pay someone" report always uses the expense view: its
 * expense is the report itself, so it has no expense thread for a table row to open.
 */
function useSingleExpenseReportView(reportID?: string): UseSingleExpenseReportViewResult {
    const [singleExpenseReportView = CONST.REPORT_LAYOUT.SINGLE_EXPENSE_REPORT_VIEW.EXPENSE, singleExpenseReportViewMetadata] = useOnyx(ONYXKEYS.NVP_SINGLE_EXPENSE_REPORT_VIEW);
    const [isSentMoneyReport = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(reportID)}`, {selector: isSentMoneyReportSelector});

    return {
        singleExpenseReportView,
        shouldUseTableViewForSingleExpense: singleExpenseReportView === CONST.REPORT_LAYOUT.SINGLE_EXPENSE_REPORT_VIEW.TABLE && !isSentMoneyReport,
        isLoading: isLoadingOnyxValue(singleExpenseReportViewMetadata),
    };
}

export default useSingleExpenseReportView;
