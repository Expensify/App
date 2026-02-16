import {useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {isMovingTransactionFromTrackExpense as isMovingTransactionFromTrackExpenseIOUUtils} from '@libs/IOUUtils';
import {getPolicyByCustomUnitID} from '@libs/PolicyUtils';
import {isDistanceRequest as isDistanceRequestTransactionUtils, isExpenseUnreported} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import type {IOUAction} from '@src/CONST';
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
    action: IOUAction;

    /** The type of IOU (split, track, submit, etc.) */
    iouType: string;

    /** Indicates if the request is a per diem request */
    isPerDiemRequest?: boolean;

    /** Indicates if the request is a track distance request */
    isTrackDistanceRequest?: boolean;

    /** Indicates if the transaction is a moving transaction from a track expense */
    isMovingTransactionFromTrackExpense?: boolean;
};

type UsePolicyForTransactionResult = {
    /** The policy to use for the transaction */
    policy: OnyxEntry<Policy>;
};

function usePolicyForTransaction({transaction, reportPolicyID, action, iouType, isPerDiemRequest}: UsePolicyForTransactionParams): UsePolicyForTransactionResult {
    const isDistanceRequest = isDistanceRequestTransactionUtils(transaction);
    const isCreatingTrackExpense = action === CONST.IOU.ACTION.CREATE && iouType === CONST.IOU.TYPE.TRACK;
    const isTrackDistanceRequest = isCreatingTrackExpense && isDistanceRequest;
    const isMovingTransactionFromTrackExpense = isMovingTransactionFromTrackExpenseIOUUtils(action);

    const {policyForMovingExpenses} = usePolicyForMovingExpenses(undefined, undefined, isTrackDistanceRequest, isMovingTransactionFromTrackExpense);

    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});

    const customUnitPolicy = useMemo(() => {
        return getPolicyByCustomUnitID(transaction, allPolicies);
    }, [transaction, allPolicies]);

    const [reportPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${reportPolicyID}`, {canBeMissing: true});

    const isUnreportedExpense = isExpenseUnreported(transaction);

    const policyForSelfDMExpense = isPerDiemRequest ? customUnitPolicy : policyForMovingExpenses;
    const policy = isUnreportedExpense || isCreatingTrackExpense ? policyForSelfDMExpense : reportPolicy;

    return {policy};
}

export default usePolicyForTransaction;
