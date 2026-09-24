import getCurrentUrl from '@libs/Navigation/currentUrl';
import Navigation from '@libs/Navigation/Navigation';

import {createWorkspaceWithPolicyDraft, setUpPoliciesAndNavigate} from '@userActions/Policy/CreateWorkspaceFlow';
import {createWorkspace} from '@userActions/Policy/Policy';
import {createDraftInitialWorkspace, generateDefaultWorkspaceName} from '@userActions/Policy/PolicyDraft';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {IntroSelected} from '@src/types/onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        isNavigationReady: jest.fn(() => Promise.resolve()),
        goBack: jest.fn(),
        navigate: jest.fn(),
        dismissModal: jest.fn(),
        revealRouteBeforeDismissingModal: jest.fn(),
        isTopmostRouteModalScreen: jest.fn(() => false),
        waitForProtectedRoutes: jest.fn(() => Promise.resolve()),
    },
}));

jest.mock('@libs/Navigation/currentUrl', () => ({
    __esModule: true,
    default: jest.fn(() => ''),
}));

jest.mock('@libs/Navigation/helpers/willRouteNavigateToRHP', () => ({
    __esModule: true,
    default: jest.fn(() => false),
}));

jest.mock('@libs/Navigation/helpers/WorkspaceCreationReveal', () => ({
    __esModule: true,
    default: {
        beginRevealUnderRHP: jest.fn(),
    },
}));

jest.mock('@libs/SessionUtils', () => ({
    isLoggingInAsNewUser: jest.fn(() => false),
}));

jest.mock('@userActions/Policy/Policy', () => ({
    createWorkspace: jest.fn(),
}));

jest.mock('@userActions/Policy/PolicyDraft', () => ({
    createDraftInitialWorkspace: jest.fn(),
    generateDefaultWorkspaceName: jest.fn(() => 'Acme workspace'),
    generatePolicyID: jest.fn(() => 'generated-policy-id'),
}));

const baseParams = {
    introSelected: {choice: CONST.ONBOARDING_CHOICES.ADMIN} as IntroSelected,
    policyName: 'Acme',
    currency: 'USD',
    policyID: 'policy-1',
    activePolicy: undefined,
    conciergeChat: undefined,
    currentUserAccountIDParam: 1,
    currentUserEmailParam: 'member@test.com',
    isSelfTourViewed: undefined,
    hasActiveAdminPolicies: false,
    hasOwnedPaidPolicy: false,
    delegateAccountID: 99,
};

const setUpParams = {
    session: {accountID: 7, email: 'session@test.com'},
    introSelected: baseParams.introSelected,
    currency: 'USD',
    activePolicy: undefined,
    isSelfTourViewed: undefined,
    hasActiveAdminPolicies: false,
    hasOwnedPaidPolicy: false,
    lastWorkspaceNumber: undefined,
    translate: TestHelper.translateLocal,
    conciergeChat: undefined,
    policyOwnerAccountID: 2,
    policyOwnerDisplayName: 'Acme owner',
    delegateAccountID: 99,
};

describe('actions/Policy/CreateWorkspaceFlow', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(getCurrentUrl).mockReturnValue('');
    });

    it('createWorkspaceWithPolicyDraft optimistically creates the draft before saving the workspace', () => {
        // Given a new-workspace request pinned to a fixed policy ID
        // When the starter creates a workspace from a draft
        // Then the draft is created before the workspace is saved, because the optimistic draft has to exist ahead of the create call
        createWorkspaceWithPolicyDraft(baseParams);

        expect(createDraftInitialWorkspace).toHaveBeenCalledWith(expect.objectContaining({workspaceName: 'Acme', policyID: 'policy-1', currency: 'USD'}));
        expect(createWorkspace).toHaveBeenCalledWith(expect.objectContaining({policyID: 'policy-1', policyName: 'Acme', delegateAccountID: baseParams.delegateAccountID}));
    });

    it('createWorkspaceWithPolicyDraft uses the manage-team engagement choice', () => {
        // Given an onboarding choice that is not a track-workspace choice
        // When the starter creates the workspace
        // Then the engagement choice is manage-team because that is the default intent for a non-track onboarding
        createWorkspaceWithPolicyDraft({...baseParams, introSelected: {choice: CONST.ONBOARDING_CHOICES.ADMIN}});

        expect(createWorkspace).toHaveBeenCalledWith(expect.objectContaining({engagementChoice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM}));
    });

    it('createWorkspaceWithPolicyDraft uses the track-workspace engagement choice for a track onboarding choice', () => {
        // Given a track onboarding choice
        // When the starter creates the workspace
        // Then the engagement choice is track-workspace so the created workspace matches the personal-spend intent
        createWorkspaceWithPolicyDraft({...baseParams, introSelected: {choice: CONST.ONBOARDING_CHOICES.PERSONAL_SPEND}});

        expect(createWorkspace).toHaveBeenCalledWith(expect.objectContaining({engagementChoice: CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE}));
    });

    it('setUpPoliciesAndNavigate does nothing without an exitTo in the url', () => {
        // Given a sign-in url that carries no exitTo query param
        jest.mocked(getCurrentUrl).mockReturnValue('https://new.expensify.com/home');

        // When the init handler runs setUpPoliciesAndNavigate
        setUpPoliciesAndNavigate(setUpParams);

        // Then nothing is created or navigated because there is no post-sign-in destination to act on
        expect(createDraftInitialWorkspace).not.toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('setUpPoliciesAndNavigate creates a workspace for the transition link and navigates to it', async () => {
        // Given a transition link whose exitTo asks for a new workspace owned by another email
        jest.mocked(getCurrentUrl).mockReturnValue('https://new.expensify.com/transition?exitTo=workspace/new&ownerEmail=owner@test.com');

        // When the init handler runs setUpPoliciesAndNavigate
        setUpPoliciesAndNavigate(setUpParams);
        await waitForBatchedUpdates();

        // Then a draft is created under a generated policy ID, the workspace is saved for the owner using the session account, and the app navigates to it, because that is exactly the exitTo the transition link requested
        expect(generateDefaultWorkspaceName).toHaveBeenCalledWith('owner@test.com', 'Acme owner', undefined, setUpParams.translate);
        expect(createDraftInitialWorkspace).toHaveBeenCalledWith(expect.objectContaining({workspaceName: 'Acme workspace', policyID: 'generated-policy-id'}));
        expect(createWorkspace).toHaveBeenCalledWith(
            expect.objectContaining({
                policyID: 'generated-policy-id',
                policyOwner: {email: 'owner@test.com', accountID: 2},
                currentUserAccountIDParam: 7,
                currentUserEmailParam: 'session@test.com',
                delegateAccountID: setUpParams.delegateAccountID,
            }),
        );
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_INITIAL.getRoute('generated-policy-id', ''));
    });

    it('setUpPoliciesAndNavigate only navigates when the exitTo route is not a new workspace', async () => {
        // Given a sign-in url whose exitTo is a settings route rather than a new workspace
        jest.mocked(getCurrentUrl).mockReturnValue('https://new.expensify.com/inbox?exitTo=settings');

        // When the init handler runs setUpPoliciesAndNavigate
        setUpPoliciesAndNavigate(setUpParams);
        await waitForBatchedUpdates();

        // Then it only navigates to the exitTo without creating a draft, because only exitTo=workspace/new triggers workspace creation
        expect(createDraftInitialWorkspace).not.toHaveBeenCalled();
        expect(Navigation.navigate).toHaveBeenCalledWith('settings');
    });
});
