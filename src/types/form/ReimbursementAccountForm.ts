import type {FileObject} from '@components/AttachmentModal';
import type {Country} from '@src/CONST';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import type Form from './Form';

const INPUT_IDS = {
    BANK_INFO_STEP: {
        ROUTING_NUMBER: 'routingNumber',
        ACCOUNT_NUMBER: 'accountNumber',
        PLAID_MASK: 'mask',
        IS_SAVINGS: 'isSavings',
        BANK_NAME: 'bankName',
        PLAID_ACCOUNT_ID: 'plaidAccountID',
        PLAID_ACCESS_TOKEN: 'plaidAccessToken',
        SELECTED_PLAID_ACCOUNT_ID: 'selectedPlaidAccountID',
    },
    PERSONAL_INFO_STEP: {
        FIRST_NAME: 'firstName',
        LAST_NAME: 'lastName',
        DOB: 'dob',
        SSN_LAST_4: 'ssnLast4',
        STREET: 'requestorAddressStreet',
        CITY: 'requestorAddressCity',
        STATE: 'requestorAddressState',
        ZIP_CODE: 'requestorAddressZipCode',
        IS_ONFIDO_SETUP_COMPLETE: 'isOnfidoSetupComplete',
    },
    BUSINESS_INFO_STEP: {
        COMPANY_NAME: 'companyName',
        COMPANY_TAX_ID: 'companyTaxID',
        COMPANY_WEBSITE: 'website',
        COMPANY_PHONE: 'companyPhone',
        STREET: 'addressStreet',
        CITY: 'addressCity',
        STATE: 'addressState',
        ZIP_CODE: 'addressZipCode',
        INCORPORATION_TYPE: 'incorporationType',
        INCORPORATION_DATE: 'incorporationDate',
        INCORPORATION_STATE: 'incorporationState',
        HAS_NO_CONNECTION_TO_CANNABIS: 'hasNoConnectionToCannabis',
    },
    COMPLETE_VERIFICATION: {
        IS_AUTHORIZED_TO_USE_BANK_ACCOUNT: 'isAuthorizedToUseBankAccount',
        CERTIFY_TRUE_INFORMATION: 'certifyTrueInformation',
        ACCEPT_TERMS_AND_CONDITIONS: 'acceptTermsAndConditions',
    },
    BENEFICIAL_OWNER_INFO_STEP: {
        OWNS_MORE_THAN_25_PERCENT: 'ownsMoreThan25Percent',
        HAS_OTHER_BENEFICIAL_OWNERS: 'hasOtherBeneficialOwners',
        BENEFICIAL_OWNERS: 'beneficialOwners',
    },
    AMOUNT1: 'amount1',
    AMOUNT2: 'amount2',
    AMOUNT3: 'amount3',
    ADDITIONAL_DATA: {
        ACCOUNT_HOLDER_NAME: 'accountHolderName',
        ADDRESS_STREET: 'addressStreet',
        ADDRESS_CITY: 'addressCity',
        ADDRESS_STATE: 'addressState',
        ADDRESS_ZIP_CODE: 'addressZipCode',
        COUNTRY: 'country',
        CORPAY: {
            ACCOUNT_HOLDER_COUNTRY: 'accountHolderCountry',
            SWIFT_CODE: 'swiftCode',
            BANK_NAME: 'bankName',
            BANK_CITY: 'bankCity',
            BANK_ADDRESS_LINE_1: 'bankAddress',
            BANK_STATEMENT: 'bankStatement',
            COMPANY_NAME: 'companyName',
            COMPANY_STREET: 'companyStreet',
            COMPANY_CITY: 'companyCity',
            COMPANY_STATE: 'companyState',
            COMPANY_ZIP_CODE: 'companyZipCode',
            COMPANY_COUNTRY: 'companyCountry',
            BUSINESS_CONTACT_NUMBER: 'businessContactNumber',
            BUSINESS_CONFIRMATION_EMAIL: 'businessConfirmationEmail',
            FORMATION_INCORPORATION_COUNTRY_CODE: 'formationIncorporationCountryCode',
            FORMATION_INCORPORATION_STATE: 'formationIncorporationState',
            BUSINESS_REGISTRATION_INCORPORATION_NUMBER: 'businessRegistrationIncorporationNumber',
            COUNTRY_CODE: 'countryCode',
            TAX_ID_EIN_NUMBER: 'taxIDEINNumber',
            BUSINESS_CATEGORY: 'natureOfBusiness',
            APPLICANT_TYPE_ID: 'applicantTypeID',
            PURPOSE_OF_TRANSACTION_ID: 'purposeOfTransactionID',
            CURRENCY_NEEDED: 'currencyNeeded',
            TRADE_VOLUME: 'tradeVolume',
            ANNUAL_VOLUME: 'annualVolume',
            OWNS_MORE_THAN_25_PERCENT: 'ownsMoreThan25Percent',
            ANY_INDIVIDUAL_OWN_25_PERCENT_OR_MORE: 'anyIndividualOwn25PercentOrMore',
            BENEFICIAL_OWNERS: 'beneficialOwners',
            ENTITY_CHART: 'entityChart',
            FUND_DESTINATION_COUNTRIES: 'fundDestinationCountries',
            FUND_SOURCE_COUNTRIES: 'fundSourceCountries',
            COMPANY_DIRECTORS_FULL_NAME: 'companyDirectorsFullName',
            COMPANY_DIRECTORS_JOB_TITLE: 'companyDirectorsJobTitle',
            COMPANY_DIRECTORS_OCCUPATION: 'companyDirectorsOccupation',
            SIGNER_FULL_NAME: 'signerFullName',
            SIGNER_DATE_OF_BIRTH: 'signerDateOfBirth',
            SIGNER_JOB_TITLE: 'signerJobTitle',
            SIGNER_EMAIL: 'signerEmail',
            SIGNER_COMPLETE_RESIDENTIAL_ADDRESS: 'signerCompleteResidentialAddress',
            SECOND_SIGNER_FULL_NAME: 'secondSignerFullName',
            SECOND_SIGNER_DATE_OF_BIRTH: 'secondSignerDateOfBirth',
            SECOND_SIGNER_JOB_TITLE: 'secondSignerJobTitle',
            SECOND_SIGNER_EMAIL: 'secondSignerEmail',
            SECOND_SIGNER_COMPLETE_RESIDENTIAL_ADDRESS: 'secondSignerCompleteResidentialAddress',
            SIGNER_PROOF_OF_DIRECTOR: 'signerProofOfDirector',
            SIGNER_COPY_OF_ID: 'signerCopyOfID',
            SIGNER_ADDRESS_PROOF: 'signerAddressProof',
            SIGNER_TAX_ID: 'signerTaxID',
            SIGNER_PDS_AND_FSG: 'signerPDSAndFSG',
            SECOND_SIGNER_PROOF_OF_DIRECTOR: 'secondSignerProofOfDirector',
            SECOND_SIGNER_COPY_OF_ID: 'secondSignerCopyOfID',
            SECOND_SIGNER_ADDRESS_PROOF: 'secondSignerAddressProof',
            SECOND_SIGNER_TAX_ID: 'secondSignerTaxID',
            SECOND_SIGNER_PDS_AND_FSG: 'secondSignerPDSAndFSG',
            PROVIDE_TRUTHFUL_INFORMATION: 'provideTruthfulInformation',
            AGREE_TO_TERMS_AND_CONDITIONS: 'agreeToTermsAndConditions',
            CONSENT_TO_PRIVACY_NOTICE: 'consentToPrivacyNotice',
            AUTHORIZED_TO_BIND_CLIENT_TO_AGREEMENT: 'authorizedToBindClientToAgreement',
        },
    },
} as const;

type InputID = DeepValueOf<typeof INPUT_IDS>;

type BeneficialOwnersStepBaseProps = {
    [INPUT_IDS.BENEFICIAL_OWNER_INFO_STEP.OWNS_MORE_THAN_25_PERCENT]: boolean;
    [INPUT_IDS.BENEFICIAL_OWNER_INFO_STEP.HAS_OTHER_BENEFICIAL_OWNERS]: boolean;
    [INPUT_IDS.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNERS]: string;
};

// BeneficialOwnerDraftData is saved under dynamic key which consists of prefix, beneficial owner ID and input key
type BeneficialOwnerDataKey = `beneficialOwner_${string}_${string}`;
type ReimbursementAccountFormExtraProps = BeneficialOwnersStepExtraProps & {bankAccountID?: number};

type BeneficialOwnersStepExtraProps = {
    [key: BeneficialOwnerDataKey]: string;
    beneficialOwnerKeys?: string[];
};

type BeneficialOwnersStepProps = BeneficialOwnersStepBaseProps & BeneficialOwnersStepExtraProps;

type BankAccountStepProps = {
    [INPUT_IDS.BANK_INFO_STEP.ACCOUNT_NUMBER]: string;
    [INPUT_IDS.BANK_INFO_STEP.ROUTING_NUMBER]: string;
    [INPUT_IDS.BANK_INFO_STEP.PLAID_ACCOUNT_ID]: string;
    [INPUT_IDS.BANK_INFO_STEP.PLAID_MASK]: string;
};

type CompanyStepProps = {
    [INPUT_IDS.BUSINESS_INFO_STEP.COMPANY_NAME]: string;
    [INPUT_IDS.BUSINESS_INFO_STEP.STREET]: string;
    [INPUT_IDS.BUSINESS_INFO_STEP.CITY]: string;
    [INPUT_IDS.BUSINESS_INFO_STEP.STATE]: string;
    [INPUT_IDS.BUSINESS_INFO_STEP.ZIP_CODE]: string;
    [INPUT_IDS.BUSINESS_INFO_STEP.COMPANY_PHONE]: string;
    [INPUT_IDS.BUSINESS_INFO_STEP.COMPANY_WEBSITE]: string;
    [INPUT_IDS.BUSINESS_INFO_STEP.COMPANY_TAX_ID]: string;
    [INPUT_IDS.BUSINESS_INFO_STEP.INCORPORATION_TYPE]: string;
    [INPUT_IDS.BUSINESS_INFO_STEP.INCORPORATION_DATE]: string;
    [INPUT_IDS.BUSINESS_INFO_STEP.INCORPORATION_STATE]: string;
    [INPUT_IDS.BUSINESS_INFO_STEP.HAS_NO_CONNECTION_TO_CANNABIS]: boolean;
};

type RequestorStepProps = {
    [INPUT_IDS.PERSONAL_INFO_STEP.FIRST_NAME]: string;
    [INPUT_IDS.PERSONAL_INFO_STEP.LAST_NAME]: string;
    [INPUT_IDS.PERSONAL_INFO_STEP.STREET]: string;
    [INPUT_IDS.PERSONAL_INFO_STEP.CITY]: string;
    [INPUT_IDS.PERSONAL_INFO_STEP.STATE]: string;
    [INPUT_IDS.PERSONAL_INFO_STEP.ZIP_CODE]: string;
    [INPUT_IDS.PERSONAL_INFO_STEP.DOB]: string;
    [INPUT_IDS.PERSONAL_INFO_STEP.SSN_LAST_4]: string;
    [INPUT_IDS.PERSONAL_INFO_STEP.IS_ONFIDO_SETUP_COMPLETE]: boolean;
};

type ACHContractStepProps = {
    [INPUT_IDS.COMPLETE_VERIFICATION.ACCEPT_TERMS_AND_CONDITIONS]: boolean;
    [INPUT_IDS.COMPLETE_VERIFICATION.CERTIFY_TRUE_INFORMATION]: boolean;
    [INPUT_IDS.COMPLETE_VERIFICATION.IS_AUTHORIZED_TO_USE_BANK_ACCOUNT]: boolean;
};

type ReimbursementAccountProps = {
    [INPUT_IDS.BANK_INFO_STEP.IS_SAVINGS]: boolean;
    [INPUT_IDS.BANK_INFO_STEP.BANK_NAME]: string;
    [INPUT_IDS.BANK_INFO_STEP.PLAID_ACCESS_TOKEN]: string;
    [INPUT_IDS.BANK_INFO_STEP.SELECTED_PLAID_ACCOUNT_ID]: string;
    [INPUT_IDS.AMOUNT1]: string;
    [INPUT_IDS.AMOUNT2]: string;
    [INPUT_IDS.AMOUNT3]: string;
};

/** Additional props for non-USD reimbursement account */
type NonUSDReimbursementAccountAdditionalProps = {
    /** Country of the reimbursement account */
    [INPUT_IDS.ADDITIONAL_DATA.COUNTRY]: Country | '';

    /** Name of the account holder */
    [INPUT_IDS.ADDITIONAL_DATA.ACCOUNT_HOLDER_NAME]: string;

    /** Country of the account holder */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.ACCOUNT_HOLDER_COUNTRY]: Country | '';

    /** SWIFT code */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SWIFT_CODE]: string;

    /** Bank name */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.BANK_NAME]: string;

    /** Bank city */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.BANK_CITY]: string;

    /** Bank address line 1 */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.BANK_ADDRESS_LINE_1]: string;

    /** Bank statement file */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.BANK_STATEMENT]: FileObject[];

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

    /** Business contact number */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.BUSINESS_CONTACT_NUMBER]: string;

    /** Business confirmation email */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.BUSINESS_CONFIRMATION_EMAIL]: string;

    /** Formation incorporation country code */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.FORMATION_INCORPORATION_COUNTRY_CODE]: string;

    /** Formation incorporation state */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.FORMATION_INCORPORATION_STATE]: string;

    /** Business registration incorporation number */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.BUSINESS_REGISTRATION_INCORPORATION_NUMBER]: string;

    /** Country code */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.COUNTRY_CODE]: string;

    /** Tax ID EIN number */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.TAX_ID_EIN_NUMBER]: string;

    /** Business category */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.BUSINESS_CATEGORY]: string;

    /** Applicant type ID */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.APPLICANT_TYPE_ID]: string;

    /** Purpose of transaction ID */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.PURPOSE_OF_TRANSACTION_ID]: string;

    /** Currency needed */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.CURRENCY_NEEDED]: string;

    /** Trade volume */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.TRADE_VOLUME]: string;

    /** Annual volume */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.ANNUAL_VOLUME]: string;

    /** Current user owns more than 25 percent of company */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.OWNS_MORE_THAN_25_PERCENT]: boolean;

    /** Any individual owns 25 percent or more of company */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.ANY_INDIVIDUAL_OWN_25_PERCENT_OR_MORE]: boolean;

    /** Beneficial owners */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.BENEFICIAL_OWNERS]: string;

    /** Entity chart */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.ENTITY_CHART]: FileObject[];

    /** Fund destination countries */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.FUND_DESTINATION_COUNTRIES]: string;

    /** Fund source countries */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.FUND_SOURCE_COUNTRIES]: string;

    /** Company directors full name */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.COMPANY_DIRECTORS_FULL_NAME]: string;

    /** Company directors job title */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.COMPANY_DIRECTORS_JOB_TITLE]: string;

    /** Company directors occupation */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.COMPANY_DIRECTORS_OCCUPATION]: string;

    /** Signer full name */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SIGNER_FULL_NAME]: string;

    /** Signer date of birth */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SIGNER_DATE_OF_BIRTH]: string;

    /** Signer job title */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SIGNER_JOB_TITLE]: string;

    /** Signer email */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SIGNER_EMAIL]: string;

    /** Signer complete residential address */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SIGNER_COMPLETE_RESIDENTIAL_ADDRESS]: string;

    /** Second signer full name */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SECOND_SIGNER_FULL_NAME]: string;

    /** Second signer date of birth */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SECOND_SIGNER_DATE_OF_BIRTH]: string;

    /** Second signer job title */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SECOND_SIGNER_JOB_TITLE]: string;

    /** Second signer email */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SECOND_SIGNER_EMAIL]: string;

    /** Second signer complete residential address */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SECOND_SIGNER_COMPLETE_RESIDENTIAL_ADDRESS]: string;

    /** Signer proof of director */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SIGNER_PROOF_OF_DIRECTOR]: FileObject[];

    /** Signer copy of ID */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SIGNER_COPY_OF_ID]: FileObject[];

    /** Signer address proof */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SIGNER_ADDRESS_PROOF]: FileObject[];

    /** Signer tax ID */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SIGNER_TAX_ID]: string;

    /** Signer PDS and FSG */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SIGNER_PDS_AND_FSG]: string;

    /** Second signer proof of director */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SECOND_SIGNER_PROOF_OF_DIRECTOR]: FileObject[];

    /** Second signer copy of ID */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SECOND_SIGNER_COPY_OF_ID]: FileObject[];

    /** Second signer address proof */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SECOND_SIGNER_ADDRESS_PROOF]: FileObject[];

    /** Second signer tax ID */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SECOND_SIGNER_TAX_ID]: string;

    /** Second signer PDS and FSG */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SECOND_SIGNER_PDS_AND_FSG]: string;

    /** Provide truthful information */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.PROVIDE_TRUTHFUL_INFORMATION]: boolean;

    /** Agree to terms and conditions */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.AGREE_TO_TERMS_AND_CONDITIONS]: boolean;

    /** Consent to privacy notice */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.CONSENT_TO_PRIVACY_NOTICE]: boolean;

    /** Authorized to bind client to agreement */
    [INPUT_IDS.ADDITIONAL_DATA.CORPAY.AUTHORIZED_TO_BIND_CLIENT_TO_AGREEMENT]: boolean;
};

type ReimbursementAccountForm = ReimbursementAccountFormExtraProps &
    Form<
        InputID,
        BeneficialOwnersStepBaseProps &
            BankAccountStepProps &
            CompanyStepProps &
            RequestorStepProps &
            ACHContractStepProps &
            ReimbursementAccountProps &
            NonUSDReimbursementAccountAdditionalProps
    >;

export type {
    ReimbursementAccountForm,
    BeneficialOwnerDataKey,
    BankAccountStepProps,
    CompanyStepProps,
    RequestorStepProps,
    BeneficialOwnersStepProps,
    ACHContractStepProps,
    ReimbursementAccountProps,
    NonUSDReimbursementAccountAdditionalProps,
    InputID,
};
export default INPUT_IDS;
