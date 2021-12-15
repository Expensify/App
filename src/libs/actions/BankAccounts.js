import _ from 'underscore';
import Onyx from 'react-native-onyx';
import CONST from '../../CONST';
import * as API from '../API';
import * as Plaid from './Plaid';
import * as ReimbursementAccount from './ReimbursementAccount';
import Navigation from '../Navigation/Navigation';
import ONYXKEYS from '../../ONYXKEYS';
import * as PaymentMethods from './PaymentMethods';

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
                        Navigation.goBack();
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

export {
    addPersonalBankAccount,
};
