import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {ValueOf} from 'type-fest';

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
 */
function useSingleExpenseReportView(): UseSingleExpenseReportViewResult {
    const [singleExpenseReportView = CONST.REPORT_LAYOUT.SINGLE_EXPENSE_REPORT_VIEW.EXPENSE, singleExpenseReportViewMetadata] = useOnyx(ONYXKEYS.NVP_SINGLE_EXPENSE_REPORT_VIEW);

    return {
        singleExpenseReportView,
        shouldUseTableViewForSingleExpense: singleExpenseReportView === CONST.REPORT_LAYOUT.SINGLE_EXPENSE_REPORT_VIEW.TABLE,
        isLoading: isLoadingOnyxValue(singleExpenseReportViewMetadata),
    };
}

export default useSingleExpenseReportView;
