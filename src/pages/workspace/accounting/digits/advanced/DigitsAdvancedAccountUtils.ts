/**
 * Picks the Digits accounts the Advanced settings list and show. Digits marks an account inactive until it has ledger
 * activity, so on a new company every account is inactive. The pickers list inactive accounts too, and while an admin
 * hasn't picked a bank account, the sync uses the first active one, or the first one when none is active.
 */
import getDigitsCompanyCardAccount from '@pages/workspace/accounting/digits/export/getDigitsCompanyCardAccount';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';
import type {DigitsAccount} from '@src/types/onyx/Policy';

import type {OnyxEntry} from 'react-native-onyx';

/** The label of an account a settlement sync needs, named on its toggle when the sync can't find the account */
type DigitsSettlementAccountLabel =
    | 'workspace.digits.companyCardAccount.label'
    | 'workspace.digits.settlementAccount.label'
    | 'workspace.digits.travelBillingSettlementAccount.label'
    | 'workspace.digits.travelBillingPayableAccount.label';

function getDigitsAccounts(policy: OnyxEntry<Policy>): DigitsAccount[] {
    return policy?.connections?.digits?.data?.accounts ?? [];
}

/** The accounts the bill payment and settlement account pickers list */
function getDigitsBankAccounts(policy: OnyxEntry<Policy>): DigitsAccount[] {
    return getDigitsAccounts(policy).filter((account) => account.subtype === CONST.DIGITS_ACCOUNT_SUBTYPE.BANK_ACCOUNTS);
}

/** The accounts the Consolidated Travel Billing payable account picker lists, the same subtypes as Campfire's */
function getDigitsTravelBillingPayableAccounts(policy: OnyxEntry<Policy>): DigitsAccount[] {
    return getDigitsAccounts(policy).filter(
        (account) => account.subtype === CONST.DIGITS_ACCOUNT_SUBTYPE.CREDIT_CARDS || account.subtype === CONST.DIGITS_ACCOUNT_SUBTYPE.OTHER_CURRENT_LIABILITIES,
    );
}

/** The bank account a sync uses: the saved one, or the default while none is saved */
function getDigitsBankAccount(policy: OnyxEntry<Policy>, savedAccountID: string | undefined): DigitsAccount | undefined {
    if (savedAccountID) {
        return getDigitsAccounts(policy).find((account) => account.id === savedAccountID);
    }
    const bankAccounts = getDigitsBankAccounts(policy);
    return bankAccounts.find((account) => account.isActive) ?? bankAccounts.at(0);
}

/**
 * The label of the first account the Expensify Card settlement sync is missing, or undefined when it has both. The
 * settlement debits the Expensify Card account, which falls back to the company card account like Campfire's, and
 * credits the settlement bank account.
 */
function getDigitsExpensifyCardSettlementMissingAccountLabel(policy: OnyxEntry<Policy>): DigitsSettlementAccountLabel | undefined {
    const digitsConfig = policy?.connections?.digits?.config;
    const expensifyCardAccountID = digitsConfig?.export?.cardProgramAccounts?.[CONST.EXPENSIFY_CARD.BANK];
    const hasExpensifyCardAccount = expensifyCardAccountID ? getDigitsAccounts(policy).some((account) => account.id === expensifyCardAccountID) : !!getDigitsCompanyCardAccount(policy);
    if (!hasExpensifyCardAccount) {
        return 'workspace.digits.companyCardAccount.label';
    }
    if (!getDigitsBankAccount(policy, digitsConfig?.sync?.settlementsBankAccountID)) {
        return 'workspace.digits.settlementAccount.label';
    }
    return undefined;
}

/**
 * The label of the first account the Consolidated Travel Billing settlement sync is missing, or undefined when it has
 * both. The payable account has no default, so the sync waits until an admin picks one.
 */
function getDigitsTravelBillingSettlementMissingAccountLabel(policy: OnyxEntry<Policy>): DigitsSettlementAccountLabel | undefined {
    const digitsConfig = policy?.connections?.digits?.config;
    if (!getDigitsBankAccount(policy, digitsConfig?.sync?.travelInvoicingSettlementsBankAccountID)) {
        return 'workspace.digits.travelBillingSettlementAccount.label';
    }
    const payableAccountID = digitsConfig?.export?.travelInvoicingPayableAccountID;
    if (!payableAccountID || !getDigitsAccounts(policy).some((account) => account.id === payableAccountID)) {
        return 'workspace.digits.travelBillingPayableAccount.label';
    }
    return undefined;
}

export type {DigitsSettlementAccountLabel};
export {
    getDigitsBankAccounts,
    getDigitsTravelBillingPayableAccounts,
    getDigitsBankAccount,
    getDigitsExpensifyCardSettlementMissingAccountLabel,
    getDigitsTravelBillingSettlementMissingAccountLabel,
};
