import type {OnyxEntry} from 'react-native-onyx';
import {isExpenseUnreported} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, Transaction} from '@src/types/onyx';
import useOnyx from './useOnyx';
import usePolicyForMovingExpenses from './usePolicyForMovingExpenses';

type UsePolicyForTransactionParams = {
    /** The transaction to determine the policy for */
    transaction: OnyxEntry<Transaction>;

    /** The report associated with the transaction */
    report: OnyxEntry<Report>;

    /** The current action being performed */
    action: string;

    /** The type of IOU (split, track, submit, etc.) */
    iouType: string;
};

type UsePolicyForTransactionResult = {
    /** The policy to use for the transaction */
    policy: OnyxEntry<Policy>;
};

function usePolicyForTransaction({transaction, report, action, iouType}: UsePolicyForTransactionParams): UsePolicyForTransactionResult {
    const {policyForMovingExpenses} = usePolicyForMovingExpenses();
    const isUnreportedExpense = isExpenseUnreported(transaction);
    const isCreatingTrackExpense = action === CONST.IOU.ACTION.CREATE && iouType === CONST.IOU.TYPE.TRACK;

    const [reportPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`, {canBeMissing: true});
    const policy = isUnreportedExpense || isCreatingTrackExpense ? policyForMovingExpenses : reportPolicy;

    return {policy};
}

export default usePolicyForTransaction;
