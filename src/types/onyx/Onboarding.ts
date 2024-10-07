import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

/** Model of onboarding */
type Onboarding = {
    /** ID of the report used to display the onboarding checklist message */
    chatReportID?: string;

    /** A Boolean that informs whether the user has completed the guided setup onboarding flow */
    hasCompletedGuidedSetupFlow: boolean;

    /** A string that informs which qualifier the user selected during sign up */
    signupQualifier: ValueOf<typeof CONST.ONBOARDING_SIGNUP_QUALIFIERS>;
};

export default Onboarding;
