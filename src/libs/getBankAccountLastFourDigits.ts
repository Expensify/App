import type {BankAccount} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

/**
 * Returns the last four digits of the bank account a payment was made from.
 *
 * Lives in its own module rather than in `PaymentUtils` so that callers needing only this can avoid importing
 * the whole payment utility module, which reaches into the card and policy layers and closes import cycles.
 *
 * @param policyACHAccountNumber The workspace's reimbursement account number (`policy.achAccount.accountNumber`),
 * used as a fallback when the payment doesn't name an account.
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
