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
    incorporationDate?: string | Date;
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

type ACHContractStepProps = {
    ownsMoreThan25Percent?: boolean;
    hasOtherBeneficialOwners?: boolean;
    acceptTermsAndConditions?: boolean;
    certifyTrueInformation?: boolean;
    beneficialOwners?: string[];
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

type ReimbursementAccountDraft = BankAccountStepProps & CompanyStepProps & RequestorStepProps & ACHContractStepProps & ReimbursementAccountProps;

export default ReimbursementAccountDraft;
export type {ACHContractStepProps, RequestorStepProps, OnfidoData, BankAccountStepProps, CompanyStepProps, ReimbursementAccountProps};
