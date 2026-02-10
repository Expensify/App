import type {OnboardingInvite} from '@src/CONST';
import type {OnboardingPurpose} from './index';

/** The tasks of IntroSelected model */
type IntroSelectedTask = 'viewTour' | 'createWorkspace' | 'setupCategories' | 'setupCategoriesAndTags';

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

    /** Company size selected during onboarding */
    companySize?: string;

    /** Task reportID for 'setupCategories' type */
    setupCategories?: string;

    /** Task reportID for 'addExpenseApprovals' type */
    addExpenseApprovals?: string;

    /** Task reportID for 'setupTags' type */
    setupTags?: string;

    /** Task reportID for 'setupCategoriesAndTags' type */
    setupCategoriesAndTags?: string;

    /** The previous onboarding choices of the user */
    previousChoices?: OnboardingPurpose[];
};

export default IntroSelected;
export type {IntroSelectedTask};
