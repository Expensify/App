import type {BankAccount} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import type {PolicyPaymentAttribution} from './PolicyUtils';

import {getAccessiblePolicyBankAccount, wasPaidWithPolicyBankAccount} from './PolicyUtils';

type GetBankAccountLastFourDigitsParams = {
    /** The account the payment action names, when the paying admin picked one. */
    bankAccountID: number | undefined;
    /** The current user's own bank accounts, used to resolve `bankAccountID` and the workspace account. */
    bankAccountList: OnyxEntry<Record<string, BankAccount>>;
    /** The policy the report belongs to. Only its bank account and designated payer are read. */
    policy: OnyxEntry<PolicyPaymentAttribution>;
    /**
     * Masked account number stored on the payment action itself. It is the only viewer-independent source, so it wins
     * over any local lookup. The payer's account is not in every viewer's `bankAccountList`, and falling back to the
     * policy account would show a different account to different people for the same payment.
     */
    accountNumber?: string;
    /**
     * Who made the payment. The workspace account is only a valid guess when the payment came from the designated
     * payer. For anyone else it belongs to a different bank account than the one actually used.
     */
    payerAccountID?: number;
};

/**
 * Get the last 4 digits of a bank account used for payment.
 */
function getBankAccountLastFourDigits({bankAccountID, bankAccountList, policy, accountNumber, payerAccountID}: GetBankAccountLastFourDigitsParams): string {
    if (accountNumber) {
        return accountNumber.slice(-4);
    }

    const bankAccount = bankAccountID ? bankAccountList?.[bankAccountID] : null;

    if (bankAccount?.accountData?.accountNumber) {
        return bankAccount.accountData.accountNumber.slice(-4);
    }

    // If bankAccountID is provided but not found in bankAccountList, return '' to avoid showing policy account digits for multi-VBBA payments.
    if (bankAccountID != null) {
        return '';
    }

    // Nothing on the action identifies the account, so the workspace account is a guess. Only make it for a payment by
    // the designated payer. Showing a non-payer admin's payment as the workspace account is wrong for every viewer, and
    // it is exactly what makes the payer and the payer's colleagues see two different accounts.
    if (!wasPaidWithPolicyBankAccount(policy, payerAccountID)) {
        return '';
    }

    // Resolve the workspace account through `bankAccountList` when we can. `achAccount.accountNumber` goes stale while
    // `achAccount.bankAccountID` moves on, so the two can name different accounts. The ID is the one that was debited.
    const policyBankAccount = getAccessiblePolicyBankAccount(policy, bankAccountList);

    return (policyBankAccount?.accountData?.accountNumber ?? policy?.achAccount?.accountNumber)?.slice(-4) ?? '';
}

export default getBankAccountLastFourDigits;
