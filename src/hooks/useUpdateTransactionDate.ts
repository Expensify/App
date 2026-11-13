/**
 * Saves the date of a saved expense, from wherever it is edited. Both the date page and the inline picker on the
 * expense view save through here, so an edit in either leaves the expense in the same state.
 */
import {getDistanceRateCustomUnitRate} from '@libs/PolicyUtils';
import {isDistanceRequest} from '@libs/TransactionUtils';

import {updateMoneyRequestDate} from '@userActions/IOU/UpdateMoneyRequest';

import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import type {DuplicateTransactionsAndViolations} from './useDuplicateTransactionsAndViolations';
import type {MoneyRequestUpdateParams} from './useMoneyRequestUpdateParams';

import useDistanceRateOriginalPolicy from './useDistanceRateOriginalPolicy';
import useNetwork from './useNetwork';
import usePersonalPolicy from './usePersonalPolicy';
import usePolicy from './usePolicy';
import usePolicyForMovingExpenses from './usePolicyForMovingExpenses';

type UseUpdateTransactionDateParams = {
    /** Saved expense being written to */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** What the write needs to recompute the expense's violations, read once by the caller */
    updateParams: MoneyRequestUpdateParams;

    /** The expense's duplicates, whose violations a new date can change, read once by the caller */
    duplicates: DuplicateTransactionsAndViolations;

    /** Whether the expense is tracked rather than reported, which takes its distance rates from the workspace for moving expenses */
    isTrackExpense: boolean;
};

type UseUpdateTransactionDateResult = {
    /** Saves `created`, a `yyyy-MM-dd` date, to the expense */
    updateDate: (created: string) => void;
};

function useUpdateTransactionDate({transaction, updateParams: allUpdateParams, duplicates, isTrackExpense}: UseUpdateTransactionDateParams): UseUpdateTransactionDateResult {
    const transactionID = transaction?.transactionID;
    const {policy, policyTagList, violations, ...updateParams} = allUpdateParams;
    const {isOffline} = useNetwork();
    const personalPolicy = usePersonalPolicy();
    const {policyForMovingExpensesID} = usePolicyForMovingExpenses();
    const policyForTrackExpense = usePolicy(isTrackExpense ? policyForMovingExpensesID : undefined);
    const effectivePolicy = isTrackExpense ? policyForTrackExpense : policy;
    const customUnitRateID = isDistanceRequest(transaction) ? transaction?.comment?.customUnit?.customUnitRateID : undefined;
    const shouldLookupDistancePolicy = !!customUnitRateID && !getDistanceRateCustomUnitRate(effectivePolicy, customUnitRateID);
    const distanceOriginalPolicy = useDistanceRateOriginalPolicy(customUnitRateID, shouldLookupDistancePolicy);

    const updateDate = (created: string) => {
        if (!transactionID) {
            return;
        }
        updateMoneyRequestDate({
            ...updateParams,
            transactionID,
            transaction,
            transactions: duplicates.duplicateTransactions,
            transactionViolations: duplicates.duplicateTransactionViolations,
            value: created,
            policy: effectivePolicy,
            policyForTrackExpense,
            policyTags: policyTagList,
            isOffline,
            distanceOriginalPolicy,
            personalPolicyOutputCurrency: personalPolicy?.outputCurrency,
        });
    };

    return {updateDate};
}

export default useUpdateTransactionDate;
