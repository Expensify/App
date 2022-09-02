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
                    errorFields: {
                        selectedPlaidBankAccount: null,
                    },
                    pendingFields: {
                        selectedPlaidBankAccount: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                        selectedPlaidIndex: account.selectedPlaidIndex,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.PERSONAL_BANK_ACCOUNT,
                value: {
                    loading: false,
                    shouldShowSuccess: true,
                    errorFields: {
                        selectedPlaidBankAccount: null,
                    },
                    pendingFields: {
                        selectedPlaidBankAccount: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.PERSONAL_BANK_ACCOUNT,
                value: {
                    loading: false,
                    errorFields: {
                        selectedPlaidBankAccount: null,
                    },
                    pendingFields: {
                        selectedPlaidBankAccount: null,
                    },
                },
            },
        ],
    };

    API.write(commandName, parameters, onyxData);
}

/**
 * Clear the pending and error fields for adding a pesonal bank account form in /add-bank-account
 */
function clearPersonalBankAccountErrors() {
    Onyx.merge(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {
        errorFields: {
            selectedPlaidBankAccount: null,
        },
        pendingFields: {
            selectedPlaidBankAccount: null,
            selectedPlaidIndex: undefined,
        },
    });
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

export {
    addPersonalBankAccount,
    clearPersonalBankAccountErrors,
    deletePaymentBankAccount,
    clearPersonalBankAccount,
    clearPlaid,
};
