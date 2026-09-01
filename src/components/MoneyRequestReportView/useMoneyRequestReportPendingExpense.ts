import {navigationRef} from '@libs/Navigation/Navigation';
import {getPendingSubmitFollowUpAction} from '@libs/telemetry/submitFollowUpAction';
import {getTransactionPendingAction} from '@libs/TransactionUtils';

import isReportOpenInSuperWideRHP from '@navigation/helpers/isReportOpenInSuperWideRHP';

import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

import {useFocusEffect} from '@react-navigation/native';
import {useRef, useState} from 'react';

/**
 * Skeleton placeholder for super-wide RHP: shown while the deferred write is pending
 * and dismissed when the optimistic transaction appears. If the deferred write is delayed
 * (up to 5s safety timeout), the skeleton may linger - this is acceptable as a visual
 * hint that the expense is being processed. The transaction count comparison is a
 * heuristic; simultaneous add+remove is rare enough not to warrant a dedicated signal.
 */
function useMoneyRequestReportPendingExpense(reportID: string | undefined, transactions: OnyxTypes.Transaction[]): boolean {
    const [showPendingExpensePlaceholder, setShowPendingExpensePlaceholder] = useState(false);
    const transactionCountWhenSkeletonShown = useRef<number | null>(null);

    const hasOptimisticNewTransaction = transactions.some((t) => getTransactionPendingAction(t) === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
    const transactionCount = transactions.length;

    useFocusEffect(() => {
        if (!showPendingExpensePlaceholder) {
            const pending = getPendingSubmitFollowUpAction();
            const hasPendingSubmit =
                pending?.followUpAction === CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY &&
                pending?.reportID === reportID &&
                isReportOpenInSuperWideRHP(navigationRef.getRootState());

            if (!hasPendingSubmit || hasOptimisticNewTransaction) {
                return;
            }

            transactionCountWhenSkeletonShown.current = transactionCount;
            setShowPendingExpensePlaceholder(true);
            return;
        }

        if (!hasOptimisticNewTransaction && (transactionCountWhenSkeletonShown.current === null || transactionCount <= transactionCountWhenSkeletonShown.current)) {
            return;
        }

        transactionCountWhenSkeletonShown.current = null;
        setShowPendingExpensePlaceholder(false);
    });

    return showPendingExpensePlaceholder;
}

export default useMoneyRequestReportPendingExpense;
