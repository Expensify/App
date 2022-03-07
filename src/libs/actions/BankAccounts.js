import _ from 'underscore';
import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
import CONST from '../../CONST';
import * as API from '../API';
import * as Plaid from './Plaid';
import * as ReimbursementAccount from './ReimbursementAccount';
import ONYXKEYS from '../../ONYXKEYS';
import * as PaymentMethods from './PaymentMethods';
import Growl from '../Growl';
import * as Localize from '../Localize';
import * as store from './ReimbursementAccount/store';

export {
    setupWithdrawalAccount,
    fetchFreePlanVerifiedBankAccount,
    goToWithdrawalAccountSetupStep,
    showBankAccountErrorModal,
    showBankAccountFormValidationError,
    setBankAccountFormValidationErrors,
    resetFreePlanBankAccount,
    validateBankAccount,
    hideBankAccountErrors,
    setWorkspaceIDForReimbursementAccount,
    setBankAccountSubStep,
    updateReimbursementAccountDraft,
    requestResetFreePlanBankAccount,
    cancelResetFreePlanBankAccount,
} from './ReimbursementAccount';
export {
    fetchPlaidBankAccounts,
    clearPlaidBankAccountsAndToken,
    fetchPlaidLinkToken,
    getPlaidBankAccounts,
    getBankName,
    getPlaidAccessToken,
} from './Plaid';
export {
    fetchOnfidoToken,
    activateWallet,
    fetchUserWallet,
} from './Wallet';

/**
 * Adds a bank account via Plaid
 *
 * @param {Object} account
 * @param {String} password
 * @param {String} plaidLinkToken
 */
function addPersonalBankAccount(account, password, plaidLinkToken) {
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {loading: true});
    const unmaskedAccount = _.find(Plaid.getPlaidBankAccounts(), bankAccount => (
        bankAccount.plaidAccountID === account.plaidAccountID
    ));
    API.BankAccount_Create({
        accountNumber: unmaskedAccount.accountNumber,
        addressName: unmaskedAccount.addressName,
        allowDebit: false,
        confirm: false,
        isSavings: unmaskedAccount.isSavings,
        password,
        routingNumber: unmaskedAccount.routingNumber,
        setupType: 'plaid',
        additionalData: JSON.stringify({
            useOnFido: false,
            policyID: '',
            plaidLinkToken,
            isInSetup: true,
            bankAccountInReview: null,
            currentStep: 'AccountOwnerInformationStep',
            bankName: Plaid.getBankName(),
            plaidAccountID: unmaskedAccount.plaidAccountID,
            ownershipType: '',
            acceptTerms: true,
            country: 'US',
            currency: CONST.CURRENCY.USD,
            fieldsType: 'local',
            plaidAccessToken: Plaid.getPlaidAccessToken(),
        }),
    })
        .then((response) => {
            if (response.jsonCode === 200) {
                PaymentMethods.getPaymentMethods()
                    .then(() => {
                        PaymentMethods.continueSetup();
                        Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {loading: false});
                    });
                return;
            }

            if (response.message === 'Incorrect Expensify password entered') {
                ReimbursementAccount.setBankAccountFormValidationErrors({password: true});
            }
            Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {loading: false});
        })
        .catch(() => {
            Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {loading: false});
        });
}

/**
 * Deletes a bank account
 *
 * @param {Number} bankAccountID
 */
function deleteBankAccount(bankAccountID) {
    const reimbursementBankAccountId = lodashGet(store.getReimbursementAccountInSetup(), 'bankAccountID');
    if (reimbursementBankAccountId === bankAccountID) {
        ReimbursementAccount.resetFreePlanBankAccount();
        return;
    }

    API.DeleteBankAccount({
        bankAccountID,
    }).then((response) => {
        if (response.jsonCode === 200) {
            ReimbursementAccount.deleteFromBankAccountList(bankAccountID);
            Growl.show(Localize.translateLocal('paymentsPage.deleteBankAccountSuccess'), CONST.GROWL.SUCCESS, 3000);
        } else {
            Growl.show(Localize.translateLocal('common.genericErrorMessage'), CONST.GROWL.ERROR, 3000);
        }
    }).catch(() => {
        Growl.show(Localize.translateLocal('common.genericErrorMessage'), CONST.GROWL.ERROR, 3000);
    });
}

export {
    addPersonalBankAccount,
    deleteBankAccount,
};
