import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ValueOf} from 'type-fest';

import {isSentMoneyReportSelector} from '@selectors/ReportAction';

import useOnyx from './useOnyx';
import usePermissions from './usePermissions';

type UseSingleExpenseReportViewResult = {
    /** The view the user picked for single-expense reports, defaulting to the expense view */
    singleExpenseReportView: ValueOf<typeof CONST.REPORT_LAYOUT.SINGLE_EXPENSE_REPORT_VIEW>;

    /** Whether single-expense reports should render in the table view */
    shouldUseTableViewForSingleExpense: boolean;
};

/**
 * Returns the user's saved view for single-expense reports (expense view or table view).
 *
 * Pass the report's ID to apply the view to that report. A "Pay someone" report always uses the expense view: its
 * expense is the report itself, so it has no expense thread for a table row to open.
 *
 * The table view is behind the singleExpenseTableView beta. Without it, every single-expense report uses the expense view.
 */
function useSingleExpenseReportView(reportID?: string): UseSingleExpenseReportViewResult {
    const {isBetaEnabled} = usePermissions();
    const [singleExpenseReportView = CONST.REPORT_LAYOUT.SINGLE_EXPENSE_REPORT_VIEW.EXPENSE] = useOnyx(ONYXKEYS.NVP_SINGLE_EXPENSE_REPORT_VIEW);
    const [isSentMoneyReport = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(reportID)}`, {selector: isSentMoneyReportSelector});

    return {
        singleExpenseReportView,
        shouldUseTableViewForSingleExpense:
            isBetaEnabled(CONST.BETAS.SINGLE_EXPENSE_TABLE_VIEW) && singleExpenseReportView === CONST.REPORT_LAYOUT.SINGLE_EXPENSE_REPORT_VIEW.TABLE && !isSentMoneyReport,
    };
}

export default useSingleExpenseReportView;
