import Onyx from 'react-native-onyx';
import CONST from '../../CONST';
import * as API from '../API';
import ONYXKEYS from '../../ONYXKEYS';
import * as Localize from '../Localize';
import DateUtils from '../DateUtils';

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

function clearOnfidoToken() {
    Onyx.merge(ONYXKEYS.ONFIDO_TOKEN, '');
}

/**
 * Helper method to build the Onyx data required during setup of a Verified Business Bank Account
 *
 * @returns {Object}
 */
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
* Update the user's personal information on the bank account in database.
*
* This action is called by the requestor step in the Verified Bank Account flow
*
* @param {Object} params
*
* @param {String} [params.dob]
* @param {String} [params.firstName]
* @param {String} [params.lastName]
* @param {String} [params.requestorAddressStreet]
* @param {String} [params.requestorAddressCity]
* @param {String} [params.requestorAddressState]
* @param {String} [params.requestorAddressZipCode]
* @param {String} [params.ssnLast4]
* @param {String} [params.isControllingOfficer]
* @param {Object} [params.onfidoData]
* @param {Boolean} [params.isOnfidoSetupComplete]
*/
function updatePersonalInformationForBankAccount(params) {
    API.write('UpdatePersonalInformationForBankAccount', params, getVBBADataForOnyx());
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

function openReimbursementAccountPage() {
    const onyxData = {
        optimisticData: [
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {
                    error: '',
                    loading: true,
                },
            },
        ],
        successData: [
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {
                    loading: false,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {
                    loading: false,
                },
            },
        ],
    };

    return API.read('OpenReimbursementAccountPage', {}, onyxData);
}

/**
 * Updates the bank account in the database with the company step data
 *
 * @param {Object} bankAccount
 * @param {Number} [bankAccount.bankAccountID]
 *
 * Fields from BankAccount step
 * @param {String} [bankAccount.routingNumber]
 * @param {String} [bankAccount.accountNumber]
 * @param {String} [bankAccount.bankName]
 * @param {String} [bankAccount.plaidAccountID]
 * @param {String} [bankAccount.plaidAccessToken]
 * @param {Boolean} [bankAccount.isSavings]
 *
 * Fields from Company step
 * @param {String} [bankAccount.companyName]
 * @param {String} [bankAccount.addressStreet]
 * @param {String} [bankAccount.addressCity]
 * @param {String} [bankAccount.addressState]
 * @param {String} [bankAccount.addressZipCode]
 * @param {String} [bankAccount.companyPhone]
 * @param {String} [bankAccount.website]
 * @param {String} [bankAccount.companyTaxID]
 * @param {String} [bankAccount.incorporationType]
 * @param {String} [bankAccount.incorporationState]
 * @param {String} [bankAccount.incorporationDate]
 * @param {Boolean} [bankAccount.hasNoConnectionToCannabis]
 */
function updateCompanyInformationForBankAccount(bankAccount) {
    API.write('UpdateCompanyInformationForBankAccount', bankAccount, getVBBADataForOnyx());
}

/**
 * Create the bank account with manually entered data.
 *
 * @param {String} [bankAccountID]
 * @param {String} [accountNumber]
 * @param {String} [routingNumber]
 * @param {String} [plaidMask]
 *
 */
function connectBankAccountManually(bankAccountID, accountNumber, routingNumber, plaidMask) {
    API.write('ConnectBankAccountManually', {
        bankAccountID,
        accountNumber,
        routingNumber,
        plaidMask,
    }, getVBBADataForOnyx());
}

/**
 * Verify the user's identity via Onfido
 *
 * @param {Number} bankAccountID
 * @param {Object} onfidoData
 */
function verifyIdentityForBankAccount(bankAccountID, onfidoData) {
    API.write('VerifyIdentityForBankAccount', {
        bankAccountID,
        onfidoData: JSON.stringify(onfidoData),
    }, getVBBADataForOnyx());
}

export {
    addPersonalBankAccount,
    connectBankAccountManually,
    deletePaymentBankAccount,
    clearPersonalBankAccount,
    clearPlaid,
    clearOnfidoToken,
    openReimbursementAccountPage,
    updatePersonalInformationForBankAccount,
    validateBankAccount,
    verifyIdentityForBankAccount,
    updateCompanyInformationForBankAccount,
    connectBankAccountWithPlaid,
    updatePlaidData,
};
