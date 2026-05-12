import {useEffect} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {isPaidGroupPolicy} from '@libs/PolicyUtils';
import {setMoneyRequestBillable, setMoneyRequestReimbursable} from '@userActions/IOU';
import type {Policy} from '@src/types/onyx';

type ExpenseDefaultsSetterProps = {
    transactionIDs: string[];
    policy: OnyxEntry<Policy>;
    isPolicyExpenseChat: boolean | undefined;
    isMovingTransactionFromTrackExpense: boolean;
    isCreatingTrackExpense: boolean;
};

/**
 * Side-effect-only component that sets default billable and reimbursable values
 * on transactions based on the policy configuration.
 */
function ExpenseDefaultsSetter({transactionIDs, policy, isPolicyExpenseChat, isMovingTransactionFromTrackExpense, isCreatingTrackExpense}: ExpenseDefaultsSetterProps) {
    const defaultBillable = !!policy?.defaultBillable;

    useEffect(() => {
        if (isMovingTransactionFromTrackExpense) {
            return;
        }
        for (const transactionID of transactionIDs) {
            setMoneyRequestBillable(transactionID, defaultBillable);
        }
    }, [transactionIDs, defaultBillable, isMovingTransactionFromTrackExpense]);

    useEffect(() => {
        if (isMovingTransactionFromTrackExpense) {
            return;
        }
        const defaultReimbursable = (isPolicyExpenseChat && isPaidGroupPolicy(policy)) || isCreatingTrackExpense ? (policy?.defaultReimbursable ?? true) : true;
        for (const transactionID of transactionIDs) {
            setMoneyRequestReimbursable(transactionID, defaultReimbursable);
        }
    }, [transactionIDs, policy, isPolicyExpenseChat, isMovingTransactionFromTrackExpense, isCreatingTrackExpense]);

    return null;
}

ExpenseDefaultsSetter.displayName = 'ExpenseDefaultsSetter';

export default ExpenseDefaultsSetter;
