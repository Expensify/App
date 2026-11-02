import {useCallback} from 'react';
import useNavigateToTransactionThread from '@hooks/useNavigateToTransactionThread';
import useOnyx from '@hooks/useOnyx';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {EMPTY_FLAGGED_EXPENSES_REVIEW, flaggedExpensesReviewSelector} from '@src/selectors/Todos';

type ReviewFlaggedExpenses = {
    /** Number of flagged expenses awaiting review, used to decide whether to render the review row */
    count: number;

    /** Opens the first flagged expense's transaction thread with the full set of flagged expenses as the review carousel */
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

    const reviewExpenses = useCallback(() => {
        const {firstTransactionID, firstReportID, transactionIDs} = review;
        if (!firstTransactionID || !firstReportID) {
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
    }, [review, firstFlaggedReportActions, firstFlaggedReport, firstFlaggedTransaction, navigateToTransactionThread]);

    return {count: review.count, reviewExpenses};
}

export default useReviewFlaggedExpenses;
