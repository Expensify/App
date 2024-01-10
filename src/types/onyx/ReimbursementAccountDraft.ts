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
    dob?: string | Date;
    ssnLast4?: string;
    isControllingOfficer?: boolean;
    isOnfidoSetupComplete?: boolean;
    onfidoData?: OnfidoData;
};

type BeneficialOwnersStepDraftProps = {
    ownsMoreThan25Percent?: boolean;
    hasOtherBeneficialOwners?: boolean;
    beneficialOwners?: string;
    beneficialOwnerKeys?: string[];
};

type ACHContractStepProps = {
    ownsMoreThan25Percent?: boolean;
    hasOtherBeneficialOwners?: boolean;
    acceptTermsAndConditions?: boolean;
    certifyTrueInformation?: boolean;
    isAuthorizedToUseBankAccount?: boolean;
    beneficialOwners?: string;
    beneficialOwnerKeys?: string[];
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
type BeneficialOwnerDraftData = Record<`beneficialOwner_${string}_${string}`, string>;

type ReimbursementAccountDraft = BankAccountStepProps & CompanyStepProps & RequestorStepProps & ACHContractStepProps & ReimbursementAccountProps & BeneficialOwnerDraftData;

export default ReimbursementAccountDraft;
export type {
    ACHContractStepProps,
    BeneficialOwnersStepDraftProps,
    RequestorStepProps,
    OnfidoData,
    BankAccountStepProps,
    CompanyStepProps,
    ReimbursementAccountProps,
    BeneficialOwnerDraftData,
};
