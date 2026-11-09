/**
 * Saves the date of a saved expense, from wherever it is edited. Both the date page and the inline picker on the
 * expense view save through here, so an edit in either leaves the expense in the same state.
 */
import {getDistanceRateCustomUnitRate} from '@libs/PolicyUtils';
import {isDistanceRequest} from '@libs/TransactionUtils';

import {updateMoneyRequestDate} from '@userActions/IOU/UpdateMoneyRequest';

import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import useDistanceRateOriginalPolicy from './useDistanceRateOriginalPolicy';
import useDuplicateTransactionsAndViolations from './useDuplicateTransactionsAndViolations';
import useMoneyRequestUpdateParams from './useMoneyRequestUpdateParams';
import useNetwork from './useNetwork';
import usePersonalPolicy from './usePersonalPolicy';
import usePolicy from './usePolicy';
import usePolicyForMovingExpenses from './usePolicyForMovingExpenses';

type UseUpdateTransactionDateParams = {
    /** Saved expense being written to */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;

    /** Whether the expense is tracked rather than reported, which takes its distance rates from the workspace for moving expenses */
    isTrackExpense: boolean;
};

type UseUpdateTransactionDateResult = {
    /** Saves `created`, a `yyyy-MM-dd` date, to the expense */
    updateDate: (created: string) => void;
};

function useUpdateTransactionDate({transaction, transactionThreadReport, isTrackExpense}: UseUpdateTransactionDateParams): UseUpdateTransactionDateResult {
    const transactionID = transaction?.transactionID;
    const {policy, policyTagList, violations, ...updateParams} = useMoneyRequestUpdateParams(transactionID, transactionThreadReport);
    const {isOffline} = useNetwork();
    const personalPolicy = usePersonalPolicy();
    const {policyForMovingExpensesID} = usePolicyForMovingExpenses();
    const policyForTrackExpense = usePolicy(isTrackExpense ? policyForMovingExpensesID : undefined);
    const effectivePolicy = isTrackExpense ? policyForTrackExpense : policy;
    const customUnitRateID = isDistanceRequest(transaction) ? transaction?.comment?.customUnit?.customUnitRateID : undefined;
    const shouldLookupDistancePolicy = !!customUnitRateID && !getDistanceRateCustomUnitRate(effectivePolicy, customUnitRateID);
    const distanceOriginalPolicy = useDistanceRateOriginalPolicy(customUnitRateID, shouldLookupDistancePolicy);
    const {duplicateTransactions, duplicateTransactionViolations} = useDuplicateTransactionsAndViolations(transactionID ? [transactionID] : []);

    const updateDate = (created: string) => {
        if (!transactionID) {
            return;
        }
        updateMoneyRequestDate({
            ...updateParams,
            transactionID,
            transactions: duplicateTransactions,
            transactionViolations: duplicateTransactionViolations,
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
