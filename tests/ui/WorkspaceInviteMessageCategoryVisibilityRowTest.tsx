import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import PersonalDetailsByLoginProvider from '@components/PersonalDetailsByLoginProvider';

import {addMembersToWorkspace} from '@libs/actions/Policy/Member';
import type * as MemberActions from '@libs/actions/Policy/Member';

import WorkspaceInviteMessageComponent from '@pages/workspace/members/WorkspaceInviteMessageComponent';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import type {Policy, PolicyCategories} from '@src/types/onyx';
import type {CurrentUserPersonalDetails, PersonalDetailsList} from '@src/types/onyx/PersonalDetails';

import type * as NativeNavigation from '@react-navigation/native';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import type * as MockReanimatedModalModule from '../utils/mockReanimatedModal';

import {buildPersonalDetails, translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const POLICY_ID = 'invite-category-visibility-row-test-policy';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_ACCOUNT_ID = 1;
const INVITEE_EMAIL = 'invitee@example.com';
const INVITEE_ACCOUNT_ID = 2;
const ERRORED_MEMBER_EMAIL = 'errored@example.com';
const ERRORED_MEMBER_ACCOUNT_ID = 3;
const MEMBERS_ROUTE = `workspaces/${POLICY_ID}/members` as Route;

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useIsFocused: () => true,
    usePreventRemove: jest.fn(),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    dismissModal: jest.fn(),
    isTopmostRouteModalScreen: jest.fn(() => false),
}));

jest.mock('@components/Modal/ReanimatedModal', () => {
    const {default: MockReanimatedModal} = jest.requireActual<typeof MockReanimatedModalModule>('../utils/mockReanimatedModal');
    return MockReanimatedModal;
});

jest.mock('@libs/actions/Policy/Member', () => ({
    ...jest.requireActual<typeof MemberActions>('@libs/actions/Policy/Member'),
    addMembersToWorkspace: jest.fn(),
}));

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
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, PersonalDetailsByLoginProvider]}>
            <PortalProvider>
                <ModalProvider>
                    <NavigationContainer>
                        <WorkspaceInviteMessageComponent
                            policy={policy}
                            policyID={POLICY_ID}
                            backTo={MEMBERS_ROUTE}
                            currentUserPersonalDetails={currentUserPersonalDetails}
                        />
                    </NavigationContainer>
                </ModalProvider>
            </PortalProvider>
        </ComposeProviders>,
    );
    await waitForBatchedUpdatesWithAct();
}

async function pressInvite() {
    fireEvent.press(screen.getByText(translateLocal('common.invite')));
    await waitForBatchedUpdatesWithAct();
}

async function setCategoriesAndDraft(policyCategories: PolicyCategories, categoryVisibilityDraft: string[]) {
    await act(async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${POLICY_ID}`, policyCategories);
        await Onyx.set(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_CATEGORY_VISIBILITY_DRAFT}${POLICY_ID}`, categoryVisibilityDraft);
    });
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
                [ERRORED_MEMBER_ACCOUNT_ID]: buildPersonalDetails(ERRORED_MEMBER_EMAIL, ERRORED_MEMBER_ACCOUNT_ID, 'errored'),
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
        await setCategoriesAndDraft(
            {
                Meals: {name: 'Meals', enabled: true},
                Travel: {name: 'Travel', enabled: true},
            },
            ['Meals', 'Travel'],
        );
        await renderPage(buildPolicy());

        // Then the row counts them
        expect(screen.getByText(translateLocal('workspace.people.categoriesCount', {count: 2}))).toBeOnTheScreen();

        // When the admin sends the invite
        await pressInvite();

        // Then the chosen categories go with it, so the backend restricts the new member
        expect(addMembersToWorkspaceMock.mock.lastCall?.[8]?.categoryNames).toEqual(['Meals', 'Travel']);
    });

    it('counts and sends only the chosen categories that are still enabled', async () => {
        // Given the admin limited the members being invited to Meals, Travel and Fuel, and since then another admin
        // disabled Travel and deleted Fuel
        await setCategoriesAndDraft(
            {
                Meals: {name: 'Meals', enabled: true},
                Travel: {name: 'Travel', enabled: false},
            },
            ['Meals', 'Travel', 'Fuel'],
        );
        await renderPage(buildPolicy());

        // Then the row counts only Meals
        expect(screen.getByText(translateLocal('workspace.people.categoriesCount', {count: 1}))).toBeOnTheScreen();

        // When the admin sends the invite
        await pressInvite();

        // Then only Meals goes with it, since the new member can't be limited to a category that's gone
        expect(addMembersToWorkspaceMock.mock.lastCall?.[8]?.categoryNames).toEqual(['Meals']);
    });

    it("doesn't send the invite when every chosen category is gone, since a member needs at least one", async () => {
        // Given the admin limited the members being invited to Travel, which another admin has since disabled
        await setCategoriesAndDraft(
            {
                Meals: {name: 'Meals', enabled: true},
                Travel: {name: 'Travel', enabled: false},
            },
            ['Travel'],
        );
        await renderPage(buildPolicy());

        // When the admin sends the invite
        await pressInvite();

        // Then the same modal as the Category visibility page asks for a category, and nothing is sent
        expect(await screen.findByText(translateLocal('workspace.people.categoryVisibilityRequiredModal.title'))).toBeOnTheScreen();
        expect(addMembersToWorkspaceMock).not.toHaveBeenCalled();
    });

    it('limits categories with every current member, including ones with errors', async () => {
        // Given an existing member whose last change failed, and the admin limited the members being invited to Meals
        await setCategoriesAndDraft({Meals: {name: 'Meals', enabled: true}}, ['Meals']);
        await renderPage(
            buildPolicy({
                employeeList: {
                    [ADMIN_EMAIL]: {email: ADMIN_EMAIL, submitsTo: ADMIN_EMAIL, role: CONST.POLICY.ROLE.ADMIN},
                    [ERRORED_MEMBER_EMAIL]: {email: ERRORED_MEMBER_EMAIL, role: CONST.POLICY.ROLE.USER, errors: {error: 'Role change failed'}},
                },
            }),
        );

        // When the admin sends the invite
        await pressInvite();

        // Then the member with errors is left out of the announce room's members, but counted for category visibility,
        // so limiting the invitees doesn't take any category away from them
        expect(addMembersToWorkspaceMock.mock.lastCall?.[4]).toEqual([ADMIN_ACCOUNT_ID]);
        expect(addMembersToWorkspaceMock.mock.lastCall?.[8]?.categoryVisibilityMemberAccountIDs).toEqual([ADMIN_ACCOUNT_ID, ERRORED_MEMBER_ACCOUNT_ID]);
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
