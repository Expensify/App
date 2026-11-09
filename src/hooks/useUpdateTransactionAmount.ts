/**
 * Saves the amount and currency of a saved expense from the inline input on the expense view, through the same write
 * the amount page uses, so an edit in either leaves the expense in the same state.
 */
import {updateSavedExpenseAmount} from '@libs/IOUAmountSubmission';

import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import useDuplicateTransactionsAndViolations from './useDuplicateTransactionsAndViolations';
import useMoneyRequestUpdateParams from './useMoneyRequestUpdateParams';
import useOnyx from './useOnyx';

type UseUpdateTransactionAmountParams = {
    /** Saved expense being written to */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;

    /** Policy the tax of the new amount is worked out against. For an unreported expense it is the workspace the expense would move to */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Categories of `policy`, needed to recompute violations after the write */
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;
};

type UseUpdateTransactionAmountResult = {
    /** Saves `amount`, signed and in the smallest currency unit, and `currency` to the expense */
    updateAmount: (amount: number, currency: string) => void;
};

function useUpdateTransactionAmount({transaction, transactionThreadReport, policy, policyCategories}: UseUpdateTransactionAmountParams): UseUpdateTransactionAmountResult {
    const transactionID = transaction?.transactionID;
    const updateParams = useMoneyRequestUpdateParams(transactionID, transactionThreadReport);
    const {duplicateTransactions, duplicateTransactionViolations} = useDuplicateTransactionsAndViolations(transactionID ? [transactionID] : []);
    const [policyRecentlyUsedCurrencies] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES);

    const updateAmount = (amount: number, currency: string) => {
        if (!transactionID) {
            return;
        }
        updateSavedExpenseAmount({
            policy,
            transactionID,
            transaction,
            transactionThreadReport,
            parentReport: updateParams.parentReport,
            iouReportOwnerLogin: updateParams.iouReportOwnerLogin,
            amount,
            currency,
            duplicateTransactions,
            duplicateTransactionViolations,
            policyCategories,
            currentUserAccountID: updateParams.currentUserAccountIDParam,
            currentUserEmail: updateParams.currentUserEmailParam,
            isASAPSubmitBetaEnabled: updateParams.isASAPSubmitBetaEnabled,
            policyRecentlyUsedCurrencies,
            delegateAccountID: updateParams.delegateAccountID,
            reportPolicyTags: updateParams.reportPolicyTags,
            isTrackIntentUser: updateParams.isTrackIntentUser,
            getCurrencyDecimals: updateParams.getCurrencyDecimals,
            getCurrencySymbol: updateParams.getCurrencySymbol,
            rules: updateParams.rules,
            isVendorMatchingBetaEnabled: updateParams.isVendorMatchingBetaEnabled,
        });
    };

    return {updateAmount};
}

export default useUpdateTransactionAmount;
