type SubmitWiseBusinessOnboardingParams = {
    bankAccountID: number;

    /** The workspace the admin started from. A Wallet entry has none. */
    policyID?: string;

    /** The admin ticked every box on the terms page. Web saves the accepted wording and builds the acceptance from it. */
    termsAccepted: boolean;

    /** The representative's SSN or ITIN, held in memory only. This request is never queued, so no request stored on the device carries it. */
    ssn: string;
};

export default SubmitWiseBusinessOnboardingParams;
