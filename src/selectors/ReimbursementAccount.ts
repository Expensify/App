import {getEligibleExistingBusinessBankAccounts} from '@libs/WorkflowUtils';

import type {BankAccountList, ReimbursementAccount} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';

const reimbursementAccountErrorSelector = (reimbursementAccount: OnyxEntry<ReimbursementAccount>) => reimbursementAccount?.errors;

const hasReimbursementAccountErrorsSelector = (reimbursementAccount: OnyxEntry<ReimbursementAccount>) => !isEmptyObject(reimbursementAccount?.errors);

/** Whether a Wise onboarding page save is still running */
const isSavingWiseOnboardingPageSelector = (reimbursementAccount: OnyxEntry<ReimbursementAccount>) => Object.values(reimbursementAccount?.wiseOnboardingPendingSaves ?? {}).some(Boolean);

/** Whether a Wise onboarding page has not saved yet, as when its save is running or failed */
const hasUnsavedWiseOnboardingPageSelector = (reimbursementAccount: OnyxEntry<ReimbursementAccount>) => Object.values(reimbursementAccount?.wiseOnboardingUnsavedPages ?? {}).some(Boolean);

/**
 * Returns a selector that reports whether there are other eligible existing business bank accounts that could be connected.
 */
const hasOtherEligibleBusinessBankAccountsSelector =
    (currency: string | undefined, excludeBankAccountID: number | undefined) =>
    (bankAccountList: OnyxEntry<BankAccountList>): boolean =>
        getEligibleExistingBusinessBankAccounts(bankAccountList, currency, true, excludeBankAccountID).length > 0;

export {
    reimbursementAccountErrorSelector,
    hasReimbursementAccountErrorsSelector,
    hasOtherEligibleBusinessBankAccountsSelector,
    isSavingWiseOnboardingPageSelector,
    hasUnsavedWiseOnboardingPageSelector,
};
