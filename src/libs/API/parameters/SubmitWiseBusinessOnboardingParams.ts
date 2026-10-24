type SubmitWiseBusinessOnboardingParams = {
    bankAccountID: number;

    /** The workspace the admin started from. A Wallet entry has none. */
    policyID?: string;

    termsAccepted: boolean;
    mandateAccepted: boolean;
};

export default SubmitWiseBusinessOnboardingParams;
