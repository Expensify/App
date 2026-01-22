import type {OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import type {OnfidoDataWithApplicantID} from '@components/Onfido/types';
import * as API from '@libs/API';
import type {
    AddPersonalBankAccountParams,
    BankAccountHandlePlaidErrorParams,
    ConnectBankAccountParams,
    DeletePaymentBankAccountParams,
    EnableGlobalReimbursementsForUSDBankAccountParams,
    FinishCorpayBankAccountOnboardingParams,
    OpenReimbursementAccountPageParams,
    SaveCorpayOnboardingBeneficialOwnerParams,
    SendReminderForCorpaySignerInformationParams,
    ShareBankAccountParams,
    UnshareBankAccountParams,
    ValidateBankAccountWithTransactionsParams,
    VerifyIdentityForBankAccountParams,
} from '@libs/API/parameters';
import type AskForCorpaySignerInformationParams from '@libs/API/parameters/AskForCorpaySignerInformationParams';
import type {SaveCorpayOnboardingCompanyDetails} from '@libs/API/parameters/SaveCorpayOnboardingCompanyDetailsParams';
import type SaveCorpayOnboardingDirectorInformationParams from '@libs/API/parameters/SaveCorpayOnboardingDirectorInformationParams';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as NetworkStore from '@libs/Network/NetworkStore';
import type {MemberForList} from '@libs/OptionsListUtils';
import {getFormattedStreet} from '@libs/PersonalDetailsUtils';
import CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {InternationalBankAccountForm, PersonalBankAccountForm} from '@src/types/form';
import type {ACHContractStepProps, BeneficialOwnersStepProps, CompanyStepProps, ReimbursementAccountForm, RequestorStepProps} from '@src/types/form/ReimbursementAccountForm';
import type {BankAccountList, LastPaymentMethod, LastPaymentMethodType, PersonalBankAccount} from '@src/types/onyx';
import type PlaidBankAccount from '@src/types/onyx/PlaidBankAccount';
import type {BankAccountStep, ReimbursementAccountStep, ReimbursementAccountSubStep} from '@src/types/onyx/ReimbursementAccount';
import type {OnyxData} from '@src/types/onyx/Request';
import {setBankAccountSubStep} from './ReimbursementAccount';

export {
    goToWithdrawalAccountSetupStep,
    setBankAccountFormValidationErrors,
    resetReimbursementAccount,
    resetUSDBankAccount,
    resetNonUSDBankAccount,
    hideBankAccountErrors,
    setBankAccountSubStep,
    updateReimbursementAccountDraft,
    requestResetBankAccount,
    cancelResetBankAccount,
} from './ReimbursementAccount';
export {openPlaidBankAccountSelector, openPlaidBankLogin} from './Plaid';
export {openOnfidoFlow, answerQuestionsForWallet, verifyIdentity, acceptWalletTerms} from './Wallet';

let bankAccountList: OnyxEntry<BankAccountList>;

Onyx.connectWithoutView({
    key: ONYXKEYS.BANK_ACCOUNT_LIST,
    callback: (value) => (bankAccountList = value),
});

type AccountFormValues = typeof ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM | typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM;

type OpenPersonalBankAccountSetupViewProps = {
    /** The reportID of the report to redirect to once the flow is finished */
    exitReportID?: string;

    /** The policyID of the policy to set the bank account on */
    policyID?: string;

    /** The source of the bank account */
    source?: string;

    /** Whether to set up a US bank account */
    shouldSetUpUSBankAccount?: boolean;

    /** Whether the user is validated */
    isUserValidated?: boolean;
};

function clearPlaid(): Promise<void | void[]> {
    Onyx.set(ONYXKEYS.PLAID_LINK_TOKEN, '');
    Onyx.set(ONYXKEYS.PLAID_CURRENT_EVENT, null);
    return Onyx.set(ONYXKEYS.PLAID_DATA, CONST.PLAID.DEFAULT_DATA);
}

function clearInternationalBankAccount() {
    return clearPlaid()
        .then(() => Onyx.set(ONYXKEYS.CORPAY_FIELDS, null))
        .then(() => Onyx.set(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM_DRAFT, null));
}

function openPlaidView() {
    clearPlaid().then(() => setBankAccountSubStep(CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID));
}

function setPlaidEvent(eventName: string | null) {
    Onyx.set(ONYXKEYS.PLAID_CURRENT_EVENT, eventName);
}

/**
 * Open the personal bank account setup flow, with an optional exitReportID to redirect to once the flow is finished.
 */
function openPersonalBankAccountSetupView({exitReportID, policyID, source, shouldSetUpUSBankAccount = false, isUserValidated = true}: OpenPersonalBankAccountSetupViewProps) {
    clearInternationalBankAccount().then(() => {
        if (exitReportID) {
            Onyx.merge(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {exitReportID});
        }
        if (policyID) {
            Onyx.merge(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {policyID});
        }
        if (source) {
            Onyx.merge(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {source});
        }
        if (!isUserValidated) {
            Navigation.navigate(ROUTES.SETTINGS_ADD_BANK_ACCOUNT_VERIFY_ACCOUNT.getRoute({backTo: Navigation.getActiveRoute()}));
            return;
        }
        if (shouldSetUpUSBankAccount) {
            Navigation.navigate(ROUTES.SETTINGS_ADD_US_BANK_ACCOUNT);
            return;
        }
        Navigation.navigate(ROUTES.SETTINGS_ADD_BANK_ACCOUNT.getRoute(Navigation.getActiveRoute()));
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

function clearPersonalBankAccountErrors() {
    Onyx.merge(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {errors: null});
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
function getVBBADataForOnyx(currentStep?: BankAccountStep, shouldShowLoading = true): OnyxData<typeof ONYXKEYS.REIMBURSEMENT_ACCOUNT | typeof ONYXKEYS.NVP_LAST_PAYMENT_METHOD> {
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
                    errors: getMicroSecondOnyxErrorWithTranslationKey('walletPage.addBankAccountFailure'),
                },
            },
        ],
    };
}

function addBusinessWebsiteForDraft(websiteUrl: string) {
    Onyx.merge(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, {website: websiteUrl});
}

/**
 * Get the Onyx data required to set the last used payment method to VBBA for a given policyID
 */
function getOnyxDataForConnectingVBBAAndLastPaymentMethod(
    policyID: string,
    lastPaymentMethod?: LastPaymentMethodType | string,
): OnyxData<typeof ONYXKEYS.REIMBURSEMENT_ACCOUNT | typeof ONYXKEYS.NVP_LAST_PAYMENT_METHOD> {
    const onyxData = getVBBADataForOnyx();
    const lastUsedPaymentMethod = typeof lastPaymentMethod === 'string' ? lastPaymentMethod : lastPaymentMethod?.expense?.name;

    if (!lastUsedPaymentMethod) {
        onyxData.successData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_LAST_PAYMENT_METHOD,
            value: {
                [policyID]: {
                    expense: {
                        name: CONST.IOU.PAYMENT_TYPE.VBBA,
                    },
                    lastUsed: {
                        name: CONST.IOU.PAYMENT_TYPE.VBBA,
                    },
                },
            },
        });
    }

    return onyxData;
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

    API.write(WRITE_COMMANDS.CONNECT_BANK_ACCOUNT_WITH_PLAID, parameters);
}

/**
 * Adds a bank account via Plaid
 *
 * TODO: offline pattern for this command will have to be added later once the pattern B design doc is complete
 */
function addPersonalBankAccount(
    account: Partial<PlaidBankAccount & PersonalBankAccountForm>,
    personalPolicyID: string | undefined,
    policyID?: string,
    source?: string,
    lastPaymentMethod?: LastPaymentMethodType | string | undefined,
) {
    const parameters: AddPersonalBankAccountParams = {
        addressName: account?.setupType === CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL ? `${account?.legalFirstName} ${account?.legalLastName}` : account.addressName,
        routingNumber: account?.routingNumber,
        accountNumber: account?.accountNumber,
        isSavings: account.isSavings ?? false,
        setupType: account?.setupType,
        bank: account?.bankName,
        plaidAccountID: account?.plaidAccountID,
        plaidAccessToken: account?.plaidAccessToken,
        phoneNumber: account?.phoneNumber,
        legalFirstName: account?.legalFirstName,
        legalLastName: account?.legalLastName,
        addressStreet: getFormattedStreet(account?.addressStreet, account?.addressStreet2),
        addressCity: account?.addressCity,
        addressState: account?.addressState,
        addressZip: account?.addressZipCode,
        addressCountry: account?.country,
    };
    if (policyID) {
        parameters.policyID = policyID;
    }
    if (source) {
        parameters.source = source;
    }

    const onyxData: OnyxData<typeof ONYXKEYS.PERSONAL_BANK_ACCOUNT | typeof ONYXKEYS.USER_WALLET | typeof ONYXKEYS.NVP_LAST_PAYMENT_METHOD> = {
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
                    errors: getMicroSecondOnyxErrorWithTranslationKey('walletPage.addBankAccountFailure'),
                },
            },
        ],
    };

    if (personalPolicyID && !lastPaymentMethod) {
        onyxData.optimisticData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_LAST_PAYMENT_METHOD,
            value: {
                [personalPolicyID]: {
                    iou: {
                        name: CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
                    },
                    lastUsed: {
                        name: CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
                    },
                },
            },
        });
        onyxData.successData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_LAST_PAYMENT_METHOD,
            value: {
                [personalPolicyID]: {
                    iou: {
                        name: CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
                    },
                    lastUsed: {
                        name: CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
                    },
                },
            },
        });
        onyxData.failureData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_LAST_PAYMENT_METHOD,
            value: {
                [personalPolicyID]: null,
            },
        });
    }

    API.write(WRITE_COMMANDS.ADD_PERSONAL_BANK_ACCOUNT, parameters, onyxData);
}

function deletePaymentBankAccount(bankAccountID: number, personalPolicyID: string | undefined, lastUsedPaymentMethods?: LastPaymentMethod, bankAccount?: OnyxEntry<PersonalBankAccount>) {
    const parameters: DeletePaymentBankAccountParams = {bankAccountID};

    const bankAccountFailureData = {
        ...bankAccount,
        errors: getMicroSecondOnyxErrorWithTranslationKey('bankAccount.error.deletePaymentBankAccount'),
        pendingAction: null,
    };

    const onyxData: OnyxData<typeof ONYXKEYS.BANK_ACCOUNT_LIST | typeof ONYXKEYS.NVP_LAST_PAYMENT_METHOD> = {
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

        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.BANK_ACCOUNT_LIST}`,
                value: {
                    [bankAccountID]: bankAccountFailureData,
                },
            },
        ],
    };

    for (const paymentMethodID of Object.keys(lastUsedPaymentMethods ?? {})) {
        const lastUsedPaymentMethod = lastUsedPaymentMethods?.[paymentMethodID] as LastPaymentMethodType;

        if (typeof lastUsedPaymentMethod === 'string' || !lastUsedPaymentMethod) {
            continue;
        }

        if (personalPolicyID === paymentMethodID && lastUsedPaymentMethod.iou?.name === CONST.IOU.PAYMENT_TYPE.EXPENSIFY) {
            const revertedLastUsedPaymentMethod = lastUsedPaymentMethod.lastUsed?.name !== CONST.IOU.PAYMENT_TYPE.EXPENSIFY ? lastUsedPaymentMethod.lastUsed?.name : null;

            onyxData.successData?.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.NVP_LAST_PAYMENT_METHOD,
                value: {
                    [personalPolicyID]: {
                        iou: {
                            name: revertedLastUsedPaymentMethod,
                            bankAccountID: null,
                        },
                        ...(!revertedLastUsedPaymentMethod ? {lastUsed: {name: null, bankAccountID: null}} : {}),
                    },
                },
            });

            onyxData.failureData?.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.NVP_LAST_PAYMENT_METHOD,
                value: {
                    [personalPolicyID]: {
                        expense: {
                            name: lastUsedPaymentMethod.iou?.name,
                            bankAccountID: lastUsedPaymentMethod.iou?.bankAccountID,
                        },
                        lastUsed: {
                            name: lastUsedPaymentMethod.lastUsed?.name,
                            bankAccountID: lastUsedPaymentMethod.lastUsed?.bankAccountID,
                        },
                    },
                },
            });
        }

        if (lastUsedPaymentMethod?.expense?.name === CONST.IOU.PAYMENT_TYPE.VBBA) {
            const revertedLastUsedPaymentMethod = lastUsedPaymentMethod.lastUsed.name !== CONST.IOU.PAYMENT_TYPE.VBBA ? lastUsedPaymentMethod.lastUsed.name : null;

            onyxData.successData?.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.NVP_LAST_PAYMENT_METHOD,
                value: {
                    [paymentMethodID]: {
                        expense: {
                            name: revertedLastUsedPaymentMethod,
                            bankAccountID: null,
                        },
                        ...(!revertedLastUsedPaymentMethod ? {lastUsed: {name: null, bankAccountID: null}} : {}),
                    },
                },
            });

            onyxData.failureData?.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.NVP_LAST_PAYMENT_METHOD,
                value: {
                    [paymentMethodID]: {
                        expense: {
                            name: lastUsedPaymentMethod.expense?.name,
                            bankAccountID: lastUsedPaymentMethod.expense?.bankAccountID,
                        },
                        lastUsed: {
                            name: lastUsedPaymentMethod.lastUsed?.name,
                            bankAccountID: lastUsedPaymentMethod.lastUsed?.bankAccountID,
                        },
                    },
                },
            });
        }
    }

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
function updatePersonalInformationForBankAccount(bankAccountID: number, params: RequestorStepProps, policyID: string | undefined, isConfirmPage: boolean) {
    if (!policyID) {
        return;
    }
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

    const onyxData: OnyxData<typeof ONYXKEYS.REIMBURSEMENT_ACCOUNT> = {
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
                    errors: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                },
            },
        ],
    };

    API.write(WRITE_COMMANDS.VALIDATE_BANK_ACCOUNT_WITH_TRANSACTIONS, parameters, onyxData);
}

function getCorpayBankAccountFields(country: string, currency: string) {
    const parameters = {
        countryISO: country,
        currency,
        isWithdrawal: true,
        isBusinessBankAccount: true,
    };

    const onyxData: OnyxData<typeof ONYXKEYS.CORPAY_FIELDS> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.CORPAY_FIELDS,
                value: {
                    isLoading: true,
                    isSuccess: false,
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.CORPAY_FIELDS,
                value: {
                    isLoading: false,
                    isSuccess: true,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.CORPAY_FIELDS,
                value: {
                    isLoading: false,
                    isSuccess: false,
                },
            },
        ],
    };

    return API.read(READ_COMMANDS.GET_CORPAY_BANK_ACCOUNT_FIELDS, parameters, onyxData);
}

function createCorpayBankAccount(fields: ReimbursementAccountForm, policyID: string | undefined) {
    const parameters = {
        type: 1,
        isSavings: false,
        isWithdrawal: true,
        inputs: JSON.stringify(fields),
        policyID,
    };

    const onyxData: OnyxData<typeof ONYXKEYS.REIMBURSEMENT_ACCOUNT> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {
                    isLoading: true,
                    isCreateCorpayBankAccount: true,
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {
                    isLoading: false,
                    isCreateCorpayBankAccount: false,
                    errors: null,
                    isSuccess: true,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {
                    isLoading: false,
                    isCreateCorpayBankAccount: false,
                    isSuccess: false,
                },
            },
        ],
    };

    return API.write(WRITE_COMMANDS.BANK_ACCOUNT_CREATE_CORPAY, parameters, onyxData);
}

function getCorpayOnboardingFields(country: Country | '') {
    return API.read(READ_COMMANDS.GET_CORPAY_ONBOARDING_FIELDS, {countryISO: country});
}

function saveCorpayOnboardingCompanyDetails(parameters: SaveCorpayOnboardingCompanyDetails, bankAccountID: number) {
    const formattedParams = {
        inputs: JSON.stringify(parameters),
        bankAccountID,
    };

    const onyxData: OnyxData<typeof ONYXKEYS.REIMBURSEMENT_ACCOUNT> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {
                    isSavingCorpayOnboardingCompanyFields: true,
                    errors: null,
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {
                    isSavingCorpayOnboardingCompanyFields: false,
                    isSuccess: true,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {
                    isSavingCorpayOnboardingCompanyFields: false,
                    isSuccess: false,
                    errors: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                },
            },
        ],
    };

    return API.write(WRITE_COMMANDS.SAVE_CORPAY_ONBOARDING_COMPANY_DETAILS, formattedParams, onyxData);
}

function saveCorpayOnboardingBeneficialOwners(parameters: SaveCorpayOnboardingBeneficialOwnerParams) {
    const onyxData: OnyxData<typeof ONYXKEYS.REIMBURSEMENT_ACCOUNT> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {
                    isSavingCorpayOnboardingBeneficialOwnersFields: true,
                    errors: null,
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {
                    isSavingCorpayOnboardingBeneficialOwnersFields: false,
                    isSuccess: true,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {
                    isSavingCorpayOnboardingBeneficialOwnersFields: false,
                    isSuccess: false,
                    errors: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                },
            },
        ],
    };

    return API.write(WRITE_COMMANDS.SAVE_CORPAY_ONBOARDING_BENEFICIAL_OWNER, parameters, onyxData);
}

function saveCorpayOnboardingDirectorInformation(parameters: SaveCorpayOnboardingDirectorInformationParams) {
    const onyxData: OnyxData<typeof ONYXKEYS.REIMBURSEMENT_ACCOUNT | typeof ONYXKEYS.FORMS.ENTER_SINGER_INFO_FORM> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {
                    isSavingCorpayOnboardingDirectorInformation: true,
                    errors: null,
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.FORMS.ENTER_SINGER_INFO_FORM,
                value: {
                    isSavingSignerInformation: true,
                    errors: null,
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {
                    isSavingCorpayOnboardingDirectorInformation: false,
                    isSuccess: true,
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.FORMS.ENTER_SINGER_INFO_FORM,
                value: {
                    isSavingSignerInformation: false,
                    isSuccess: true,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {
                    isSavingCorpayOnboardingDirectorInformation: false,
                    isSuccess: false,
                    errors: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.FORMS.ENTER_SINGER_INFO_FORM,
                value: {
                    isSavingSignerInformation: false,
                    isSuccess: false,
                    errors: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                },
            },
        ],
    };

    return API.write(WRITE_COMMANDS.SAVE_CORPAY_ONBOARDING_DIRECTOR_INFORMATION, parameters, onyxData);
}

function askForCorpaySignerInformation(parameters: AskForCorpaySignerInformationParams) {
    const onyxData: OnyxData<typeof ONYXKEYS.REIMBURSEMENT_ACCOUNT> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {
                    isAskingForCorpaySignerInformation: true,
                    errors: null,
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {
                    isAskingForCorpaySignerInformation: false,
                    isAskingForCorpaySignerInformationSuccess: true,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {
                    isAskingForCorpaySignerInformation: false,
                    isAskingForCorpaySignerInformationSuccess: false,
                    errors: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                },
            },
        ],
    };

    return API.write(WRITE_COMMANDS.ASK_FOR_CORPAY_SIGNER_INFORMATION, parameters, onyxData);
}

function clearReimbursementAccount() {
    Onyx.set(ONYXKEYS.REIMBURSEMENT_ACCOUNT, null);
}

function finishCorpayBankAccountOnboarding(parameters: FinishCorpayBankAccountOnboardingParams) {
    const onyxData: OnyxData<typeof ONYXKEYS.REIMBURSEMENT_ACCOUNT> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {
                    isFinishingCorpayBankAccountOnboarding: true,
                    errors: null,
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {
                    isFinishingCorpayBankAccountOnboarding: false,
                    isSuccess: true,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {
                    isFinishingCorpayBankAccountOnboarding: false,
                    isSuccess: false,
                    errors: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                },
            },
        ],
    };

    return API.write(WRITE_COMMANDS.FINISH_CORPAY_BANK_ACCOUNT_ONBOARDING, parameters, onyxData);
}

function sendReminderForCorpaySignerInformation(parameters: SendReminderForCorpaySignerInformationParams) {
    const onyxData: OnyxData<typeof ONYXKEYS.REIMBURSEMENT_ACCOUNT> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {
                    isSendingReminderForCorpaySignerInformation: true,
                    errors: null,
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {
                    isSendingReminderForCorpaySignerInformation: false,
                    isSuccess: true,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {
                    isSendingReminderForCorpaySignerInformation: false,
                    isSuccess: false,
                    errors: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                },
            },
        ],
    };

    return API.write(WRITE_COMMANDS.SEND_REMINDER_FOR_CORPAY_SINGER_INFORMATION, parameters, onyxData);
}

function enableGlobalReimbursementsForUSDBankAccount(parameters: EnableGlobalReimbursementsForUSDBankAccountParams) {
    const onyxData: OnyxData<typeof ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS,
                value: {
                    isEnablingGlobalReimbursements: true,
                    errors: null,
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS,
                value: {
                    isEnablingGlobalReimbursements: false,
                    isSuccess: true,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS,
                value: {
                    isEnablingGlobalReimbursements: false,
                    isSuccess: false,
                    errors: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                },
            },
        ],
    };

    return API.write(WRITE_COMMANDS.ENABLE_GLOBAL_REIMBURSEMENTS_FOR_USD_BANK_ACCOUNT, parameters, onyxData);
}

function clearEnableGlobalReimbursementsForUSDBankAccount() {
    Onyx.merge(ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS, {isSuccess: null, isEnablingGlobalReimbursements: null});
}

function clearCorpayBankAccountFields() {
    Onyx.set(ONYXKEYS.CORPAY_FIELDS, null);
}

function clearReimbursementAccountBankCreation() {
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {isCreateCorpayBankAccount: null, isSuccess: null, isLoading: null});
}

function clearReimbursementAccountSaveCorpayOnboardingCompanyDetails() {
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {isSuccess: null, isSavingCorpayOnboardingCompanyFields: null});
}

function clearReimbursementAccountSaveCorpayOnboardingBeneficialOwners() {
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {isSuccess: null, isSavingCorpayOnboardingBeneficialOwnersFields: null});
}

function clearReimbursementAccountSaveCorpayOnboardingDirectorInformation() {
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {isSuccess: null, isSavingCorpayOnboardingDirectorInformation: null});
}

function clearReimbursementAccountFinishCorpayBankAccountOnboarding() {
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {isSuccess: null, isFinishingCorpayBankAccountOnboarding: null});
}

function clearEnterSignerInformationFormSave() {
    Onyx.merge(ONYXKEYS.FORMS.ENTER_SINGER_INFO_FORM, {isSuccess: null, isSavingSignerInformation: null});
}

function clearReimbursementAccountSendReminderForCorpaySignerInformation() {
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {isSuccess: null, isSendingReminderForCorpaySignerInformation: null});
}

/**
 * Function to display and fetch data for Reimbursement Account step
 * @param stepToOpen - current step to open
 * @param subStep - particular step
 * @param localCurrentStep - last step on device
 * @param policyID - policy ID
 */
function openReimbursementAccountPage(stepToOpen: ReimbursementAccountStep, subStep: ReimbursementAccountSubStep, localCurrentStep: ReimbursementAccountStep, policyID: string) {
    const onyxData: OnyxData<typeof ONYXKEYS.REIMBURSEMENT_ACCOUNT> = {
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
function updateCompanyInformationForBankAccount(bankAccountID: number, params: Partial<CompanyStepProps>, policyID: string | undefined, isConfirmPage: boolean) {
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
function updateBeneficialOwnersForBankAccount(bankAccountID: number, params: Partial<BeneficialOwnersStepProps>, policyID: string | undefined) {
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
 * @param bankAccountID - ID for bank account
 * @param policyID - ID of the policy we're setting the bank account on
 * @param lastPaymentMethod - last payment method used in the app
 */
function acceptACHContractForBankAccount(bankAccountID: number, params: ACHContractStepProps, policyID: string, lastPaymentMethod?: LastPaymentMethodType | string) {
    const onyxData = getOnyxDataForConnectingVBBAAndLastPaymentMethod(policyID, lastPaymentMethod);

    API.write(
        WRITE_COMMANDS.ACCEPT_ACH_CONTRACT_FOR_BANK_ACCOUNT,
        {
            ...params,
            bankAccountID,
            policyID,
        },
        onyxData,
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

    API.write(WRITE_COMMANDS.CONNECT_BANK_ACCOUNT_MANUALLY, parameters);
}

/**
 * Verify the user's identity via Onfido
 */
function verifyIdentityForBankAccount(bankAccountID: number, onfidoData: OnfidoDataWithApplicantID, policyID: string) {
    const parameters: VerifyIdentityForBankAccountParams = {
        bankAccountID,
        onfidoData: JSON.stringify(onfidoData),
        policyID,
    };

    API.write(WRITE_COMMANDS.VERIFY_IDENTITY_FOR_BANK_ACCOUNT, parameters, getVBBADataForOnyx());
}

function openWorkspaceView(policyID: string | undefined) {
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

function validatePlaidSelection(values: FormOnyxValues<AccountFormValues>, translate: LocalizedTranslate): FormInputErrors<AccountFormValues> {
    const errorFields: FormInputErrors<AccountFormValues> = {};

    if (!values.selectedPlaidAccountID) {
        errorFields.selectedPlaidAccountID = translate('bankAccount.error.youNeedToSelectAnOption');
    }

    return errorFields;
}

function fetchCorpayFields(bankCountry: string, bankCurrency?: string, isWithdrawal?: boolean, isBusinessBankAccount?: boolean) {
    API.write(
        WRITE_COMMANDS.GET_CORPAY_BANK_ACCOUNT_FIELDS,
        {countryISO: bankCountry, currency: bankCurrency, isWithdrawal, isBusinessBankAccount},
        {
            optimisticData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.PERSONAL_BANK_ACCOUNT,
                    value: {
                        isLoading: true,
                    },
                },
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM_DRAFT,
                    value: {
                        bankCountry,
                        bankCurrency: bankCurrency ?? null,
                    },
                },
            ],
            finallyData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.PERSONAL_BANK_ACCOUNT,
                    value: {
                        isLoading: false,
                    },
                },
            ],
        },
    );
}

function clearUnshareBankAccountErrors(bankAccountID: number) {
    Onyx.merge(ONYXKEYS.UNSHARE_BANK_ACCOUNT, {errors: null});
    Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, {[bankAccountID]: {errors: null}});
}

function unshareBankAccount(bankAccountID: number, ownerEmail: string) {
    const parameters: UnshareBankAccountParams = {
        bankAccountID,
        ownerEmail,
    };

    const onyxData: OnyxData<typeof ONYXKEYS.UNSHARE_BANK_ACCOUNT> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.UNSHARE_BANK_ACCOUNT,
                value: {
                    isLoading: true,
                    errors: null,
                    email: ownerEmail,
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.UNSHARE_BANK_ACCOUNT,
                value: {
                    isLoading: false,
                    errors: null,
                    shouldShowSuccess: true,
                    email: null,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.UNSHARE_BANK_ACCOUNT,
                value: {
                    isLoading: false,
                    errors: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                },
            },
        ],
    };

    API.write(WRITE_COMMANDS.UNSHARE_BANK_ACCOUNT, parameters, onyxData);
}

function createCorpayBankAccountForWalletFlow(data: InternationalBankAccountForm, classification: string, destinationCountry: string, preferredMethod: string) {
    const inputData = {
        ...data,
        classification,
        destinationCountry,
        preferredMethod,
        setupType: 'manual',
        fieldsType: 'international',
        country: data.bankCountry,
        currency: data.bankCurrency,
    };

    const parameters = {
        isWithdrawal: false,
        isSavings: true,
        inputs: JSON.stringify(inputData),
    };

    const onyxData: OnyxData<typeof ONYXKEYS.REIMBURSEMENT_ACCOUNT> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {
                    isLoading: true,
                    isCreateCorpayBankAccount: true,
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {
                    isLoading: false,
                    isCreateCorpayBankAccount: false,
                    errors: null,
                    isSuccess: true,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {
                    isLoading: false,
                    isCreateCorpayBankAccount: false,
                    isSuccess: false,
                    errors: getMicroSecondOnyxErrorWithTranslationKey('walletPage.addBankAccountFailure'),
                },
            },
        ],
    };

    return API.write(WRITE_COMMANDS.BANK_ACCOUNT_CREATE_CORPAY, parameters, onyxData);
}

function clearShareBankAccount() {
    Onyx.set(ONYXKEYS.SHARE_BANK_ACCOUNT, null);
}

function clearShareBankAccountErrors() {
    Onyx.merge(ONYXKEYS.SHARE_BANK_ACCOUNT, {errors: null});
}

function setShareBankAccountAdmins(admins?: MemberForList[]) {
    Onyx.merge(ONYXKEYS.SHARE_BANK_ACCOUNT, {admins});
}

function shareBankAccount(bankAccountID: number, emailList: string[]) {
    const parameters: ShareBankAccountParams = {
        bankAccountID,
        emailList,
    };

    const onyxData: OnyxData<typeof ONYXKEYS.SHARE_BANK_ACCOUNT> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.SHARE_BANK_ACCOUNT,
                value: {
                    isLoading: true,
                    errors: null,
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.SHARE_BANK_ACCOUNT,
                value: {
                    isLoading: false,
                    errors: null,
                    admins: null,
                    shouldShowSuccess: true,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.SHARE_BANK_ACCOUNT,
                value: {
                    isLoading: false,
                    errors: getMicroSecondOnyxErrorWithTranslationKey('walletPage.shareBankAccountFailure'),
                },
            },
        ],
    };

    API.write(WRITE_COMMANDS.SHARE_BANK_ACCOUNT, parameters, onyxData);
}

/**
 * Get bank account from bankAccountID
 */
function getBankAccountFromID(bankAccountID: number | undefined) {
    if (!bankAccountID) {
        return undefined;
    }
    return bankAccountList?.[bankAccountID];
}

function openBankAccountSharePage() {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.IS_LOADING_SHARE_BANK_ACCOUNTS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.IS_LOADING_SHARE_BANK_ACCOUNTS,
            value: true,
        },
    ];
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.IS_LOADING_SHARE_BANK_ACCOUNTS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.IS_LOADING_SHARE_BANK_ACCOUNTS,
            value: false,
        },
    ];
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.IS_LOADING_SHARE_BANK_ACCOUNTS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.IS_LOADING_SHARE_BANK_ACCOUNTS,
            value: false,
        },
    ];

    return API.read(READ_COMMANDS.OPEN_BANK_ACCOUNT_SHARE_PAGE, null, {
        optimisticData,
        successData,
        failureData,
    });
}

function initiateBankAccountUnlock(bankAccountID: number) {
    const authToken = NetworkStore.getAuthToken();

    const onyxData: OnyxData<typeof ONYXKEYS.INITIATING_BANK_ACCOUNT_UNLOCK> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.INITIATING_BANK_ACCOUNT_UNLOCK,
                value: {
                    isLoading: true,
                    isSuccess: false,
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.INITIATING_BANK_ACCOUNT_UNLOCK,
                value: {
                    errors: null,
                    isLoading: false,
                    isSuccess: true,
                    bankAccountIDToUnlock: null,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.INITIATING_BANK_ACCOUNT_UNLOCK,
                value: {
                    isLoading: false,
                    isSuccess: false,
                    errors: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                },
            },
        ],
    };

    return API.write(WRITE_COMMANDS.INITIATE_BANK_ACCOUNT_UNLOCK, {bankAccountID, authToken}, onyxData);
}

function pressedOnLockedBankAccount(bankAccountID: number) {
    Onyx.merge(ONYXKEYS.INITIATING_BANK_ACCOUNT_UNLOCK, {bankAccountIDToUnlock: bankAccountID});
}

function clearInitiatingBankAccountUnlock() {
    Onyx.merge(ONYXKEYS.INITIATING_BANK_ACCOUNT_UNLOCK, {bankAccountIDToUnlock: null, isSuccess: null, errors: null});
}

export {
    acceptACHContractForBankAccount,
    addBusinessWebsiteForDraft,
    addPersonalBankAccount,
    clearOnfidoToken,
    clearPersonalBankAccount,
    setPlaidEvent,
    openPlaidView,
    connectBankAccountManually,
    connectBankAccountWithPlaid,
    createCorpayBankAccount,
    deletePaymentBankAccount,
    handlePlaidError,
    setPersonalBankAccountContinueKYCOnSuccess,
    openPersonalBankAccountSetupView,
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
    fetchCorpayFields,
    shareBankAccount,
    setShareBankAccountAdmins,
    clearShareBankAccount,
    clearReimbursementAccountBankCreation,
    getCorpayBankAccountFields,
    createCorpayBankAccountForWalletFlow,
    getCorpayOnboardingFields,
    saveCorpayOnboardingCompanyDetails,
    unshareBankAccount,
    clearUnshareBankAccountErrors,
    clearReimbursementAccountSaveCorpayOnboardingCompanyDetails,
    saveCorpayOnboardingBeneficialOwners,
    saveCorpayOnboardingDirectorInformation,
    clearReimbursementAccountSaveCorpayOnboardingBeneficialOwners,
    clearReimbursementAccountSaveCorpayOnboardingDirectorInformation,
    clearCorpayBankAccountFields,
    finishCorpayBankAccountOnboarding,
    clearReimbursementAccountFinishCorpayBankAccountOnboarding,
    enableGlobalReimbursementsForUSDBankAccount,
    clearEnableGlobalReimbursementsForUSDBankAccount,
    askForCorpaySignerInformation,
    clearReimbursementAccount,
    clearEnterSignerInformationFormSave,
    sendReminderForCorpaySignerInformation,
    clearPersonalBankAccountErrors,
    clearReimbursementAccountSendReminderForCorpaySignerInformation,
    getBankAccountFromID,
    openBankAccountSharePage,
    clearShareBankAccountErrors,
    initiateBankAccountUnlock,
    pressedOnLockedBankAccount,
    clearInitiatingBankAccountUnlock,
};
