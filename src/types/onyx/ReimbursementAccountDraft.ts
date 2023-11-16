type OnfidoData = Record<string, unknown>;

type BankAccountStepProps = {
    bankAccountID?: number;
    accountNumber?: string;
    routingNumber?: string;
    acceptTerms?: boolean;
    plaidAccountID?: string;
    plaidMask?: string;
};

type CompanyStepProps = {
    bankAccountID?: number;
    companyName?: string;
    addressStreet?: string;
    addressCity?: string;
    addressState?: string;
    addressZipCode?: string;
    companyPhone?: string;
    website?: string;
    companyTaxID?: string;
    incorporationType?: string;
    incorporationDate?: string | Date;
    incorporationState?: string;
    hasNoConnectionToCannabis?: boolean;
};

type RequestorStepProps = {
    bankAccountID?: number;
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

type BeneficialOwnersStepProps = {
    bankAccountID?: number;
    ownsMoreThan25Percent?: boolean;
    hasOtherBeneficialOwners?: boolean;
    beneficialOwners?: string[];
};

type ACHContractStepProps = {
    bankAccountID?: number;
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

type ReimbursementAccountDraft = BankAccountStepProps & RequestorStepProps & CompanyStepProps & BeneficialOwnersStepProps & ACHContractStepProps & ReimbursementAccountProps;

export default ReimbursementAccountDraft;
export type {ACHContractStepProps, BeneficialOwnersStepProps, RequestorStepProps, OnfidoData, BankAccountStepProps, CompanyStepProps, ReimbursementAccountProps};
