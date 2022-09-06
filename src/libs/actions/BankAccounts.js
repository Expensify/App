import Onyx from 'react-native-onyx';
import CONST from '../../CONST';
import * as API from '../API';
import ONYXKEYS from '../../ONYXKEYS';
import * as Localize from '../Localize';

export {
    setupWithdrawalAccount,
    fetchFreePlanVerifiedBankAccount,
    goToWithdrawalAccountSetupStep,
    showBankAccountErrorModal,
    showBankAccountFormValidationError,
    setBankAccountFormValidationErrors,
    resetReimbursementAccount,
    resetFreePlanBankAccount,
    hideBankAccountErrors,
    setWorkspaceIDForReimbursementAccount,
    setBankAccountSubStep,
    updateReimbursementAccountDraft,
    requestResetFreePlanBankAccount,
    cancelResetFreePlanBankAccount,
} from './ReimbursementAccount';
export {
    openPlaidBankAccountSelector,
    openPlaidBankLogin,
} from './Plaid';
export {
    openOnfidoFlow,
    activateWallet,
    verifyIdentity,
    acceptWalletTerms,
} from './Wallet';

function clearPersonalBankAccount() {
    Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {});
}

function clearPlaid() {
    Onyx.set(ONYXKEYS.PLAID_DATA, {});
    Onyx.set(ONYXKEYS.PLAID_LINK_TOKEN, '');
}

/**
 * Adds a bank account via Plaid
 *
 * @param {Object} account
 * @param {String} password
 * @TODO offline pattern for this command will have to be added later once the pattern B design doc is complete
 */
function addPersonalBankAccount(account, password) {
    const commandName = 'AddPersonalBankAccount';

    const parameters = {
        addressName: account.addressName,
        routingNumber: account.routingNumber,
        accountNumber: account.accountNumber,
        isSavings: account.isSavings,
        setupType: 'plaid',
        bank: account.bankName,
        plaidAccountID: account.plaidAccountID,
        plaidAccessToken: account.plaidAccessToken,
        password,
    };

    const onyxData = {
        optimisticData: [
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.PERSONAL_BANK_ACCOUNT,
                value: {
                    loading: true,
                    error: '',
                },
            },
        ],
        successData: [
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.PERSONAL_BANK_ACCOUNT,
                value: {
                    loading: false,
                    error: '',
                    shouldShowSuccess: true,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.PERSONAL_BANK_ACCOUNT,
                value: {
                    loading: false,
                    error: Localize.translateLocal('paymentsPage.addBankAccountFailure'),
                },
            },
        ],
    };

    API.write(commandName, parameters, onyxData);
}

function deletePaymentBankAccount(bankAccountID) {
    API.write('DeletePaymentBankAccount', {
        bankAccountID,
    }, {
        optimisticData: [
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: `${ONYXKEYS.BANK_ACCOUNT_LIST}`,
                value: {[bankAccountID]: {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}},
            },
        ],
    });
}

/**
 * @param {Number} bankAccountID
 * @param {String} validateCode
 */
function validateBankAccount(bankAccountID, validateCode) {
    API.write('ValidateBankAccountWithTransactions', {
        bankAccountID,
        validateCode,
    }, {
        optimisticData: [{
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
            value: {
                errors: null,
                achData: {
                    state: CONST.BANK_ACCOUNT.STATE.OPEN,
                    currentStep: CONST.BANK_ACCOUNT.STEP.ENABLE,
                },
            },
        }],
        failureData: [{
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
            value: {
                achData: {
                    state: CONST.BANK_ACCOUNT.STATE.VERIFYING,
                    currentStep: CONST.BANK_ACCOUNT.STEP.VALIDATION,
                },
            },
        }],
    });
}

export {
    addPersonalBankAccount,
    deletePaymentBankAccount,
    clearPersonalBankAccount,
    clearPlaid,
    validateBankAccount,
};
