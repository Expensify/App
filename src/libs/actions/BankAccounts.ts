import Onyx from 'react-native-onyx';
import CONST from '../../CONST';
import * as API from '../API';
import ONYXKEYS from '../../ONYXKEYS';
import * as ErrorUtils from '../ErrorUtils';
import * as PlaidDataProps from '../../pages/ReimbursementAccount/plaidDataPropTypes';
import Navigation from '../Navigation/Navigation';
import ROUTES from '../../ROUTES';
import * as ReimbursementAccount from './ReimbursementAccount';
import type PlaidBankAccount from '../../types/onyx/PlaidBankAccount';
import type {ACHContractStepProps, BankAccountStepProps, CompanyStepProps, OnfidoData, ReimbursementAccountProps, RequestorStepProps} from '../../types/onyx/ReimbursementAccountDraft';
import type {OnyxData} from '../../types/onyx/Request';
import type {BankAccountStep, BankAccountSubStep} from '../../types/onyx/ReimbursementAccount';

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

type ReimbursementAccountStep = BankAccountStep | '';

type ReimbursementAccountSubStep = BankAccountSubStep | '';

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
        Navigation.navigate(ROUTES.SETTINGS_ADD_BANK_ACCOUNT);
    });
}

/**
 * Whether after adding a bank account we should continue with the KYC flow
 */
function setPersonalBankAccountContinueKYCOnSuccess(onSuccessFallbackRoute: string) {
    Onyx.merge(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {onSuccessFallbackRoute});
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
function getVBBADataForOnyx(currentStep?: BankAccountStep): OnyxData {
    return {
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
                    errors: null,
                    // When setting up a bank account, we save the draft form values in Onyx.
                    // When we update the information for a step, the value of some fields that are returned from the API
                    // can be different from the value that we stored as the draft in Onyx (i.e. the phone number is formatted).
                    // This is why we store the current step used to call the API in order to update the corresponding draft data in Onyx.
                    // If currentStep is undefined that means this step don't need to update the data of the draft in Onyx.
                    draftStep: currentStep,
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

    type ConnectBankAccountWithPlaidParams = {
        bankAccountID: number;
        routingNumber: string;
        accountNumber: string;
        bank?: string;
        plaidAccountID: string;
        plaidAccessToken: string;
    };

    const parameters: ConnectBankAccountWithPlaidParams = {
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

    type AddPersonalBankAccountParams = {
        addressName: string;
        routingNumber: string;
        accountNumber: string;
        isSavings: boolean;
        setupType: string;
        bank?: string;
        plaidAccountID: string;
        plaidAccessToken: string;
    };

    const parameters: AddPersonalBankAccountParams = {
        addressName: account.addressName,
        routingNumber: account.routingNumber,
        accountNumber: account.accountNumber,
        isSavings: account.isSavings,
        setupType: 'plaid',
        bank: account.bankName,
        plaidAccountID: account.plaidAccountID,
        plaidAccessToken: account.plaidAccessToken,
    };

    const onyxData: OnyxData = {
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
    type DeletePaymentBankAccountParams = {bankAccountID: number};

    const parameters: DeletePaymentBankAccountParams = {bankAccountID};

    const onyxData: OnyxData = {
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
    };

    API.write('DeletePaymentBankAccount', parameters, onyxData);
}

/**
 * Update the user's personal information on the bank account in database.
 *
 * This action is called by the requestor step in the Verified Bank Account flow
 */
function updatePersonalInformationForBankAccount(params: RequestorStepProps) {
    API.write('UpdatePersonalInformationForBankAccount', params, getVBBADataForOnyx(CONST.BANK_ACCOUNT.STEP.REQUESTOR));
}

function validateBankAccount(bankAccountID: number, validateCode: string) {
    type ValidateBankAccountWithTransactionsParams = {
        bankAccountID: number;
        validateCode: string;
    };

    const parameters: ValidateBankAccountWithTransactionsParams = {
        bankAccountID,
        validateCode,
    };

    const onyxData: OnyxData = {
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
    };

    API.write('ValidateBankAccountWithTransactions', parameters, onyxData);
}

function clearReimbursementAccount() {
    Onyx.set(ONYXKEYS.REIMBURSEMENT_ACCOUNT, null);
}

function openReimbursementAccountPage(stepToOpen: ReimbursementAccountStep, subStep: ReimbursementAccountSubStep, localCurrentStep: ReimbursementAccountStep) {
    const onyxData: OnyxData = {
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

    type OpenReimbursementAccountPageParams = {
        stepToOpen: ReimbursementAccountStep;
        subStep: ReimbursementAccountSubStep;
        localCurrentStep: ReimbursementAccountStep;
    };

    const parameters: OpenReimbursementAccountPageParams = {
        stepToOpen,
        subStep,
        localCurrentStep,
    };

    return API.read('OpenReimbursementAccountPage', parameters, onyxData);
}

/**
 * Updates the bank account in the database with the company step data
 */
function updateCompanyInformationForBankAccount(bankAccount: BankAccountCompanyInformation, policyID: string) {
    type UpdateCompanyInformationForBankAccountParams = BankAccountCompanyInformation & {policyID: string};

    const parameters: UpdateCompanyInformationForBankAccountParams = {...bankAccount, policyID};

    API.write('UpdateCompanyInformationForBankAccount', parameters, getVBBADataForOnyx(CONST.BANK_ACCOUNT.STEP.COMPANY));
}

/**
 * Add beneficial owners for the bank account, accept the ACH terms and conditions and verify the accuracy of the information provided
 */
function updateBeneficialOwnersForBankAccount(params: ACHContractStepProps) {
    API.write('UpdateBeneficialOwnersForBankAccount', params, getVBBADataForOnyx());
}

/**
 * Create the bank account with manually entered data.
 *
 */
function connectBankAccountManually(bankAccountID: number, accountNumber?: string, routingNumber?: string, plaidMask?: string) {
    type ConnectBankAccountManuallyParams = {
        bankAccountID: number;
        accountNumber?: string;
        routingNumber?: string;
        plaidMask?: string;
    };

    const parameters: ConnectBankAccountManuallyParams = {
        bankAccountID,
        accountNumber,
        routingNumber,
        plaidMask,
    };

    API.write('ConnectBankAccountManually', parameters, getVBBADataForOnyx(CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT));
}

/**
 * Verify the user's identity via Onfido
 */
function verifyIdentityForBankAccount(bankAccountID: number, onfidoData: OnfidoData) {
    type VerifyIdentityForBankAccountParams = {
        bankAccountID: number;
        onfidoData: string;
    };

    const parameters: VerifyIdentityForBankAccountParams = {
        bankAccountID,
        onfidoData: JSON.stringify(onfidoData),
    };

    API.write('VerifyIdentityForBankAccount', parameters, getVBBADataForOnyx());
}

function openWorkspaceView() {
    API.read('OpenWorkspaceView', {}, {});
}

function handlePlaidError(bankAccountID: number, error: string, errorDescription: string, plaidRequestID: string) {
    type BankAccountHandlePlaidErrorParams = {
        bankAccountID: number;
        error: string;
        errorDescription: string;
        plaidRequestID: string;
    };

    const parameters: BankAccountHandlePlaidErrorParams = {
        bankAccountID,
        error,
        errorDescription,
        plaidRequestID,
    };

    API.write('BankAccount_HandlePlaidError', parameters);
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
    setPersonalBankAccountContinueKYCOnSuccess,
    openPersonalBankAccountSetupView,
    clearReimbursementAccount,
    openReimbursementAccountPage,
    updateBeneficialOwnersForBankAccount,
    updateCompanyInformationForBankAccount,
    updatePersonalInformationForBankAccount,
    openWorkspaceView,
    validateBankAccount,
    verifyIdentityForBankAccount,
    setReimbursementAccountLoading,
};
