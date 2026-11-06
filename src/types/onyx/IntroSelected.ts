import type CONST from '@src/CONST';
import type {OnboardingInvite} from '@src/CONST';

import type {ValueOf} from 'type-fest';

import type {OnboardingPurpose} from './index';

/** The tasks of IntroSelected model */
type IntroSelectedTask =
    | 'viewTour'
    | 'createWorkspace'
    | 'setupCategories'
    | 'setupTags'
    | 'setupCategoriesAndTags'
    | 'reviewWorkspaceSettings'
    | 'addWorkEmail'
    | 'validateEmail'
    | 'joinWorkspace';

/** Model of onboarding */
type IntroSelected = {
    /** The choice that the user selected in the engagement modal */
    choice?: OnboardingPurpose;

    inviteType?: OnboardingInvite;
    isInviteOnboardingComplete?: boolean;

    /** Task reportID for 'viewTour' type */
    viewTour?: string;

    /** Task reportID for 'createWorkspace' type */
    createWorkspace?: string;

    /** Includes retained legacy ranges that are no longer offered by the onboarding UI. */
    companySize?: ValueOf<typeof CONST.ONBOARDING_COMPANY_SIZE>;

    /** Task reportID for 'setupCategories' type */
    setupCategories?: string;

    /** Task reportID for 'addExpenseApprovals' type */
    addExpenseApprovals?: string;

    /** Task reportID for 'setupTags' type */
    setupTags?: string;

    /** Task reportID for 'setupCategoriesAndTags' type */
    setupCategoriesAndTags?: string;

    /** Task reportID for 'reviewWorkspaceSettings' type */
    reviewWorkspaceSettings?: string;

    /** Task reportID for 'addWorkEmail' type */
    addWorkEmail?: string;

    /** Task reportID for 'validateEmail' type */
    validateEmail?: string;

    /** Task reportID for 'joinWorkspace' type */
    joinWorkspace?: string;

    /** Report action ID for the post-onboarding no-joinable-workspaces message */
    noJoinableWorkspacesMessage?: string;

    previousChoices?: OnboardingPurpose[];

    /** The personal track goal selected during onboarding */
    personalTrackGoal?: string;
};

export default IntroSelected;
export type {IntroSelectedTask};
