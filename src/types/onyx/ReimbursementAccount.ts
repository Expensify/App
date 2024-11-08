import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import type {ACHContractStepProps, BeneficialOwnersStepProps, CompanyStepProps, ReimbursementAccountProps, RequestorStepProps} from '@src/types/form/ReimbursementAccountForm';
import type INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import type {BankName} from './Bank';
import type * as OnyxCommon from './OnyxCommon';

/** Steps to setup a reimbursement bank account */
type BankAccountStep = ValueOf<typeof CONST.BANK_ACCOUNT.STEP>;

/** Substeps to setup a reimbursement bank account */
type BankAccountSubStep = ValueOf<typeof CONST.BANK_ACCOUNT.SUBSTEP>;

/** Modal of Corpay data */
type Corpay = {
    /** Company name */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.COMPANY_NAME]: string;

    /** Company street */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.COMPANY_STREET]: string;

    /** Company city */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.COMPANY_CITY]: string;

    /** Company state */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.COMPANY_STATE]: string;

    /** Company zip code */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.COMPANY_ZIP_CODE]: string;

    /** Company country */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.COMPANY_COUNTRY]: Country | '';

    /** Company contact number */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.BUSINESS_CONTACT_NUMBER]: string;

    /** Company email */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.BUSINESS_CONFIRMATION_EMAIL]: string;

    /** Company registration number */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.BUSINESS_REGISTRATION_INCORPORATION_NUMBER]: string;

    /** Company incorporation country */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.FORMATION_INCORPORATION_COUNTRY_CODE]: string;

    /** Company incorporation state */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.FORMATION_INCORPORATION_STATE]: string;

    /** Company business category */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.BUSINESS_CATEGORY]: string;

    /** Company applicant type ID */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.APPLICANT_TYPE_ID]: string;

    /** Company annual volume */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.ANNUAL_VOLUME]: string;
};

/** Additional data where details of the non-USD reimbursements account are stored */
type AdditionalData = {
    /** Country of the reimbursement account */
    [INPUT_IDS.ADDITIONAL_DATA.COUNTRY]: Country | '';

    /** Details required by Corpay */
    corpay: Corpay;
};

/** Model of ACH data */
type ACHData = Partial<BeneficialOwnersStepProps & CompanyStepProps & RequestorStepProps & ACHContractStepProps & ReimbursementAccountProps> & {
    /** Step of the setup flow that we are on. Determines which view is presented. */
    currentStep?: BankAccountStep;

    /** Optional subStep we would like the user to start back on */
    subStep?: BankAccountSubStep;

    /** Bank account state */
    state?: string;

    /** Bank account ID of the VBA that we are validating is required */
    bankAccountID?: number;

    /** Bank account routing number */
    routingNumber?: string;

    /** Bank account number */
    accountNumber?: string;

    /** Bank account name */
    bankName?: BankName;

    /** Bank account owner name */
    addressName?: string;

    /** Policy ID of the workspace the bank account is being set up on */
    policyID?: string;

    /** Weather Onfido setup is complete */
    isOnfidoSetupComplete?: boolean;

    /** Last 4 digits of the account number */
    mask?: string;

    /** Unique identifier for this account in Plaid */
    plaidAccountID?: string;

    /** Bank Account setup type (plaid or manual) */
    setupType?: string;

    /** Additional data for the non USD account in setup */
    additionalData?: AdditionalData;
};

/** The step in an reimbursement account's ach data */
type ReimbursementAccountStep = BankAccountStep | '';

/** The sub step in an reimbursement account's ach data */
type ReimbursementAccountSubStep = BankAccountSubStep | '';

/** The ACHData for an reimbursement account */
type ACHDataReimbursementAccount = Omit<ACHData, 'subStep' | 'currentStep'> & {
    /** Step of the setup flow that we are on. Determines which view is presented. */
    currentStep?: ReimbursementAccountStep;

    /** Optional subStep we would like the user to start back on */
    subStep?: ReimbursementAccountSubStep;
};

/** Model of reimbursement account data */
type ReimbursementAccount = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** Whether we are loading the data via the API */
    isLoading?: boolean;

    /** A date that indicates the user has been throttled */
    throttledDate?: string;

    /** Additional data for the account in setup */
    achData?: ACHDataReimbursementAccount;

    /** Disable validation button if max attempts exceeded */
    maxAttemptsReached?: boolean;

    /** Alert message to display above submit button */
    error?: string;

    /** Which field needs attention? */
    errorFields?: OnyxCommon.ErrorFields;

    /** Any additional error message to show */
    errors?: OnyxCommon.Errors;

    /** Draft step of the setup flow from Onyx */
    draftStep?: BankAccountStep;

    /** Should display modal to reset data */
    shouldShowResetModal?: boolean;
}>;

export default ReimbursementAccount;
export type {BankAccountStep, BankAccountSubStep, ACHData, ReimbursementAccountStep, ReimbursementAccountSubStep, ACHDataReimbursementAccount};
