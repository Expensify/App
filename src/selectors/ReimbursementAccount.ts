import {getEligibleExistingBusinessBankAccounts} from '@libs/WorkflowUtils';

import type {BankAccountList, ReimbursementAccount} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';

const reimbursementAccountErrorSelector = (reimbursementAccount: OnyxEntry<ReimbursementAccount>) => reimbursementAccount?.errors;

const hasReimbursementAccountErrorsSelector = (reimbursementAccount: OnyxEntry<ReimbursementAccount>) => !isEmptyObject(reimbursementAccount?.errors);

/**
 * Returns a selector that reports whether there are other eligible existing business bank accounts that could be connected.
 */
const hasOtherEligibleBusinessBankAccountsSelector =
    (currency: string | undefined, excludeBankAccountID: number | undefined) =>
    (bankAccountList: OnyxEntry<BankAccountList>): boolean =>
        getEligibleExistingBusinessBankAccounts(bankAccountList, currency, true, excludeBankAccountID).length > 0;

export {reimbursementAccountErrorSelector, hasReimbursementAccountErrorsSelector, hasOtherEligibleBusinessBankAccountsSelector};
