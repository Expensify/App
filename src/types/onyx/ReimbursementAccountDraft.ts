type OnfidoData = Record<string, unknown>;

type BankAccountStepProps = {
    accountNumber?: string;
    routingNumber?: string;
    acceptTerms?: boolean;
    plaidAccountID?: string;
    plaidMask?: string;
};

type CompanyStepProps = {
    companyName?: string;
    addressStreet?: string;
    addressCity?: string;
    addressState?: string;
    addressZipCode?: string;
    companyPhone?: string;
    website?: string;
    companyTaxID?: string;
    incorporationType?: string;
    incorporationDate?: string;
    incorporationState?: string;
    hasNoConnectionToCannabis?: boolean;
};

type RequestorStepProps = {
    firstName?: string;
    lastName?: string;
    requestorAddressStreet?: string;
    requestorAddressCity?: string;
    requestorAddressState?: string;
    requestorAddressZipCode?: string;
    dob?: string;
    ssnLast4?: string;
    isOnfidoSetupComplete?: boolean;
    onfidoData?: OnfidoData;
};

type BeneficialOwnersStepProps = {
    ownsMoreThan25Percent?: boolean;
    hasOtherBeneficialOwners?: boolean;
    beneficialOwners?: string;
    beneficialOwnerKeys?: string[];
};

type ACHContractStepProps = {
    acceptTermsAndConditions?: boolean;
    certifyTrueInformation?: boolean;
    isAuthorizedToUseBankAccount?: boolean;
};

type ReimbursementAccountProps = {
    bankAccountID?: number;
    isSavings?: boolean;
    bankName?: string;
    plaidAccessToken?: string;
    amount1?: string;
    amount2?: string;
    amount3?: string;
};

// BeneficialOwnerDraftData is saved under dynamic key which consists of prefix, beneficial owner ID and input key
type BeneficialOwnerDataKey = `beneficialOwner_${string}_${string}`;
type BeneficialOwnerDraftData = Record<BeneficialOwnerDataKey, string>;

type ReimbursementAccountDraft = BankAccountStepProps &
    CompanyStepProps &
    RequestorStepProps &
    BeneficialOwnersStepProps &
    ACHContractStepProps &
    ReimbursementAccountProps &
    BeneficialOwnerDraftData;

export default ReimbursementAccountDraft;
export type {ACHContractStepProps, BeneficialOwnersStepProps, RequestorStepProps, OnfidoData, BankAccountStepProps, CompanyStepProps, ReimbursementAccountProps, BeneficialOwnerDraftData};
