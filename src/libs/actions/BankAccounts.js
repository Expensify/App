import Onyx from 'react-native-onyx';
import _ from 'underscore';
import CONST from '../../CONST';
import * as API from '../API';
import ONYXKEYS from '../../ONYXKEYS';
import * as Localize from '../Localize';
import DateUtils from '../DateUtils';
import * as store from './ReimbursementAccount/store';

export {
    setupWithdrawalAccount,
    fetchFreePlanVerifiedBankAccount,
    goToWithdrawalAccountSetupStep,
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
    answerQuestionsForWallet,
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

function updatePlaidData(plaidData) {
    Onyx.merge(ONYXKEYS.PLAID_DATA, plaidData);
}

/**
 * Helper method to build the Onyx data required during setup of a Verified Business Bank Account
 *
 * @returns {Object}
 */
// We'll remove the below once this function is used by the VBBA commands that are yet to be implemented
function getVBBADataForOnyx() {
    return {
        optimisticData: [
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {
                    isLoading: true,
                    errors: null,
                },
            },
        ],
        successData: [
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {
                    isLoading: false,
                    errors: null,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {
                    isLoading: false,
                    errors: {
                        [DateUtils.getMicroseconds()]: Localize.translateLocal('paymentsPage.addBankAccountFailure'),
                    },
                },
            },
        ],
    };
}

/**
 * Submit Bank Account step with Plaid data so php can perform some checks.
 *
 * @param {Number} bankAccountID
 * @param {Object} selectedPlaidBankAccount
 */
function connectBankAccountWithPlaid(bankAccountID, selectedPlaidBankAccount) {
    const commandName = 'ConnectBankAccountWithPlaid';

    const parameters = {
        bankAccountID,
        routingNumber: selectedPlaidBankAccount.routingNumber,
        accountNumber: selectedPlaidBankAccount.accountNumber,
        bank: selectedPlaidBankAccount.bankName,
        plaidAccountID: selectedPlaidBankAccount.plaidAccountID,
        plaidAccessToken: selectedPlaidBankAccount.plaidAccessToken,
    };

    API.write(commandName, parameters, getVBBADataForOnyx());
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
                    isLoading: true,
                    error: '',
                },
            },
        ],
        successData: [
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.PERSONAL_BANK_ACCOUNT,
                value: {
                    isLoading: false,
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
                    isLoading: false,
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
                isLoading: true,
                errors: null,
            },
        }],
        successData: [{
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
            value: {
                isLoading: false,
            },
        }],
        failureData: [{
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
            value: {
                isLoading: false,
            },
        }],
    });
}

/**
 * @param {Object} data
 * @returns {Object}
 */
function mergeWithLocalACHData(data) {
    const updatedACHData = {
        ...store.getReimbursementAccountInSetup(),
        ...data,

        // This param tells Web-Secure that this bank account is from NewDot so we can modify links back to the correct
        // app in any communications. It also will be used to provision a customer for the Expensify card automatically
        // once their bank account is successfully validated.
        enableCardAfterVerified: true,
    };

    if (data && !_.isUndefined(data.isSavings)) {
        updatedACHData.isSavings = Boolean(data.isSavings);
    }
    if (!updatedACHData.setupType) {
        updatedACHData.setupType = updatedACHData.plaidAccountID
            ? CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID
            : CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL;
    }

    return updatedACHData;
}

/**
 * Updates the bank account in the database with the company step data
 *
 * @param {Object} params
 * @param {String} [params.companyName]
 * @param {String} [params.addressStreet]
 * @param {String} [params.addressCity]
 * @param {String} [params.addressState]
 * @param {String} [params.addressZipCode]
 * @param {String} [params.companyPhone]
 * @param {String} [params.website]
 * @param {String} [params.companyTaxID]
 * @param {String} [params.incorporationType]
 * @param {String} [params.incorporationState]
 * @param {String} [params.incorporationDate]
 * @param {Boolean} [params.hasNoConnectionToCannabis]
 */
function updateCompanyInformationForBankAccount(params) {
    API.write(
        'UpdateCompanyInformationForBankAccount',
        mergeWithLocalACHData(params),
        getVBBADataForOnyx(),
    );
}

export {
    addPersonalBankAccount,
    deletePaymentBankAccount,
    clearPersonalBankAccount,
    clearPlaid,
    validateBankAccount,
    updateCompanyInformationForBankAccount,
    connectBankAccountWithPlaid,
    updatePlaidData,
};
