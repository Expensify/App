import type {OnboardingInvite} from '@src/CONST';
import type {OnboardingPurpose} from './index';

/** Model of onboarding */
type IntroSelected = {
    /** The choice that the user selected in the engagement modal */
    choice?: OnboardingPurpose;

    /** The invite type */
    inviteType?: OnboardingInvite;

    /** Whether the onboarding is complete */
    isInviteOnboardingComplete?: boolean;

    /** Task reportID for 'viewTour' type */
    viewTour?: string;

    /** Task reportID for 'createWorkspace' type */
    createWorkspace?: string;
};

export default IntroSelected;
