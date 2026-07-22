import mapCurrencyToCountry from '@libs/mapCurrencyToCountry';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccountForm} from '@src/types/form';
import type ReimbursementAccount from '@src/types/onyx/ReimbursementAccount';
import type {ACHData, ReimbursementAccountSubStep} from '@src/types/onyx/ReimbursementAccount';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import Onyx from 'react-native-onyx';

import resetNonUSDBankAccount from './resetNonUSDBankAccount';
import resetUSDBankAccount from './resetUSDBankAccount';

export {goToWithdrawalAccountSetupStep, navigateToBankAccountRoute} from './navigation';

/**
 * Set the current sub step in first step of adding withdrawal bank account:
 * - `null` if we want to go back to the view where the user selects between connecting via Plaid or connecting manually
 * - CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL to ask them to enter their accountNumber and routingNumber
 * - CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID to ask them to login to their bank via Plaid
 */
function setBankAccountSubStep(subStep: ReimbursementAccountSubStep | null): Promise<void | void[]> {
    return Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {achData: {subStep}});
}

function hideBankAccountErrors() {
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {error: '', errors: null});
}

function updateReimbursementAccount(achData: Partial<ACHData>) {
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {achData});
}

function updateReimbursementAccountDraft(bankAccountData: Partial<ReimbursementAccountForm>) {
    Onyx.merge(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, bankAccountData);
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {draftStep: undefined});
}

function clearReimbursementAccountDraft() {
    Onyx.set(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, {});
}

function clearReimbursementAccount() {
    Onyx.set(ONYXKEYS.REIMBURSEMENT_ACCOUNT, CONST.REIMBURSEMENT_ACCOUNT.DEFAULT_DATA);
}

/**
 * Restore a previously captured reimbursement account snapshot and drop the backup. Used to recover the in-progress
 * account after the user backs out of a "change bank account" flow.
 */
function restoreReimbursementAccountBackup(backup: ReimbursementAccount) {
    Onyx.set(ONYXKEYS.REIMBURSEMENT_ACCOUNT, backup);
    Onyx.set(ONYXKEYS.REIMBURSEMENT_ACCOUNT_BACKUP, null);
}

/**
 * Drops the reimbursement account backup.
 */
function clearReimbursementAccountBackup() {
    Onyx.set(ONYXKEYS.REIMBURSEMENT_ACCOUNT_BACKUP, null);
}

/**
 * Prepares the app to set up a new bank account by marking the account change, clearing existing data,
 * and initializing draft with country and currency.
 * We need to temporarily clear this data to set up new account without disconnecting existing one
 */
function prepareNewBankAccountSetup(currency: string, reimbursementAccountToBackup?: OnyxEntry<ReimbursementAccount>) {
    // Snapshot the account before clearing it, so it can be restored if the user abandons the change flow. Only a real
    // account (in-progress or connected) has achData.currentStep; the default/empty account has none, so skip it.
    if (reimbursementAccountToBackup?.achData?.currentStep) {
        Onyx.set(ONYXKEYS.REIMBURSEMENT_ACCOUNT_BACKUP, reimbursementAccountToBackup);
    }
    Onyx.set(ONYXKEYS.IS_CHANGING_TO_NEW_BANK_ACCOUNT, true);
    clearReimbursementAccount();
    clearReimbursementAccountDraft();
    updateReimbursementAccountDraft({
        country: mapCurrencyToCountry(currency),
        currency,
    });
}

/**
 * Cancels the change to new bank account
 */
function cancelChangingToNewBankAccount() {
    Onyx.set(ONYXKEYS.IS_CHANGING_TO_NEW_BANK_ACCOUNT, false);
}

/**
 * Triggers a modal to open allowing the user to reset their bank account
 */
function requestResetBankAccount() {
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {shouldShowResetModal: true});
}

/**
 * Hides modal allowing the user to reset their bank account
 */
function cancelResetBankAccount() {
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {shouldShowResetModal: false});
}

/**
 *  Sets pressed option during connecting reimbursement account
 */
function setReimbursementAccountOptionPressed(optionPressed: ValueOf<typeof CONST.BANK_ACCOUNT.SETUP_TYPE>) {
    Onyx.set(ONYXKEYS.REIMBURSEMENT_ACCOUNT_OPTION_PRESSED, optionPressed);
}

/**
 * Clear validation messages from reimbursement account
 */
function resetReimbursementAccount() {
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {
        errors: null,
        pendingAction: null,
        errorFields: null,
    });
}

export {
    resetUSDBankAccount,
    resetNonUSDBankAccount,
    setBankAccountSubStep,
    hideBankAccountErrors,
    updateReimbursementAccountDraft,
    requestResetBankAccount,
    cancelResetBankAccount,
    clearReimbursementAccount,
    clearReimbursementAccountDraft,
    restoreReimbursementAccountBackup,
    clearReimbursementAccountBackup,
    setReimbursementAccountOptionPressed,
    updateReimbursementAccount,
    resetReimbursementAccount,
    cancelChangingToNewBankAccount,
    prepareNewBankAccountSetup,
};
