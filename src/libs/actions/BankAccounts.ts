import Onyx from 'react-native-onyx';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import type {OnfidoDataWithApplicantID} from '@components/Onfido/types';
import * as API from '@libs/API';
import type {
    AddPersonalBankAccountParams,
    BankAccountHandlePlaidErrorParams,
    ConnectBankAccountParams,
    DeletePaymentBankAccountParams,
    OpenReimbursementAccountPageParams,
    ValidateBankAccountWithTransactionsParams,
    VerifyIdentityForBankAccountParams,
} from '@libs/API/parameters';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as Localize from '@libs/Localize';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {PersonalBankAccountForm} from '@src/types/form';
import type {ACHContractStepProps, BeneficialOwnersStepProps, CompanyStepProps, RequestorStepProps} from '@src/types/form/ReimbursementAccountForm';
import type PlaidBankAccount from '@src/types/onyx/PlaidBankAccount';
import type {BankAccountStep, ReimbursementAccountStep, ReimbursementAccountSubStep} from '@src/types/onyx/ReimbursementAccount';
import type {OnyxData} from '@src/types/onyx/Request';
import * as ReimbursementAccount from './ReimbursementAccount';

export {
    goToWithdrawalAccountSetupStep,
    setBankAccountFormValidationErrors,
    resetReimbursementAccount,
    resetFreePlanBankAccount,
    hideBankAccountErrors,
    setBankAccountSubStep,
    updateReimbursementAccountDraft,
    requestResetFreePlanBankAccount,
    cancelResetFreePlanBankAccount,
} from './ReimbursementAccount';
export {openPlaidBankAccountSelector, openPlaidBankLogin} from './Plaid';
export {openOnfidoFlow, answerQuestionsForWallet, verifyIdentity, acceptWalletTerms} from './Wallet';

type AccountFormValues = typeof ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM | typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM;

type BusinessAddress = {
    addressStreet?: string;
    addressCity?: string;
    addressState?: string;
    addressZipCode?: string;
};

type PersonalAddress = {
    requestorAddressStreet?: string;
    requestorAddressCity?: string;
    requestorAddressState?: string;
    requestorAddressZipCode?: string;
};

function clearPlaid(): Promise<void | void[]> {
    Onyx.set(ONYXKEYS.PLAID_LINK_TOKEN, '');
    Onyx.set(ONYXKEYS.PLAID_CURRENT_EVENT, null);
    return Onyx.set(ONYXKEYS.PLAID_DATA, CONST.PLAID.DEFAULT_DATA);
}

function openPlaidView() {
    clearPlaid().then(() => ReimbursementAccount.setBankAccountSubStep(CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID));
}

function setPlaidEvent(eventName: string | null) {
    Onyx.set(ONYXKEYS.PLAID_CURRENT_EVENT, eventName);
}

/**
 * Open the personal bank account setup flow, with an optional exitReportID to redirect to once the flow is finished.
 */
function openPersonalBankAccountSetupView(exitReportID?: string, isUserValidated = true) {
    clearPlaid().then(() => {
        if (exitReportID) {
            Onyx.merge(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {exitReportID});
        }
        if (!isUserValidated) {
            Navigation.navigate(ROUTES.SETTINGS_WALLET_VERIFY_ACCOUNT.getRoute(Navigation.getActiveRoute(), ROUTES.SETTINGS_ADD_BANK_ACCOUNT));
        }
        Navigation.navigate(ROUTES.SETTINGS_ADD_BANK_ACCOUNT);
    });
}

/**
 * Open the personal bank account setup flow using Plaid, with an optional exitReportID to redirect to once the flow is finished.
 */
function openPersonalBankAccountSetupWithPlaid(exitReportID?: string) {
    clearPlaid().then(() => {
        if (exitReportID) {
            Onyx.merge(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {exitReportID});
        }
        Onyx.merge(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {setupType: CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID});
    });
}

function clearPersonalBankAccountSetupType() {
    Onyx.merge(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {setupType: null});
}

/**
 * Whether after adding a bank account we should continue with the KYC flow. If so, we must specify the fallback route.
 */
function setPersonalBankAccountContinueKYCOnSuccess(onSuccessFallbackRoute: Route) {
    Onyx.merge(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {onSuccessFallbackRoute});
}

function clearPersonalBankAccount() {
    clearPlaid();
    Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, null);
    Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, null);
    clearPersonalBankAccountSetupType();
}

function clearOnfidoToken() {
    Onyx.merge(ONYXKEYS.ONFIDO_TOKEN, '');
    Onyx.merge(ONYXKEYS.ONFIDO_APPLICANT_ID, '');
}

function updateAddPersonalBankAccountDraft(bankData: Partial<PersonalBankAccountForm>) {
    Onyx.merge(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, bankData);
}

/**
 * Helper method to build the Onyx data required during setup of a Verified Business Bank Account
 */
function getVBBADataForOnyx(currentStep?: BankAccountStep, shouldShowLoading = true): OnyxData {
    return {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {
                    isLoading: shouldShowLoading,
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
                    errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('walletPage.addBankAccountFailure'),
                },
            },
        ],
    };
}

function addBusinessWebsiteForDraft(websiteUrl: string) {
    Onyx.merge(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, {website: websiteUrl});
}

/**
 * Submit Bank Account step with Plaid data so php can perform some checks.
 */
function connectBankAccountWithPlaid(bankAccountID: number, selectedPlaidBankAccount: PlaidBankAccount, policyID: string) {
    const parameters: ConnectBankAccountParams = {
        bankAccountID,
        routingNumber: selectedPlaidBankAccount.routingNumber,
        accountNumber: selectedPlaidBankAccount.accountNumber,
        bank: selectedPlaidBankAccount.bankName,
        plaidAccountID: selectedPlaidBankAccount.plaidAccountID,
        plaidAccessToken: selectedPlaidBankAccount.plaidAccessToken,
        plaidMask: selectedPlaidBankAccount.mask,
        isSavings: selectedPlaidBankAccount.isSavings,
        policyID,
    };

    API.write(WRITE_COMMANDS.CONNECT_BANK_ACCOUNT_WITH_PLAID, parameters, getVBBADataForOnyx());
}

/**
 * Adds a bank account via Plaid
 *
 * TODO: offline pattern for this command will have to be added later once the pattern B design doc is complete
 */
function addPersonalBankAccount(account: PlaidBankAccount) {
    const parameters: AddPersonalBankAccountParams = {
        addressName: account.addressName ?? '',
        routingNumber: account.routingNumber,
        accountNumber: account.accountNumber,
        isSavings: account.isSavings ?? false,
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
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.USER_WALLET,
                value: {
                    currentStep: CONST.WALLET.STEP.ADDITIONAL_DETAILS,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.PERSONAL_BANK_ACCOUNT,
                value: {
                    isLoading: false,
                    errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('walletPage.addBankAccountFailure'),
                },
            },
        ],
    };

    API.write(WRITE_COMMANDS.ADD_PERSONAL_BANK_ACCOUNT, parameters, onyxData);
}

function deletePaymentBankAccount(bankAccountID: number) {
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

    API.write(WRITE_COMMANDS.DELETE_PAYMENT_BANK_ACCOUNT, parameters, onyxData);
}

/**
 * Update the user's personal information on the bank account in database.
 *
 * This action is called by the requestor step in the Verified Bank Account flow
 * @param bankAccountID - ID for bank account
 * @param params - User personal data
 * @param policyID - ID of the policy we're setting the bank account on
 * @param isConfirmPage - If we're submitting from the confirmation substep, to trigger all external checks
 */
function updatePersonalInformationForBankAccount(bankAccountID: number, params: RequestorStepProps, policyID: string, isConfirmPage: boolean) {
    API.write(
        WRITE_COMMANDS.UPDATE_PERSONAL_INFORMATION_FOR_BANK_ACCOUNT,
        {
            ...params,
            bankAccountID,
            policyID,
            confirm: isConfirmPage,
        },
        getVBBADataForOnyx(CONST.BANK_ACCOUNT.STEP.REQUESTOR, isConfirmPage),
    );
}

function validateBankAccount(bankAccountID: number, validateCode: string, policyID: string) {
    const parameters: ValidateBankAccountWithTransactionsParams = {
        bankAccountID,
        validateCode,
        policyID,
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
                    errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('bankAccount.error.validationAmounts'),
                },
            },
        ],
    };

    API.write(WRITE_COMMANDS.VALIDATE_BANK_ACCOUNT_WITH_TRANSACTIONS, parameters, onyxData);
}

function getCorpayBankAccountFields(country: string, currency: string) {
    // TODO - Use parameters when API is ready
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const parameters = {
        countryISO: country,
        currency,
        isWithdrawal: true,
        isBusinessBankAccount: true,
    };

    // return API.read(READ_COMMANDS.GET_CORPAY_BANK_ACCOUNT_FIELDS, parameters);
    return {
        bankCountry: 'AU',
        bankCurrency: 'AUD',
        classification: 'Business',
        destinationCountry: 'AU',
        formFields: [
            {
                errorMessage: 'Swift must be less than 12 characters',
                id: 'swiftBicCode',
                isRequired: false,
                isRequiredInValueSet: true,
                label: 'Swift Code',
                regEx: '^.{0,12}$',
                validationRules: [
                    {
                        errorMessage: 'Swift must be less than 12 characters',
                        regEx: '^.{0,12}$',
                    },
                    {
                        errorMessage: 'The following characters are not allowed: <,>, "',
                        regEx: '^[^<>\\x22]*$',
                    },
                ],
            },
            {
                errorMessage: 'Beneficiary Bank Name must be less than 250 characters',
                id: 'bankName',
                isRequired: true,
                isRequiredInValueSet: true,
                label: 'Bank Name',
                regEx: '^.{0,250}$',
                validationRules: [
                    {
                        errorMessage: 'Beneficiary Bank Name must be less than 250 characters',
                        regEx: '^.{0,250}$',
                    },
                    {
                        errorMessage: 'The following characters are not allowed: <,>, "',
                        regEx: '^[^<>\\x22]*$',
                    },
                ],
            },
            {
                errorMessage: 'City must be less than 100 characters',
                id: 'bankCity',
                isRequired: true,
                isRequiredInValueSet: true,
                label: 'Bank City',
                regEx: '^.{0,100}$',
                validationRules: [
                    {
                        errorMessage: 'City must be less than 100 characters',
                        regEx: '^.{0,100}$',
                    },
                    {
                        errorMessage: 'The following characters are not allowed: <,>, "',
                        regEx: '^[^<>\\x22]*$',
                    },
                ],
            },
            {
                errorMessage: 'Bank Address Line 1 must be less than 1000 characters',
                id: 'bankAddressLine1',
                isRequired: true,
                isRequiredInValueSet: true,
                label: 'Bank Address',
                regEx: '^.{0,1000}$',
                validationRules: [
                    {
                        errorMessage: 'Bank Address Line 1 must be less than 1000 characters',
                        regEx: '^.{0,1000}$',
                    },
                    {
                        errorMessage: 'The following characters are not allowed: <,>, "',
                        regEx: '^[^<>\\x22]*$',
                    },
                ],
            },
            {
                detailedRule: [
                    {
                        isRequired: true,
                        value: [
                            {
                                errorMessage: 'Beneficiary Account Number is invalid. Value should be 1 to 50 characters long.',
                                regEx: '^.{1,50}$',
                                ruleDescription: '1 to 50 characters',
                            },
                        ],
                    },
                ],
                errorMessage: 'Beneficiary Account Number is invalid. Value should be 1 to 50 characters long.',
                id: 'accountNumber',
                isRequired: true,
                isRequiredInValueSet: true,
                label: 'Account Number (iACH)',
                regEx: '^.{1,50}$',
                validationRules: [
                    {
                        errorMessage: 'Beneficiary Account Number is invalid. Value should be 1 to 50 characters long.',
                        regEx: '^.{1,50}$',
                        ruleDescription: '1 to 50 characters',
                    },
                    {
                        errorMessage: 'The following characters are not allowed: <,>, "',
                        regEx: '^[^<>\\x22]*$',
                    },
                ],
            },
            {
                detailedRule: [
                    {
                        isRequired: true,
                        value: [
                            {
                                errorMessage: 'BSB Number is invalid. Value should be exactly 6 digits long.',
                                regEx: '^[0-9]{6}$',
                                ruleDescription: 'Exactly 6 digits',
                            },
                        ],
                    },
                ],
                errorMessage: 'BSB Number is invalid. Value should be exactly 6 digits long.',
                id: 'routingCode',
                isRequired: true,
                isRequiredInValueSet: true,
                label: 'BSB Number',
                regEx: '^[0-9]{6}$',
                validationRules: [
                    {
                        errorMessage: 'BSB Number is invalid. Value should be exactly 6 digits long.',
                        regEx: '^[0-9]{6}$',
                        ruleDescription: 'Exactly 6 digits',
                    },
                    {
                        errorMessage: 'The following characters are not allowed: <,>, "',
                        regEx: '^[^<>\\x22]*$',
                    },
                ],
            },
        ],
        paymentMethods: ['E'],
        preferredMethod: 'E',
    };
}

function clearReimbursementAccount() {
    Onyx.set(ONYXKEYS.REIMBURSEMENT_ACCOUNT, null);
}

/**
 * Function to display and fetch data for Reimbursement Account step
 * @param stepToOpen - current step to open
 * @param subStep - particular step
 * @param localCurrentStep - last step on device
 * @param policyID - policy ID
 */
function openReimbursementAccountPage(stepToOpen: ReimbursementAccountStep, subStep: ReimbursementAccountSubStep, localCurrentStep: ReimbursementAccountStep, policyID: string) {
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

    const parameters: OpenReimbursementAccountPageParams = {
        stepToOpen,
        subStep,
        localCurrentStep,
        policyID,
    };

    return API.read(READ_COMMANDS.OPEN_REIMBURSEMENT_ACCOUNT_PAGE, parameters, onyxData);
}

/**
 * Updates the bank account in the database with the company step data
 * @param params - Business step form data
 * @param policyID - ID of the policy we're setting the bank account on
 * @param isConfirmPage - If we're submitting from the confirmation substep, to trigger all external checks
 */
function updateCompanyInformationForBankAccount(bankAccountID: number, params: Partial<CompanyStepProps>, policyID: string, isConfirmPage: boolean) {
    API.write(
        WRITE_COMMANDS.UPDATE_COMPANY_INFORMATION_FOR_BANK_ACCOUNT,
        {
            ...params,
            bankAccountID,
            policyID,
            confirm: isConfirmPage,
        },
        getVBBADataForOnyx(CONST.BANK_ACCOUNT.STEP.COMPANY, isConfirmPage),
    );
}

/**
 * Add beneficial owners for the bank account and verify the accuracy of the information provided
 * @param params - Beneficial Owners step form params
 */
function updateBeneficialOwnersForBankAccount(bankAccountID: number, params: Partial<BeneficialOwnersStepProps>, policyID: string) {
    API.write(
        WRITE_COMMANDS.UPDATE_BENEFICIAL_OWNERS_FOR_BANK_ACCOUNT,
        {
            ...params,
            bankAccountID,
            policyID,
        },
        getVBBADataForOnyx(),
    );
}

/**
 * Accept the ACH terms and conditions and verify the accuracy of the information provided
 * @param params - Verification step form params
 */
function acceptACHContractForBankAccount(bankAccountID: number, params: ACHContractStepProps, policyID: string) {
    API.write(
        WRITE_COMMANDS.ACCEPT_ACH_CONTRACT_FOR_BANK_ACCOUNT,
        {
            ...params,
            bankAccountID,
            policyID,
        },
        getVBBADataForOnyx(),
    );
}

/**
 * Create the bank account with manually entered data.
 */
function connectBankAccountManually(bankAccountID: number, bankAccount: PlaidBankAccount, policyID: string) {
    const parameters: ConnectBankAccountParams = {
        bankAccountID,
        routingNumber: bankAccount.routingNumber,
        accountNumber: bankAccount.accountNumber,
        bank: bankAccount.bankName,
        plaidAccountID: bankAccount.plaidAccountID,
        plaidAccessToken: bankAccount.plaidAccessToken,
        plaidMask: bankAccount.mask,
        isSavings: bankAccount.isSavings,
        policyID,
    };

    API.write(WRITE_COMMANDS.CONNECT_BANK_ACCOUNT_MANUALLY, parameters, getVBBADataForOnyx(CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT));
}

/**
 * Verify the user's identity via Onfido
 */
function verifyIdentityForBankAccount(bankAccountID: number, onfidoData: OnfidoDataWithApplicantID, policyID?: string) {
    const parameters: VerifyIdentityForBankAccountParams = {
        bankAccountID,
        onfidoData: JSON.stringify(onfidoData),
        policyID: policyID ?? '-1',
    };

    API.write(WRITE_COMMANDS.VERIFY_IDENTITY_FOR_BANK_ACCOUNT, parameters, getVBBADataForOnyx());
}

function openWorkspaceView(policyID: string) {
    API.read(
        READ_COMMANDS.OPEN_WORKSPACE_VIEW,
        {
            policyID,
        },
        {
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
        },
    );
}

function handlePlaidError(bankAccountID: number, error: string, errorDescription: string, plaidRequestID: string) {
    const parameters: BankAccountHandlePlaidErrorParams = {
        bankAccountID,
        error,
        errorDescription,
        plaidRequestID,
    };

    API.write(WRITE_COMMANDS.BANK_ACCOUNT_HANDLE_PLAID_ERROR, parameters);
}

/**
 * Set the reimbursement account loading so that it happens right away, instead of when the API command is processed.
 */
function setReimbursementAccountLoading(isLoading: boolean) {
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {isLoading});
}

function validatePlaidSelection(values: FormOnyxValues<AccountFormValues>): FormInputErrors<AccountFormValues> {
    const errorFields: FormInputErrors<AccountFormValues> = {};

    if (!values.selectedPlaidAccountID) {
        errorFields.selectedPlaidAccountID = Localize.translateLocal('bankAccount.error.youNeedToSelectAnOption');
    }

    return errorFields;
}

export {
    acceptACHContractForBankAccount,
    addBusinessWebsiteForDraft,
    addPersonalBankAccount,
    clearOnfidoToken,
    clearPersonalBankAccount,
    clearPlaid,
    setPlaidEvent,
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
    openPersonalBankAccountSetupWithPlaid,
    updateAddPersonalBankAccountDraft,
    clearPersonalBankAccountSetupType,
    validatePlaidSelection,
    getCorpayBankAccountFields,
};

export type {BusinessAddress, PersonalAddress};
