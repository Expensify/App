import type {OnboardingInviteType} from '@src/CONST';
import type {OnboardingPurpose} from './index';

/** Model of onboarding */
type IntroSelected = Partial<{
    /** The choice that the user selected in the engagement modal */
    choice: OnboardingPurpose;

    /** The invite type */
    inviteType: OnboardingInviteType;

    /** Whether the onboarding is complete */
    isInviteOnboardingComplete: boolean;
}>;

export default IntroSelected;
