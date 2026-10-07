import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {addMembersToWorkspace} from '@libs/actions/Policy/Member';

import WorkspaceInviteMessageComponent from '@pages/workspace/members/WorkspaceInviteMessageComponent';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';
import type {CurrentUserPersonalDetails, PersonalDetailsList} from '@src/types/onyx/PersonalDetails';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import {buildPersonalDetails, translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const POLICY_ID = 'invite-dew-approver-row-test-policy';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_ACCOUNT_ID = 1;
const INVITEE_EMAIL = 'invitee@example.com';
const INVITEE_ACCOUNT_ID = 2;
const MEMBERS_ROUTE = `workspaces/${POLICY_ID}/members` as Route;

jest.mock('@react-navigation/native', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actualNav = jest.requireActual('@react-navigation/native');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actualNav,
        useIsFocused: () => true,
        usePreventRemove: jest.fn(),
    };
});

jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    dismissModal: jest.fn(),
}));

jest.mock('@libs/actions/Policy/Member', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@libs/actions/Policy/Member');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        addMembersToWorkspace: jest.fn(),
    };
});

const addMembersToWorkspaceMock = jest.mocked(addMembersToWorkspace);

/**
 * The backend only returns `dynamicExternalWorkflowHidePeople` when it is `true`, so the cases without the flag omit
 * the field rather than setting it to `false`.
 */
function buildPolicy(policyOverrides: Partial<Policy>): Policy {
    return {
        id: POLICY_ID,
        name: 'Test Workspace',
        type: CONST.POLICY.TYPE.CORPORATE,
        role: CONST.POLICY.ROLE.ADMIN,
        owner: ADMIN_EMAIL,
        employeeList: {
            [ADMIN_EMAIL]: {email: ADMIN_EMAIL, submitsTo: ADMIN_EMAIL, role: CONST.POLICY.ROLE.ADMIN},
        },
        approver: ADMIN_EMAIL,
        areWorkflowsEnabled: true,
        outputCurrency: 'USD',
        avatarURL: '',
        pendingAction: null,
        errors: {},
        ...policyOverrides,
    } as Policy;
}

const currentUserPersonalDetails = {
    accountID: ADMIN_ACCOUNT_ID,
    login: ADMIN_EMAIL,
    email: ADMIN_EMAIL,
    displayName: 'admin',
} as CurrentUserPersonalDetails;

async function renderPage(policy: Policy) {
    await act(async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        await waitForBatchedUpdatesWithAct();
    });
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <WorkspaceInviteMessageComponent
                        policy={policy}
                        policyID={POLICY_ID}
                        backTo={MEMBERS_ROUTE}
                        currentUserPersonalDetails={currentUserPersonalDetails}
                    />
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
    await waitForBatchedUpdatesWithAct();
}

async function pressInvite() {
    fireEvent.press(screen.getByText(translateLocal('common.invite')));
    await waitForBatchedUpdatesWithAct();
}

const queryApproverRow = () => screen.queryByText(translateLocal('workflowsPage.approver'));

describe('WorkspaceInviteMessageComponent - Approver row on Dynamic External Workflow workspaces', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.clear();
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [ADMIN_ACCOUNT_ID]: buildPersonalDetails(ADMIN_EMAIL, ADMIN_ACCOUNT_ID, 'admin'),
                [INVITEE_ACCOUNT_ID]: buildPersonalDetails(INVITEE_EMAIL, INVITEE_ACCOUNT_ID, 'invitee'),
            } satisfies PersonalDetailsList);
            await Onyx.merge(ONYXKEYS.SESSION, {email: ADMIN_EMAIL, accountID: ADMIN_ACCOUNT_ID});
            await Onyx.set(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${POLICY_ID}`, {[INVITEE_EMAIL]: INVITEE_ACCOUNT_ID});
            await waitForBatchedUpdatesWithAct();
        });
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
    });

    it('shows the Approver row and sends the approver on a DEW workspace without "Hide People Table Columns"', async () => {
        // Given a Control workspace using a Dynamic External Workflow that still allows manual approver edits
        await renderPage(buildPolicy({approvalMode: CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL}));

        // Then the admin can see the Approver row, matching Classic where a manager can be set at invite time
        expect(queryApproverRow()).toBeOnTheScreen();

        // When the admin sends the invite
        await pressInvite();

        // Then the default approver is forwarded so the backend sets it as the new member's submitsTo
        expect(addMembersToWorkspaceMock).toHaveBeenCalledTimes(1);
        expect(addMembersToWorkspaceMock.mock.lastCall?.at(-1)).toBe(ADMIN_EMAIL);
    });

    it('hides the Approver row and sends no approver on a DEW workspace with "Hide People Table Columns" set', async () => {
        // Given a DEW workspace whose "Hide People Table Columns" setting blocks manual approval workflow edits
        await renderPage(buildPolicy({approvalMode: CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL, dynamicExternalWorkflowHidePeople: true}));

        // Then the Approver row stays hidden, like every other workflow surface for this setting
        expect(queryApproverRow()).not.toBeOnTheScreen();

        // When the admin sends the invite
        await pressInvite();

        // Then no approver is forwarded, so the invite cannot override the external workflow's routing
        expect(addMembersToWorkspaceMock).toHaveBeenCalledTimes(1);
        expect(addMembersToWorkspaceMock.mock.lastCall?.at(-1)).toBeUndefined();
    });

    it('still shows the Approver row on an Advanced workspace with a stale "Hide People Table Columns" flag', async () => {
        // Given a workspace that moved off its DEW to Advanced approvals but kept the old flag
        await renderPage(buildPolicy({approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED, dynamicExternalWorkflowHidePeople: true}));

        // Then the flag is ignored because it only applies to DEW workspaces
        expect(queryApproverRow()).toBeOnTheScreen();
    });

    it('keeps the Approver row hidden on a Basic workspace', async () => {
        // Given a Control workspace using Basic approvals, where every member submits to the default approver
        await renderPage(buildPolicy({approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC}));

        // Then there is no per-member approver to set, so the row stays hidden
        expect(queryApproverRow()).not.toBeOnTheScreen();
    });
});
