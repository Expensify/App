import type {OnboardingInviteType, OnboardingPurposeType} from '@src/CONST';

/** Model of onboarding */
type IntroSelected = Partial<{
    /** The choice that the user selected in the engagement modal */
    choice: OnboardingPurposeType;

    /** The invite type */
    inviteType: OnboardingInviteType;

    /** Whether the onboarding is complete */
    isInviteOnboardingComplete: boolean;
}>;

export default IntroSelected;
