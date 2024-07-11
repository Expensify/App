import type {OnboardingPurposeType} from '@src/CONST';

/** Model of onboarding */
type IntroSelected = {
    /** The choice that the user selected in the engagement modal */
    choice: OnboardingPurposeType;

    /** Whether the onboarding is complete */
    isInviteOnboardingComplete: boolean;
};

export default IntroSelected;
