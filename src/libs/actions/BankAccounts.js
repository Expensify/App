import lodashGet from 'lodash/get';
import CONST from '../../CONST';
import * as DeprecatedAPI from '../deprecatedAPI';
import * as API from '../API';
import * as Plaid from './Plaid';
import * as ReimbursementAccount from './ReimbursementAccount';
import ONYXKEYS from '../../ONYXKEYS';
import Growl from '../Growl';
import * as Localize from '../Localize';
import * as store from './ReimbursementAccount/store';
import requireParameters from '../requireParameters';
import ROUTES from '../../ROUTES';

export {
    setupWithdrawalAccount,
    fetchFreePlanVerifiedBankAccount,
    goToWithdrawalAccountSetupStep,
    showBankAccountErrorModal,
    showBankAccountFormValidationError,
    setBankAccountFormValidationErrors,
    resetReimbursementAccount,
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
    openPlaidBankAccountSelector,
    clearPlaidBankAccountsAndToken,
    openPlaidBankLogin,
    getBankName,
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
 * @param {String} plaidAccessToken
 */
function addPersonalBankAccount(account, password, plaidAccessToken) {
    const commandName = 'AddPersonalBankAccount';

    const parameters = {
        accountNumber: account.accountNumber,
        addressName: account.addressName,
        allowDebit: false,
        confirm: false,
        isSavings: account.isSavings,
        password,
        routingNumber: account.routingNumber,
        setupType: 'plaid',
        additionalData: JSON.stringify({
            bankName: Plaid.getBankName(),
            plaidAccountID: account.plaidAccountID,
            acceptTerms: true,
            country: 'US',
            currency: CONST.CURRENCY.USD,
            fieldsType: 'local',
            plaidAccessToken,
        }),
    };

    requireParameters([
        'accountNumber',
        'addressName',
        'isSavings',
        'password',
        'routingNumber',
    ], parameters, commandName);

    const onyxData = {
        optimisticData: [
            {
                onyxMethod: 'merge',
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {
                    loading: true,
                    error: '',
                },
            },
        ],
        successData: [
            {
                onyxMethod: 'merge',
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {
                    loading: false,
                    error: '',

                    // Once the bank account has been added, we show a success message with a Continue button.
                    // When clicking on the button, we should redirect to this route.
                    successRoute: ROUTES.SETTINGS_PAYMENTS,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: 'merge',
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {
                    loading: false,
                    error: Localize.translateLocal('paymentsPage.addBankAccountFailure'),
                },
            },
        ],
    };

    API.write(commandName, parameters, onyxData);
}

/**
 * Deletes a bank account
 *
 * @param {Number} bankAccountID
 */
function deleteBankAccount(bankAccountID) {
    const reimbursementBankAccountId = lodashGet(store.getReimbursementAccountInSetup(), 'bankAccountID');

    // Early return as DeleteBankAccount API is called inside `resetFreePlanBankAccount`
    if (reimbursementBankAccountId === bankAccountID) {
        ReimbursementAccount.resetFreePlanBankAccount();
        return;
    }
    DeprecatedAPI.DeleteBankAccount({
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
