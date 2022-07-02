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

function getOnyxDataForVBBA() {
    return {
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

        // No successData because PHP pusher is responsible for setting next step (along with isLoading false)
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
}

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

    API.write(commandName, parameters, getOnyxDataForVBBA());
}

function updateBankAccountManualInfoForVBBA(reimbursementAccountDraft) {
    const commandName = 'UpdateBankAccountManualInfoForVBBA';

    const parameters = {
        bankAccountID: reimbursementAccountDraft.bankAccountID,
        routingNumber: reimbursementAccountDraft.routingNumber,
        accountNumber: reimbursementAccountDraft.accountNumber,
        plaidMask: reimbursementAccountDraft.plaidMask,
    };

    API.write(commandName, parameters, getOnyxDataForVBBA());
}

function updateCompanyInfoForVBBA(reimbursementAccountDraft) {
    const commandName = 'UpdateCompanyInfoForVBBA';

    const parameters = {
        bankAccountID: reimbursementAccountDraft.bankAccountID,

        // Fields from the BankAccountStep
        routingNumber: reimbursementAccountDraft.routingNumber,
        accountNumber: reimbursementAccountDraft.accountNumber,
        bank: reimbursementAccountDraft.bankName,
        plaidAccountID: reimbursementAccountDraft.plaidAccountID,
        isSavings: reimbursementAccountDraft.isSavings,
        plaidAccessToken: reimbursementAccountDraft.plaidAccessToken,

        // Fields from the CompanyStep
        companyName: reimbursementAccountDraft.companyName,
        addressStreet: reimbursementAccountDraft.addressStreet,
        addressCity: reimbursementAccountDraft.addressCity,
        addressState: reimbursementAccountDraft.addressState,
        addressZip: reimbursementAccountDraft.addressZipCode,
        website: reimbursementAccountDraft.website,
        companyTaxID: reimbursementAccountDraft.companyTaxID,
        incorporationDate: reimbursementAccountDraft.incorporationDate,
        incorporationState: reimbursementAccountDraft.incorporationState,
        incorporationType: reimbursementAccountDraft.incorporationType,
        companyPhone: reimbursementAccountDraft.companyPhone,
        hasNoConnectionToCannabis: reimbursementAccountDraft.hasNoConnectionToCannabis,
    };

    API.write(commandName, parameters, getOnyxDataForVBBA());
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

export {
    addPersonalBankAccount,
    deletePaymentBankAccount,
    clearPersonalBankAccount,
    clearPlaid,
    connectBankAccountWithPlaid,
    updateBankAccountManualInfoForVBBA,
    updateCompanyInfoForVBBA,
};
