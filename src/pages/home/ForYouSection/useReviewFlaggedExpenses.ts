import {useCallback} from 'react';
import useNavigateToTransactionThread from '@hooks/useNavigateToTransactionThread';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import {isMoneyRequestReport} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {EMPTY_FLAGGED_EXPENSES_REVIEW, flaggedExpensesReviewSelector} from '@src/selectors/Todos';

type ReviewFlaggedExpenses = {
    /** Number of flagged expenses awaiting review, used to decide whether to render the review row */
    count: number;

    /**
     * Opens the flagged expenses for review. With multiple flagged expenses it opens the first one's transaction
     * thread with the full set as the review carousel; with a single flagged expense it opens that expense report
     * directly (see the handler for why).
     */
    reviewExpenses: () => void;
};

/**
 * Encapsulates the data plumbing for the "Review X expenses" row in the For You section: it reads the
 * flagged-expenses review summary plus the first flagged expense's report, report actions, and transaction,
 * and exposes a bound handler that navigates to the transaction thread (single-expense RHP + review carousel).
 */
function useReviewFlaggedExpenses(): ReviewFlaggedExpenses {
    const [review = EMPTY_FLAGGED_EXPENSES_REVIEW] = useOnyx(ONYXKEYS.DERIVED.FLAGGED_EXPENSES, {selector: flaggedExpensesReviewSelector});

    // Load the first flagged expense's parent report, its actions, and the transaction itself so the shared
    // navigation hook can resolve (or optimistically create) the transaction thread.
    const [firstFlaggedReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(review.firstReportID)}`);
    const [firstFlaggedReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(review.firstReportID)}`);
    const [firstFlaggedTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(review.firstTransactionID)}`);

    const navigateToTransactionThread = useNavigateToTransactionThread();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const reviewExpenses = useCallback(() => {
        const {firstTransactionID, firstReportID, transactionIDs, count} = review;
        if (!firstTransactionID || !firstReportID) {
            return;
        }

        // With a single flagged expense the review carousel has nothing to navigate between, and for a
        // one-transaction report the transaction thread is a redundant duplicate of the report itself
        if (count === 1 && isMoneyRequestReport(firstFlaggedReport)) {
            Navigation.navigate(
                shouldUseNarrowLayout
                    ? ROUTES.REPORT_WITH_ID.getRoute(firstReportID, undefined, undefined, ROUTES.HOME)
                    : ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID: firstReportID, backTo: ROUTES.HOME}),
            );
            return;
        }

        navigateToTransactionThread({
            transactionID: firstTransactionID,
            reportActions: Object.values(firstFlaggedReportActions ?? {}),
            report: firstFlaggedReport,
            transaction: firstFlaggedTransaction,
            siblingTransactionIDs: transactionIDs,
            backTo: ROUTES.HOME,
        });
    }, [review, firstFlaggedReportActions, firstFlaggedReport, firstFlaggedTransaction, navigateToTransactionThread, shouldUseNarrowLayout]);

    return {count: review.count, reviewExpenses};
}

export default useReviewFlaggedExpenses;
