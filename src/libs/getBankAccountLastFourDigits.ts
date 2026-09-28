import type {BankAccount} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

/**
 * Get the last 4 digits of a bank account used for payment.
 *
 * `policyACHAccountNumber` is the account number of the policy's default reimbursement account
 * (`policy.achAccount.accountNumber`), used as a fallback when the payment doesn't name an account.
 */
function getBankAccountLastFourDigits(bankAccountID: number | undefined, bankAccountList: OnyxEntry<Record<string, BankAccount>>, policyACHAccountNumber: string | undefined): string {
    const bankAccount = bankAccountID ? bankAccountList?.[bankAccountID] : null;

    if (bankAccount?.accountData?.accountNumber) {
        return bankAccount.accountData.accountNumber.slice(-4);
    }

    // If bankAccountID is provided but not found in bankAccountList, return '' to avoid showing policy account digits for multi-VBBA payments.
    if (bankAccountID != null) {
        return '';
    }
    return policyACHAccountNumber?.slice(-4) ?? '';
}

export default getBankAccountLastFourDigits;
