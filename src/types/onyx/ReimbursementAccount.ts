import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import type {ACHContractStepProps, BeneficialOwnersStepProps, CompanyStepProps, ReimbursementAccountProps, RequestorStepProps} from '@src/types/form/ReimbursementAccountForm';
import type INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import type {FileObject} from '@src/types/utils/Attachment';
import type {BankName} from './Bank';
import type * as OnyxCommon from './OnyxCommon';

/** Steps to setup a reimbursement bank account */
type BankAccountStep = ValueOf<typeof CONST.BANK_ACCOUNT.STEP>;

/** Substeps to setup a reimbursement bank account */
type BankAccountSubStep = ValueOf<typeof CONST.BANK_ACCOUNT.SUBSTEP>;

/** Model of Corpay data */
type Corpay = {
    /** Account holder address - country */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.ACCOUNT_HOLDER_COUNTRY]: Country | '';
    /** Swift code */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SWIFT_BIC_CODE]: string;
    /** Bank name */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.BANK_NAME]: string;
    /** Bank address - city */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.BANK_CITY]: string;
    /** Bank address - street and zip code */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.BANK_ADDRESS_LINE_1]: string;
    /** Bank region */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.BANK_REGION]: string;
    /** Bank postal code */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.BANK_POSTAL]: string;
    /** Bank country */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.BANK_COUNTRY]: string;
    /** Bank currency */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.BANK_CURRENCY]: string;
    /** Company name */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.COMPANY_NAME]: string;
    /** Company website */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.COMPANY_WEBSITE]: string;
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
    /** Business type */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.BUSINESS_TYPE_ID]: string;
    /** Purpose of transaction ID */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.PURPOSE_OF_TRANSACTION_ID]: string;
    /** Currency */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.CURRENCY_NEEDED]: string;
    /** Trade volume */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.TRADE_VOLUME]: string;
    /** Annual volume */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.ANNUAL_VOLUME]: string;
    /** Fund destination countries */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.FUND_DESTINATION_COUNTRIES]: string;
    /** Fund source countries */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.FUND_SOURCE_COUNTRIES]: string;
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
    /** Second signer email address */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SECOND_SIGNER_EMAIL]: string;
    /** Second signer full name */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SECOND_SIGNER_FULL_NAME]?: string;
    /** Second signer DOB */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SECOND_SIGNER_DATE_OF_BIRTH]?: string;
    /** Second signer job title */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SECOND_SIGNER_JOB_TITLE]?: string;
    /** Second signer full address */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SECOND_SIGNER_COMPLETE_RESIDENTIAL_ADDRESS]: string;
    /** Checkbox - provided truthful information */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.PROVIDE_TRUTHFUL_INFORMATION]: boolean;
    /** Checkbox - agrees to terms and conditions */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.AGREE_TO_TERMS_AND_CONDITIONS]: boolean;
    /** Checkbox - consents to privacy notice */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.CONSENT_TO_PRIVACY_NOTICE]: boolean;
    /** Checkbox - authorized to bind to client to agreement */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.AUTHORIZED_TO_BIND_CLIENT_TO_AGREEMENT]: boolean;
    /** Is user also an owner */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.OWNS_MORE_THAN_25_PERCENT]: boolean;
    /** Are the more owners */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.ANY_INDIVIDUAL_OWN_25_PERCENT_OR_MORE]: boolean;
    /** Stringified array of owners data */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.BENEFICIAL_OWNERS]?: string;
    /** Indicates that the PDS and FSD document has been downloaded */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.DOWNLOADED_PDS_AND_FSG]?: boolean;
    /** Powerform required for US and CA workspaces */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.ACH_AUTHORIZATION_FORM]?: FileObject[];
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

    /** Account holder name - Corpay name */
    [INPUT_IDS.ADDITIONAL_DATA.ACCOUNT_HOLDER_NAME]?: string;
    /** Account holder name - BE name */
    [INPUT_IDS.ADDITIONAL_DATA.ADDRESS_NAME]?: string;

    /** Account holder street - Corpay name */
    [INPUT_IDS.ADDITIONAL_DATA.ACCOUNT_HOLDER_ADDRESS_1]?: string;
    /** Account holder street - BE name */
    [INPUT_IDS.ADDITIONAL_DATA.ADDRESS_STREET]?: string;

    /** Account holder city - Corpay name */
    [INPUT_IDS.ADDITIONAL_DATA.ACCOUNT_HOLDER_CITY]?: string;
    /** Account holder city - BE name */
    [INPUT_IDS.ADDITIONAL_DATA.ADDRESS_CITY]?: string;

    /** Account holder state (US and CA only) - Corpay name */
    [INPUT_IDS.ADDITIONAL_DATA.ACCOUNT_HOLDER_REGION]?: string;
    /** Account holder state (US and CA only) - BE name */
    [INPUT_IDS.ADDITIONAL_DATA.ADDRESS_STATE]?: string;

    /** Account holder zip code - Corpay name */
    [INPUT_IDS.ADDITIONAL_DATA.ACCOUNT_HOLDER_POSTAL]?: string;
    /** Account holder zip code - BE name */
    [INPUT_IDS.ADDITIONAL_DATA.ADDRESS_ZIP_CODE]?: string;

    /** Country user selects in first step */
    [INPUT_IDS.ADDITIONAL_DATA.COUNTRY]: Country | '';

    /** Corpay fields */
    corpay: Corpay;

    /** Date the corpay bank account was created */
    created?: string;

    /** Currency of the bank account */
    currency?: string;
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

    /** The reportActionID of the ACH request message in the Concierge chat.
     *  That message asks the user to provide additional information to validate the bank account.
     *  The ID is used to link to this exact message when the user clicks the link in the bank account flow to finish in chat
     * */
    ACHRequestReportActionID: string;
};

/** Model of reimbursement account data */
type ReimbursementAccount = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** Whether we are loading the data via the API */
    isLoading?: boolean;

    /** Whether we create corpay bank account (non USD flow Step 2) */
    isCreateCorpayBankAccount?: boolean;

    /** Whether we are saving the company data via the API (non USD flow Step 3) */
    isSavingCorpayOnboardingCompanyFields?: boolean;

    /** Whether we are saving the beneficial owners data via the API (non USD flow Step 4) */
    isSavingCorpayOnboardingBeneficialOwnersFields?: boolean;

    /** Whether we are saving the signer info data via the API */
    isSavingCorpayOnboardingDirectorInformation?: boolean;

    /** Whether we are asking for corpay signer information via the API */
    isAskingForCorpaySignerInformation?: boolean;

    /** Whether asking for corpay signer information request is successful */
    isAskingForCorpaySignerInformationSuccess?: boolean;

    /** Whether we are saving agreements accepted by user via the API (non USD flow Step 6) */
    isFinishingCorpayBankAccountOnboarding?: boolean;

    /** Whether we are sending a reminder about filling signer information via the API */
    isSendingReminderForCorpaySignerInformation?: boolean;

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
export type {Corpay, BankAccountStep, BankAccountSubStep, ACHData, ReimbursementAccountStep, ReimbursementAccountSubStep, ACHDataReimbursementAccount};
