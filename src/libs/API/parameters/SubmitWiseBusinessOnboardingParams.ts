type SubmitWiseBusinessOnboardingParams = {
    bankAccountID: number;

    /** The workspace the onboarding started from. Left out when it started from Wallet. */
    policyID?: string;

    termsAccepted: boolean;
    mandateAccepted: boolean;
};

export default SubmitWiseBusinessOnboardingParams;
