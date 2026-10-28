import type {MoneyRequestConfirmationListProps} from '@components/MoneyRequestConfirmationList/types';

import useBlockDistanceRequest from '@hooks/useBlockDistanceRequest';

import {isMovingTransactionFromTrackExpense as isMovingTransactionFromTrackExpenseUtil} from '@libs/IOUUtils';
import {getCurrency, hasValidModifiedAmount, isManualDistanceRequest as isManualDistanceRequestUtil} from '@libs/TransactionUtils';

import {useConfirmationListDataWithPolicy} from './useConfirmationListData';
import useConfirmationPolicyData from './useConfirmationPolicyData';
import useDistanceRequestState from './useDistanceRequestState';

/**
 * The data hook for the distance variant. The shared confirmation data needs the distance state (the route-computed
 * amount, its currency, whether the route is still pending), and the distance state needs the resolved policy, so
 * this resolves the policy first, builds the distance state from it, and only then derives the shared data.
 */
function useDistanceConfirmationListData(props: MoneyRequestConfirmationListProps) {
    const {transaction, policyID, action, iouType, isPerDiemRequest, isPolicyExpenseChat = false, isOdometerDistanceRequest = false, onConfirm} = props;

    const policyData = useConfirmationPolicyData({transaction, policyID, action, iouType, isPerDiemRequest});
    const {policy, policyForMovingExpenses} = policyData;

    const iouAmount = hasValidModifiedAmount(transaction) ? Number(transaction?.modifiedAmount) : (transaction?.amount ?? 0);
    const iouCurrencyCode = getCurrency(transaction);

    const distanceState = useDistanceRequestState({
        transaction,
        policy,
        policyID,
        policyForMovingExpenses,
        isMovingTransactionFromTrackExpense: isMovingTransactionFromTrackExpenseUtil(action),
        isDistanceRequest: true,
        isPolicyExpenseChat,
        iouAmount,
        iouCurrencyCode,
    });

    // A distance request can be blocked before submission by a missing home address, or by a policy that requires
    // a map or GPS, so the guard wraps this surface's own confirm callback.
    const blockDistanceRequestIfNeeded = useBlockDistanceRequest({
        policyID: isPolicyExpenseChat ? policy?.id : undefined,
        isManualDistanceRequest: isManualDistanceRequestUtil(transaction),
        isOdometerDistanceRequest,
    });

    const data = useConfirmationListDataWithPolicy({
        ...props,
        policyData,
        isDistanceRequest: true,
        distanceState,
        onConfirm: () => {
            if (blockDistanceRequestIfNeeded()) {
                return;
            }
            onConfirm?.();
        },
    });

    return {data, distanceState};
}

export default useDistanceConfirmationListData;
