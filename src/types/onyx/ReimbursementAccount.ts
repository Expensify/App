import type {ValueOf} from 'type-fest';
import type {FileObject} from '@components/AttachmentModal';
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

/** Model of Corpay data */
type Corpay = {
    /** Swift code */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SWIFT_CODE]?: string;
    /** Bank name */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.BANK_NAME]: string;
    /** Bank address - city */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.BANK_CITY]: string;
    /** Bank address - street and zip code */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.BANK_ADDRESS_LINE_1]: string;
    /** Company name */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.COMPANY_NAME]: string;
    /** Company address - street */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.COMPANY_STREET]: string;
    /** Company address - city */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.COMPANY_CITY]?: string;
    /** Company address - state (US and CA only) */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.COMPANY_STATE]: string;
    /** Company address - zip code */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.COMPANY_POSTAL_CODE]: string;
    /** Company address - zip code */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.COMPANY_COUNTRY_CODE]: Country | '';
    /** Company phone number */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.BUSINESS_CONTACT_NUMBER]: string;
    /** Company email address */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.BUSINESS_CONFIRMATION_EMAIL]: string;
    /** Company country */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.FORMATION_INCORPORATION_COUNTRY_CODE]: string;
    /** Company state (US and CA only) */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.FORMATION_INCORPORATION_STATE]: string;
    /** Company registration number */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.BUSINESS_REGISTRATION_INCORPORATION_NUMBER]: string;
    /** Company country code */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.COUNTRY_CODE]: string;
    /** Company tax ID number */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.TAX_ID_EIN_NUMBER]: string;
    /** Incorporation type */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.APPLICANT_TYPE_ID]: string;
    /** Nature of business */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.BUSINESS_CATEGORY]: string;
    /**  */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.PURPOSE_OF_TRANSACTION_ID]: string;
    /** Currency */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.CURRENCY_NEEDED]: string;
    /**  */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.TRADE_VOLUME]: string;
    /** Annual volume */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.ANNUAL_VOLUME]: string;
    /**  */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.FUND_DESTINATION_COUNTRIES]: string;
    /**  */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.FUND_SOURCE_COUNTRIES]: string;
    /** Director full name */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.COMPANY_DIRECTORS_FULL_NAME]: string;
    /** Director job title */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.COMPANY_DIRECTORS_JOB_TITLE]: string;
    /** Director occupation */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.COMPANY_DIRECTORS_OCCUPATION]: string;
    /** Is user also an owner */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.OWNS_MORE_THAN_25_PERCENT]: boolean;
    /** Are the more owners */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.ANY_INDIVIDUAL_OWN_25_PERCENT_OR_MORE]: boolean;
    /** Stringified array of owners data */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.BENEFICIAL_OWNERS]?: string;
    /** Signer full name */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SIGNER_FULL_NAME]: string;
    /** Signer DOB */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SIGNER_DATE_OF_BIRTH]: string;
    /** Signer job title */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SIGNER_JOB_TITLE]: string;
    /** Signer email address */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SIGNER_EMAIL]: string;
    /** Signer full address */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SIGNER_COMPLETE_RESIDENTIAL_ADDRESS]: string;
    /** Second signer full name */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SECOND_SIGNER_FULL_NAME]?: string;
    /** Second signer DOB */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SECOND_SIGNER_DATE_OF_BIRTH]?: string;
    /** Second signer job title */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SECOND_SIGNER_JOB_TITLE]?: string;
    /** Second signer email address */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SECOND_SIGNER_EMAIL]?: string;
    /** Second signer full address */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SECOND_SIGNER_COMPLETE_RESIDENTIAL_ADDRESS]: string;
    /** URL to uploaded proof of signer being a director */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SIGNER_PROOF_OF_DIRECTOR]: FileObject[];
    /** URL to uploaded copy of signer ID */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SIGNER_COPY_OF_ID]: FileObject[];
    /** URL to uploaded proof of signer address */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SIGNER_ADDRESS_PROOF]: FileObject[];
    /** Signer tax ID */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SIGNER_TAX_ID]: string;
    /** Signer PDS and FSG */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SIGNER_PDS_AND_FSG]: string;
    /** URL to uploaded proof of second signer being a director */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SECOND_SIGNER_PROOF_OF_DIRECTOR]?: FileObject[];
    /** URL to uploaded copy of second signer ID */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SECOND_SIGNER_COPY_OF_ID]?: FileObject[];
    /** URL to uploaded proof of second signer address */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SECOND_SIGNER_ADDRESS_PROOF]?: FileObject[];
    /** Second signer tax ID */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SECOND_SIGNER_TAX_ID]?: string;
    /** Second signer PDS and FSG */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SECOND_SIGNER_PDS_AND_FSG]?: string;
    /** Checkbox - provided truthful information */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.PROVIDE_TRUTHFUL_INFORMATION]: boolean;
    /** Checkbox - agrees to terms and conditions */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.AGREE_TO_TERMS_AND_CONDITIONS]: boolean;
    /** Checkbox - consents to privacy notice */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.CONSENT_TO_PRIVACY_NOTICE]: boolean;
    /** Checkbox - authorized to bind to client to agreement */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.AUTHORIZED_TO_BIND_CLIENT_TO_AGREEMENT]: boolean;
    /** Bank statement */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.BANK_STATEMENT]: FileObject[];

    /** Is user also an owner */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.OWNS_MORE_THAN_25_PERCENT]: boolean;

    /** Are the more owners */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.ANY_INDIVIDUAL_OWN_25_PERCENT_OR_MORE]: boolean;

    /** Stringified array of owners data */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.BENEFICIAL_OWNERS]?: string;
};

/** Model of Additional data */
type AdditionalData = {
    /** Account holder name */
    [INPUT_IDS.ADDITIONAL_DATA.ACCOUNT_HOLDER_NAME]: string;
    /** Account holder address - street */
    [INPUT_IDS.ADDITIONAL_DATA.ADDRESS_STREET]: string;
    /** Account holder address - city */
    [INPUT_IDS.ADDITIONAL_DATA.ADDRESS_CITY]: string;
    /** Account holder address - state (US and CA only) */
    [INPUT_IDS.ADDITIONAL_DATA.ADDRESS_STATE]?: string;
    /** Account holder address - zip code */
    [INPUT_IDS.ADDITIONAL_DATA.ADDRESS_ZIP_CODE]: string;
    /** Account holder address - country */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.ACCOUNT_HOLDER_COUNTRY]: string;
    /** Country user selects in first step */
    [INPUT_IDS.ADDITIONAL_DATA.COUNTRY]: Country | '';
    /** Corpay fields */
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

    /** Whether we create corpay bank account */
    isCreateCorpayBankAccount?: boolean;

    /** Whether we are saving the company data via the API */
    isSavingCorpayOnboardingCompanyFields?: boolean;

    /** Where the request is successful */
    isSuccess?: boolean;

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
