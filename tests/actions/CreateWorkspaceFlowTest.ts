import getCurrentUrl from '@libs/Navigation/currentUrl';
import Navigation from '@libs/Navigation/Navigation';

import {createWorkspace} from '@userActions/Policy/Policy';
import {createDraftInitialWorkspace, generateDefaultWorkspaceName} from '@userActions/Policy/PolicyDraft';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {IntroSelected} from '@src/types/onyx';

import {createWorkspaceWithPolicyDraft, setUpPoliciesAndNavigate} from '../../src/libs/actions/Policy/CreateWorkspaceFlow';
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

const policyIDsWithIOUReports: Record<string, true> = {policy1: true};

const baseParams = {
    introSelected: {choice: CONST.ONBOARDING_CHOICES.ADMIN} as IntroSelected,
    policyName: 'Acme',
    currency: 'USD',
    policyID: 'policy-1',
    activePolicy: undefined,
    conciergeChat: undefined,
    currentUserAccountIDParam: 1,
    currentUserEmailParam: 'member@test.com',
    policyIDsWithIOUReportsParam: policyIDsWithIOUReports,
    betas: undefined,
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
    betas: undefined,
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
        createWorkspaceWithPolicyDraft(baseParams);

        expect(createDraftInitialWorkspace).toHaveBeenCalledWith(expect.objectContaining({workspaceName: 'Acme', policyID: 'policy-1', currency: 'USD'}));
        expect(createWorkspace).toHaveBeenCalledWith(
            expect.objectContaining({policyID: 'policy-1', policyName: 'Acme', policyIDsWithIOUReportsParam: policyIDsWithIOUReports, delegateAccountID: baseParams.delegateAccountID}),
        );
    });

    it('createWorkspaceWithPolicyDraft uses the manage-team engagement choice', () => {
        createWorkspaceWithPolicyDraft({...baseParams, introSelected: {choice: CONST.ONBOARDING_CHOICES.ADMIN}});

        expect(createWorkspace).toHaveBeenCalledWith(expect.objectContaining({engagementChoice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM}));
    });

    it('createWorkspaceWithPolicyDraft uses the track-workspace engagement choice for a track onboarding choice', () => {
        createWorkspaceWithPolicyDraft({...baseParams, introSelected: {choice: CONST.ONBOARDING_CHOICES.PERSONAL_SPEND}});

        expect(createWorkspace).toHaveBeenCalledWith(expect.objectContaining({engagementChoice: CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE}));
    });

    it('setUpPoliciesAndNavigate does nothing without an exitTo in the url', () => {
        jest.mocked(getCurrentUrl).mockReturnValue('https://new.expensify.com/home');

        setUpPoliciesAndNavigate(setUpParams);

        expect(createDraftInitialWorkspace).not.toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('setUpPoliciesAndNavigate creates a workspace for the transition link and navigates to it', async () => {
        jest.mocked(getCurrentUrl).mockReturnValue('https://new.expensify.com/transition?exitTo=workspace/new&ownerEmail=owner@test.com');

        setUpPoliciesAndNavigate(setUpParams);
        await waitForBatchedUpdates();

        expect(generateDefaultWorkspaceName).toHaveBeenCalledWith('owner@test.com', 'Acme owner', undefined, setUpParams.translate);
        expect(createDraftInitialWorkspace).toHaveBeenCalledWith(expect.objectContaining({workspaceName: 'Acme workspace', policyID: 'generated-policy-id'}));
        expect(createWorkspace).toHaveBeenCalledWith(
            expect.objectContaining({
                policyID: 'generated-policy-id',
                policyOwner: {email: 'owner@test.com', accountID: 2},
                currentUserAccountIDParam: 7,
                currentUserEmailParam: 'session@test.com',
                policyIDsWithIOUReportsParam: undefined,
                delegateAccountID: setUpParams.delegateAccountID,
            }),
        );
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_INITIAL.getRoute('generated-policy-id', ''));
    });

    it('setUpPoliciesAndNavigate only navigates when the exitTo route is not a new workspace', async () => {
        jest.mocked(getCurrentUrl).mockReturnValue('https://new.expensify.com/inbox?exitTo=settings');

        setUpPoliciesAndNavigate(setUpParams);
        await waitForBatchedUpdates();

        expect(createDraftInitialWorkspace).not.toHaveBeenCalled();
        expect(Navigation.navigate).toHaveBeenCalledWith('settings');
    });
});
