import Onyx from 'react-native-onyx';
import CONST from '../../CONST';
import * as API from '../API';
import ONYXKEYS from '../../ONYXKEYS';
import * as Localize from '../Localize';
import DateUtils from '../DateUtils';
import * as PlaidDataProps from '../../pages/ReimbursementAccount/plaidDataPropTypes';
import Navigation from '../Navigation/Navigation';
import ROUTES from '../../ROUTES';
import * as ReimbursementAccount from './ReimbursementAccount';

export {
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
    answerQuestionsForWallet,
    verifyIdentity,
    acceptWalletTerms,
} from './Wallet';

function clearPlaid() {
    Onyx.set(ONYXKEYS.PLAID_LINK_TOKEN, '');

    return Onyx.set(ONYXKEYS.PLAID_DATA, PlaidDataProps.plaidDataDefaultProps);
}

function openPlaidView() {
    clearPlaid().then(() => ReimbursementAccount.setBankAccountSubStep(CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID));
}

function openPersonalBankAccountSetupView() {
    clearPlaid().then(() => Navigation.navigate(ROUTES.SETTINGS_ADD_BANK_ACCOUNT));
}

function clearPersonalBankAccount() {
    clearPlaid();
    Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {});
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
 * @TODO offline pattern for this command will have to be added later once the pattern B design doc is complete
 */
function addPersonalBankAccount(account) {
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
    };

    const onyxData = {
        optimisticData: [
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.PERSONAL_BANK_ACCOUNT,
                value: {
                    isLoading: true,
                    errors: null,
                    plaidAccountID: account.plaidAccountID,
                },
            },
        ],
        successData: [
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.PERSONAL_BANK_ACCOUNT,
                value: {
                    isLoading: false,
                    errors: null,
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
                    errors: {
                        [DateUtils.getMicroseconds()]: Localize.translateLocal('paymentsPage.addBankAccountFailure'),
                    },
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

        // Sometimes pusher updates aren't received when we close the App while still offline,
        // so we are setting the bankAccount to null here to ensure that it gets cleared out once we come back online.
        successData: [
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: `${ONYXKEYS.BANK_ACCOUNT_LIST}`,
                value: {[bankAccountID]: null},
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

function openReimbursementAccountPage(stepToOpen, subStep, localCurrentStep) {
    const onyxData = {
        optimisticData: [
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {
                    errors: null,
                    isLoading: true,
                },
            },
        ],
        successData: [
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {
                    isLoading: false,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {
                    isLoading: false,
                },
            },
        ],
    };

    const param = {
        stepToOpen,
        subStep,
        localCurrentStep,
    };

    return API.read('OpenReimbursementAccountPage', param, onyxData);
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
 * Add beneficial owners for the bank account, accept the ACH terms and conditions and verify the accuracy of the information provided
 *
 * @param {Object} params
 *
 * // ACH Contract Step
 * @param {Boolean} [params.ownsMoreThan25Percent]
 * @param {Boolean} [params.hasOtherBeneficialOwners]
 * @param {Boolean} [params.acceptTermsAndConditions]
 * @param {Boolean} [params.certifyTrueInformation]
 * @param {String}  [params.beneficialOwners]
 */
function updateBeneficialOwnersForBankAccount(params) {
    API.write('UpdateBeneficialOwnersForBankAccount', {...params}, getVBBADataForOnyx());
}

/**
 * Create the bank account with manually entered data.
 *
 * @param {number} [bankAccountID]
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

function openWorkspaceView() {
    API.read('OpenWorkspaceView');
}

/**
 * Set the reimbursement account loading so that it happens right away, instead of when the API command is processed.
 *
 * @param {Boolean} isLoading
 */
function setReimbursementAccountLoading(isLoading) {
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {isLoading});
}

export {
    addPersonalBankAccount,
    clearOnfidoToken,
    clearPersonalBankAccount,
    clearPlaid,
    openPlaidView,
    connectBankAccountManually,
    connectBankAccountWithPlaid,
    deletePaymentBankAccount,
    openPersonalBankAccountSetupView,
    openReimbursementAccountPage,
    updateBeneficialOwnersForBankAccount,
    updateCompanyInformationForBankAccount,
    updatePersonalInformationForBankAccount,
    openWorkspaceView,
    validateBankAccount,
    verifyIdentityForBankAccount,
    setReimbursementAccountLoading,
};
