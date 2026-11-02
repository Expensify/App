type UpdateWiseOnboardingAdditionalDataParams = {
    bankAccountID: number;

    /** The onboarding page being saved, which is also the key its answers are stored under */
    step: string;

    /** The page's answers as JSON, keyed by the names the server stores them under */
    inputs: string;
};

export default UpdateWiseOnboardingAdditionalDataParams;
