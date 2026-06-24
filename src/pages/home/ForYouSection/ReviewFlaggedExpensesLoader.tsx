import {useEffect} from 'react';
import type {ReviewFlaggedExpenses} from './useReviewFlaggedExpenses';
import useReviewFlaggedExpenses from './useReviewFlaggedExpenses';

type ReviewFlaggedExpensesLoaderProps = {
    /** Called with the latest flagged-expense count and review handler whenever they change. */
    onChange: (value: ReviewFlaggedExpenses) => void;
};

/**
 * Component that owns the flagged-expense Onyx subscriptions and scan, and reports the result up
 * to its parent. It is mounted only while the Home tab is active, so the heavy REPORT/TRANSACTION/… collection
 * subscriptions (and the re-renders they cause on every report change) are torn down while the user is on
 * another tab. The parent keeps the last reported value across this component's unmount, so the row does not
 * flash when the Home tab is re-activated.
 */
function ReviewFlaggedExpensesLoader({onChange}: ReviewFlaggedExpensesLoaderProps) {
    const {count, reviewExpenses} = useReviewFlaggedExpenses();

    useEffect(() => {
        onChange({count, reviewExpenses});
    }, [count, reviewExpenses, onChange]);

    return null;
}

export default ReviewFlaggedExpensesLoader;
