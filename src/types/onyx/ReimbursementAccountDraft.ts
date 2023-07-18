type ReimbursementAccountDraft = {
    bankAccountID?: number;

    /** Props needed for BankAccountStep */
    accountNumber?: string;
    routingNumber?: string;
    acceptTerms?: boolean;
    plaidAccountID?: string;
    plaidMask?: string;

    /** Props needed for CompanyStep */
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
    bank?: string;

    /** Props needed for RequestorStep */
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

    /** Props needed for ACHContractStep */
    ownsMoreThan25Percent?: boolean;
    hasOtherBeneficialOwners?: boolean;
    acceptTermsAndConditions?: boolean;
    certifyTrueInformation?: boolean;
    beneficialOwners?: string[];
};

export default ReimbursementAccountDraft;
