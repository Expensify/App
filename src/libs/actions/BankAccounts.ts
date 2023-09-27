import Onyx from 'react-native-onyx';
import CONST from '../../CONST';
import * as API from '../API';
import ONYXKEYS from '../../ONYXKEYS';
import * as ErrorUtils from '../ErrorUtils';
import * as PlaidDataProps from '../../pages/ReimbursementAccount/plaidDataPropTypes';
import Navigation from '../Navigation/Navigation';
import ROUTES from '../../ROUTES';
import * as ReimbursementAccount from './ReimbursementAccount';
import PlaidBankAccount from '../../types/onyx/PlaidBankAccount';
import {ACHContractStepProps, BankAccountStepProps, CompanyStepProps, OnfidoData, ReimbursementAccountProps, RequestorStepProps} from '../../types/onyx/ReimbursementAccountDraft';
import {Request} from '../../types/onyx';

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
export {openPlaidBankAccountSelector, openPlaidBankLogin} from './Plaid';
export {openOnfidoFlow, answerQuestionsForWallet, verifyIdentity, acceptWalletTerms} from './Wallet';

type BankAccountCompanyInformation = BankAccountStepProps & CompanyStepProps & ReimbursementAccountProps;

function clearPlaid(): Promise<void> {
    Onyx.set(ONYXKEYS.PLAID_LINK_TOKEN, '');

    return Onyx.set(ONYXKEYS.PLAID_DATA, PlaidDataProps.plaidDataDefaultProps);
}

function openPlaidView() {
    clearPlaid().then(() => ReimbursementAccount.setBankAccountSubStep(CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID));
}

/**
 * Open the personal bank account setup flow, with an optional exitReportID to redirect to once the flow is finished.
 */
function openPersonalBankAccountSetupView(exitReportID: string) {
    clearPlaid().then(() => {
        if (exitReportID) {
            Onyx.merge(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {exitReportID});
        }
        Navigation.navigate(ROUTES.SETTINGS_ADD_BANK_ACCOUNT, '');
    });
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
 */
function getVBBADataForOnyx(): Request {
    return {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {
                    isLoading: true,
                    errors: undefined,
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {
                    isLoading: false,
                    errors: undefined,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {
                    isLoading: false,
                    errors: ErrorUtils.getMicroSecondOnyxError('walletPage.addBankAccountFailure'),
                },
            },
        ],
    };
}

/**
 * Submit Bank Account step with Plaid data so php can perform some checks.
 */
function connectBankAccountWithPlaid(bankAccountID: number, selectedPlaidBankAccount: PlaidBankAccount) {
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
 * @TODO offline pattern for this command will have to be added later once the pattern B design doc is complete
 */
function addPersonalBankAccount(account: PlaidBankAccount) {
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
                onyxMethod: Onyx.METHOD.MERGE,
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
                onyxMethod: Onyx.METHOD.MERGE,
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
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.PERSONAL_BANK_ACCOUNT,
                value: {
                    isLoading: false,
                    errors: ErrorUtils.getMicroSecondOnyxError('walletPage.addBankAccountFailure'),
                },
            },
        ],
    };

    API.write(commandName, parameters, onyxData);
}

function deletePaymentBankAccount(bankAccountID: number) {
    API.write(
        'DeletePaymentBankAccount',
        {
            bankAccountID,
        },
        {
            optimisticData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.BANK_ACCOUNT_LIST}`,
                    value: {[bankAccountID]: {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}},
                },
            ],

            // Sometimes pusher updates aren't received when we close the App while still offline,
            // so we are setting the bankAccount to null here to ensure that it gets cleared out once we come back online.
            successData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.BANK_ACCOUNT_LIST}`,
                    value: {[bankAccountID]: null},
                },
            ],
        },
    );
}

/**
 * Update the user's personal information on the bank account in database.
 *
 * This action is called by the requestor step in the Verified Bank Account flow
 */
function updatePersonalInformationForBankAccount(params: RequestorStepProps) {
    API.write('UpdatePersonalInformationForBankAccount', params, getVBBADataForOnyx());
}

function validateBankAccount(bankAccountID: number, validateCode: string) {
    API.write(
        'ValidateBankAccountWithTransactions',
        {
            bankAccountID,
            validateCode,
        },
        {
            optimisticData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                    value: {
                        isLoading: true,
                        errors: null,
                    },
                },
            ],
            successData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                    value: {
                        isLoading: false,
                    },
                },
            ],
            failureData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                    value: {
                        isLoading: false,
                    },
                },
            ],
        },
    );
}

function openReimbursementAccountPage(stepToOpen: string, subStep: string, localCurrentStep: string) {
    const onyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {
                    isLoading: true,
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {
                    isLoading: false,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
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
 */
function updateCompanyInformationForBankAccount(bankAccount: BankAccountCompanyInformation, policyID: string) {
    API.write('UpdateCompanyInformationForBankAccount', {...bankAccount, policyID}, getVBBADataForOnyx());
}

/**
 * Add beneficial owners for the bank account, accept the ACH terms and conditions and verify the accuracy of the information provided
 */
function updateBeneficialOwnersForBankAccount(params: ACHContractStepProps) {
    API.write('UpdateBeneficialOwnersForBankAccount', {...params}, getVBBADataForOnyx());
}

/**
 * Create the bank account with manually entered data.
 *
 */
function connectBankAccountManually(bankAccountID: number, accountNumber: string, routingNumber: string, plaidMask: string) {
    API.write(
        'ConnectBankAccountManually',
        {
            bankAccountID,
            accountNumber,
            routingNumber,
            plaidMask,
        },
        getVBBADataForOnyx(),
    );
}

/**
 * Verify the user's identity via Onfido
 */
function verifyIdentityForBankAccount(bankAccountID: number, onfidoData: OnfidoData) {
    API.write(
        'VerifyIdentityForBankAccount',
        {
            bankAccountID,
            onfidoData: JSON.stringify(onfidoData),
        },
        getVBBADataForOnyx(),
    );
}

function openWorkspaceView() {
    API.read('OpenWorkspaceView', {}, {});
}

function handlePlaidError(bankAccountID: number, error: string, errorDescription: string, plaidRequestID: string) {
    API.write('BankAccount_HandlePlaidError', {
        bankAccountID,
        error,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        error_description: errorDescription,
        plaidRequestID,
    });
}

/**
 * Set the reimbursement account loading so that it happens right away, instead of when the API command is processed.
 */
function setReimbursementAccountLoading(isLoading: boolean) {
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
    handlePlaidError,
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
