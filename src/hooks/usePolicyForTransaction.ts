import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
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
    reportPolicyID: string | undefined;

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

const customUnitPolicySelector = (policies: OnyxCollection<Policy>, transaction: OnyxEntry<Transaction>) => getPolicyByCustomUnitID(transaction, policies);

function usePolicyForTransaction({transaction, reportPolicyID, action, iouType, isPerDiemRequest}: UsePolicyForTransactionParams): UsePolicyForTransactionResult {
    const {policyForMovingExpenses} = usePolicyForMovingExpenses();

    // eslint-disable-next-line rulesdir/no-inline-useOnyx-selector
    const [customUnitPolicy] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        canBeMissing: true,
        selector: (policies) => customUnitPolicySelector(policies, transaction),
    });
    const [reportPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${reportPolicyID}`, {canBeMissing: true});

    const isUnreportedExpense = isExpenseUnreported(transaction);
    const isCreatingTrackExpense = action === CONST.IOU.ACTION.CREATE && iouType === CONST.IOU.TYPE.TRACK;

    const policyForSelfDMExpense = isPerDiemRequest ? customUnitPolicy : policyForMovingExpenses;
    const policy = isUnreportedExpense || isCreatingTrackExpense ? policyForSelfDMExpense : reportPolicy;

    return {policy};
}

export default usePolicyForTransaction;
