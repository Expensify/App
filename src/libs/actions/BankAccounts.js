import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
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
 * Add beneficial owners for the bank account, accept the ACH terms and conditions and verify the accuracy of the information provided
 *
 * @param {Object} achContractStepData
 */
 function updateBeneficialOwnersForBankAccount(achContractStepData) {
    const bankAccountID = lodashGet(store.getReimbursementAccountInSetup(), 'bankAccountID');
    API.write('updateBeneficialOwnersForBankAccount', {
        bankAccountID,
        ownsMoreThan25Percent: achContractStepData.ownsMoreThan25Percent,
        hasOtherBeneficialOwners: achContractStepData.hasOtherBeneficialOwners,
        didAcceptTermsAndConditions: achContractStepData.didAcceptTermsAndConditions,
        didCertifyTrueInformation: achContractStepData.didCertifyTrueInformation,
        beneficialOwners: achContractStepData.beneficialOwners,
    }, getVBBADataForOnyx());
}

export {
    addPersonalBankAccount,
    deletePaymentBankAccount,
    clearPersonalBankAccount,
    clearPlaid,
    updateBeneficialOwnersForBankAccount,
};
