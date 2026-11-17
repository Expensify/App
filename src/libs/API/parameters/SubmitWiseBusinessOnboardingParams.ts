type SubmitWiseBusinessOnboardingParams = {
    /** The bank account whose business is submitted to Wise */
    bankAccountID: number;

    /** The workspace the onboarding started from. Left out when it started from Wallet. */
    policyID?: string;

    /** Whether the admin accepted the Expensify and Wise terms and privacy policies */
    termsAccepted: boolean;

    /** Whether the admin allowed us to pull money from the bank account by direct debit */
    mandateAccepted: boolean;
};

export default SubmitWiseBusinessOnboardingParams;
