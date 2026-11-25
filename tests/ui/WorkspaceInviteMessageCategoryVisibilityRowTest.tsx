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

const POLICY_ID = 'invite-category-visibility-row-test-policy';
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

function buildPolicy(policyOverrides: Partial<Policy> = {}): Policy {
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
        areCategoriesEnabled: true,
        outputCurrency: 'USD',
        avatarURL: '',
        pendingAction: null,
        errors: {},
        ...policyOverrides,
    };
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

const queryCategoryVisibilityRow = () => screen.queryByText(translateLocal('workspace.people.categoryVisibility'));
const queryRoleRow = () => screen.queryByText(translateLocal('common.role'));

describe('WorkspaceInviteMessageComponent - Category visibility row', () => {
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

    it('shows All categories and sends no categories when the admin leaves the row alone', async () => {
        // Given a Control workspace admin inviting a member, with categories enabled and no category choice yet
        await renderPage(buildPolicy());

        // Then the row says the new member can use every category
        expect(queryCategoryVisibilityRow()).toBeOnTheScreen();
        expect(screen.getByText(translateLocal('workspace.people.allCategories'))).toBeOnTheScreen();

        // When the admin sends the invite
        await pressInvite();

        // Then no categories are passed, so the new member is unrestricted
        expect(addMembersToWorkspaceMock).toHaveBeenCalledTimes(1);
        // The categories are passed in the options object, the last argument.
        expect(addMembersToWorkspaceMock.mock.lastCall?.[8]?.categoryNames).toBeUndefined();
    });

    it('shows the number of chosen categories and sends them with the invite', async () => {
        // Given the admin limited the members being invited to Meals and Travel
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_CATEGORY_VISIBILITY_DRAFT}${POLICY_ID}`, ['Meals', 'Travel']);
        });
        await renderPage(buildPolicy());

        // Then the row counts them
        expect(screen.getByText(translateLocal('workspace.people.categoriesCount', {count: 2}))).toBeOnTheScreen();

        // When the admin sends the invite
        await pressInvite();

        // Then the chosen categories go with it, so the backend restricts the new member
        expect(addMembersToWorkspaceMock.mock.lastCall?.[8]?.categoryNames).toEqual(['Meals', 'Travel']);
    });

    it('hides the row from a People Admin', async () => {
        // Given a People Admin, who can invite members but not manage categories
        await renderPage(
            buildPolicy({
                role: CONST.POLICY.ROLE.PEOPLE_ADMIN,
                employeeList: {[ADMIN_EMAIL]: {email: ADMIN_EMAIL, submitsTo: ADMIN_EMAIL, role: CONST.POLICY.ROLE.PEOPLE_ADMIN}},
            }),
        );

        // Then the confirmation page shows, but without the Category visibility row
        expect(queryRoleRow()).toBeOnTheScreen();
        expect(queryCategoryVisibilityRow()).not.toBeOnTheScreen();
    });

    it('hides the row on a Collect workspace', async () => {
        // Given a Collect workspace, where category visibility isn't available
        await renderPage(buildPolicy({type: CONST.POLICY.TYPE.TEAM}));

        // Then the confirmation page shows, but without the Category visibility row
        expect(queryRoleRow()).toBeOnTheScreen();
        expect(queryCategoryVisibilityRow()).not.toBeOnTheScreen();
    });

    it('hides the row when categories are turned off', async () => {
        // Given a Control workspace with the Categories feature off
        await renderPage(buildPolicy({areCategoriesEnabled: false}));

        // Then there are no categories to choose from, so the row is hidden
        expect(queryRoleRow()).toBeOnTheScreen();
        expect(queryCategoryVisibilityRow()).not.toBeOnTheScreen();
    });
});
