/** Model of onboarding */
type Onboarding = {
    /** ID of the report used to display the onboarding checklist message */
    chatReportID?: string;

    /** A Boolean that informs whether the user has completed the guided setup onboarding flow */
    hasCompletedGuidedSetupFlow: boolean;
};

export default Onboarding;
