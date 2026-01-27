import type {OnyxEntry} from 'react-native-onyx';
import {getPolicyByCustomUnitID} from '@libs/PolicyUtils';
import {isExpenseUnreported} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Transaction} from '@src/types/onyx';
import useOnyx from './useOnyx';
import usePolicyForMovingExpenses from './usePolicyForMovingExpenses';

type UsePolicyForTransactionParams = {
    /** The transaction to determine the policy for */
    transaction: OnyxEntry<Transaction>;

    /** The report policy ID associated with the transaction */
    reportPolicyID: string;

    /** The current action being performed */
    action: string;

    /** The type of IOU (split, track, submit, etc.) */
    iouType: string;

    /** Indicates if the request is a per diem request */
    isPerDiemRequest?: boolean;
};

type UsePolicyForTransactionResult = {
    /** The policy to use for the transaction */
    policy: OnyxEntry<Policy>;
};

function usePolicyForTransaction({transaction, reportPolicyID, action, iouType, isPerDiemRequest}: UsePolicyForTransactionParams): UsePolicyForTransactionResult {
    const {policyForMovingExpenses} = usePolicyForMovingExpenses();
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: false});
    const [reportPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${reportPolicyID}`, {canBeMissing: true});

    const isUnreportedExpense = isExpenseUnreported(transaction);
    const customUnitPolicy = getPolicyByCustomUnitID(transaction, allPolicies);
    const isCreatingTrackExpense = action === CONST.IOU.ACTION.CREATE && iouType === CONST.IOU.TYPE.TRACK;

    const policyForSelfDMExpense = isPerDiemRequest ? customUnitPolicy : policyForMovingExpenses;
    const policy = isUnreportedExpense || isCreatingTrackExpense ? policyForSelfDMExpense : reportPolicy;

    return {policy};
}

export default usePolicyForTransaction;
