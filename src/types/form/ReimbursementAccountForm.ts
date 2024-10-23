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
        COUNTRY: 'country',
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

type NonUSDReimbursementAccountAdditionalProps = {
    [INPUT_IDS.ADDITIONAL_DATA.COUNTRY]: Country | '';
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
