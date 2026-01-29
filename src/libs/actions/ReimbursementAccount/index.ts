import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccountForm} from '@src/types/form';
import type {ACHData, ReimbursementAccountSubStep} from '@src/types/onyx/ReimbursementAccount';
import resetNonUSDBankAccount from './resetNonUSDBankAccount';
import resetUSDBankAccount from './resetUSDBankAccount';

export {goToWithdrawalAccountSetupStep, navigateToBankAccountRoute} from './navigation';
export {setBankAccountFormValidationErrors, resetReimbursementAccount} from './errors';

/**
 * Set the current sub step in first step of adding withdrawal bank account:
 * - `null` if we want to go back to the view where the user selects between connecting via Plaid or connecting manually
 * - CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL to ask them to enter their accountNumber and routingNumber
 * - CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID to ask them to login to their bank via Plaid
 */
function setBankAccountSubStep(subStep: ReimbursementAccountSubStep | null): Promise<void | void[]> {
    return Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {achData: {subStep}});
}

function setBankAccountState(state: string): Promise<void | void[]> {
    return Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {achData: {state}});
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
    Onyx.set(ONYXKEYS.REIMBURSEMENT_ACCOUNT, null);
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
    setBankAccountState,
    setReimbursementAccountOptionPressed,
    updateReimbursementAccount,
};
