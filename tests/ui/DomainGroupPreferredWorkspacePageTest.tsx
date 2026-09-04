import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import DomainGroupCreatePreferredWorkspacePage from '@pages/domain/Groups/DomainGroupCreatePreferredWorkspacePage';
import DomainGroupPreferredWorkspacePage from '@pages/domain/Groups/DomainGroupPreferredWorkspacePage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {DomainSecurityGroup, Policy} from '@src/types/onyx';
import type Domain from '@src/types/onyx/Domain';
import type {SecurityGroupKey} from '@src/types/onyx/Domain';
import type DomainPendingAction from '@src/types/onyx/DomainPendingActions';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import getOnyxValue from '../utils/getOnyxValue';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/RenderHTML', () => () => null);

const DOMAIN_ACCOUNT_ID = 123456;
const TEST_USER_ACCOUNT_ID = 1;
const GROUP_ID = 'group1';

// Makes the signed-in test user an admin of the domain, so DomainNotFoundPageWrapper renders the page
const DOMAIN_ADMIN_ACCESS = {
    [`${CONST.DOMAIN.EXPENSIFY_ADMIN_ACCESS_PREFIX}0`]: TEST_USER_ACCOUNT_ID,
};

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

/**
 * Builds `count` admin workspaces named "Workspace 01".."Workspace NN" whose `created` timestamps run in the
 * opposite order to their names, so a name sort and a creation-date sort produce visibly different lists.
 */
function buildAdminPolicies(count: number) {
    const policies: Record<string, Policy> = {};
    for (let i = 1; i <= count; i++) {
        const policyID = `policy${String(i).padStart(2, '0')}`;
        policies[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`] = {
            ...createRandomPolicy(i, CONST.POLICY.TYPE.TEAM, `Workspace ${String(i).padStart(2, '0')}`),
            id: policyID,
            role: CONST.POLICY.ROLE.ADMIN,
            created: `2026-01-${String(count - i + 1).padStart(2, '0')} 00:00:00`,
        };
    }
    return policies;
}

async function setUpDomainAdminWithPolicies(policyCount: number) {
    await TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID);
    await act(async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, {
            accountID: DOMAIN_ACCOUNT_ID,
            email: 'user@test.com',
            ...DOMAIN_ADMIN_ACCESS,
        });
        await Onyx.mergeCollection(ONYXKEYS.COLLECTION.POLICY, buildAdminPolicies(policyCount));
    });
    await waitForBatchedUpdatesWithAct();
}

/** Merges a security group entry for the domain, so the edit page under test finds an existing group. */
async function setUpSecurityGroup(groupID: string, group: Partial<DomainSecurityGroup>) {
    const securityGroupKey: SecurityGroupKey = `${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}${groupID}`;
    const domainUpdate: Partial<Domain> = {};
    domainUpdate[securityGroupKey] = {
        enableRestrictedPrimaryLogin: false,
        enableRestrictedPolicyCreation: false,
        shared: {},
        ...group,
    };
    await act(async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, domainUpdate);
    });
    await waitForBatchedUpdatesWithAct();
}

/** Marks the security group as pending deletion, which is one of the ways the edit page blocks access. */
async function setGroupPendingDelete(groupID: string) {
    const securityGroupKey: SecurityGroupKey = `${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}${groupID}`;
    const pendingActionsUpdate: Partial<DomainPendingAction> = {};
    pendingActionsUpdate[securityGroupKey] = {
        deleteGroup: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
    };
    await act(async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${DOMAIN_ACCOUNT_ID}`, pendingActionsUpdate);
    });
    await waitForBatchedUpdatesWithAct();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderPage(screenName: keyof SettingsNavigatorParamList, component: React.ComponentType<any>, initialParams: Record<string, unknown>) {
    const result = render(
        <ComposeProviders components={[OnyxListItemProvider, CurrentUserPersonalDetailsProvider, LocaleContextProvider]}>
            <PortalProvider>
                <NavigationContainer ref={navigationRef}>
                    <Stack.Navigator initialRouteName={screenName}>
                        <Stack.Screen
                            name={screenName}
                            component={component}
                            initialParams={initialParams}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
    return result;
}

function renderCreatePreferredWorkspacePage() {
    return renderPage(SCREENS.DOMAIN.GROUP_CREATE_PREFERRED_WORKSPACE, DomainGroupCreatePreferredWorkspacePage, {domainAccountID: DOMAIN_ACCOUNT_ID});
}

function renderEditPreferredWorkspacePage(groupID = GROUP_ID) {
    return renderPage(SCREENS.DOMAIN.SECURITY_GROUPS_PREFERRED_WORKSPACE, DomainGroupPreferredWorkspacePage, {domainAccountID: DOMAIN_ACCOUNT_ID, groupID});
}

function getRenderedWorkspaceIDs() {
    return screen.getAllByTestId(new RegExp(`^${CONST.BASE_LIST_ITEM_TEST_ID}`)).map((item) => String(item.props.testID).replace(CONST.BASE_LIST_ITEM_TEST_ID, ''));
}

describe('Domain group preferred workspace pages', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    describe('DomainGroupCreatePreferredWorkspacePage', () => {
        it('shows a search input and filters the workspaces by name once the list is long enough', async () => {
            // Given a domain admin with more workspaces than the standard list item limit
            await setUpDomainAdminWithPolicies(CONST.STANDARD_LIST_ITEM_LIMIT + 3);

            // When the preferred workspace selector is opened
            renderCreatePreferredWorkspacePage();
            await waitForBatchedUpdatesWithAct();

            // Then a search input is rendered
            const input = screen.getByTestId('selection-list-text-input');
            expect(input).toBeTruthy();

            // When a workspace name is searched for
            fireEvent.changeText(input, 'Workspace 05');

            // Then only the matching workspace is left in the list
            await waitFor(() => {
                expect(getRenderedWorkspaceIDs()).toEqual(['policy05']);
            });

            // When a query that matches nothing is searched for
            fireEvent.changeText(input, 'nonexistent workspace');

            // Then the list is empty and the no results message is shown (it is aria-hidden, hence includeHiddenElements)
            await waitFor(() => {
                expect(screen.getByText('No results found', {includeHiddenElements: true})).toBeTruthy();
            });
            expect(screen.queryByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}policy05`)).toBeNull();
        });

        it('does not show a search input when the list is short', async () => {
            // Given a domain admin with fewer workspaces than the standard list item limit
            await setUpDomainAdminWithPolicies(CONST.STANDARD_LIST_ITEM_LIMIT - 1);

            // When the preferred workspace selector is opened
            renderCreatePreferredWorkspacePage();
            await waitForBatchedUpdatesWithAct();

            // Then no search input is rendered, but the workspaces still are
            expect(screen.queryByTestId('selection-list-text-input')).toBeNull();
            expect(getRenderedWorkspaceIDs()).toHaveLength(CONST.STANDARD_LIST_ITEM_LIMIT - 1);
        });

        it('keeps sorting the workspaces by creation date, in parity with OldDot', async () => {
            // Given a domain admin whose workspaces were created in the reverse order of their names
            await setUpDomainAdminWithPolicies(3);

            // When the preferred workspace selector is opened
            renderCreatePreferredWorkspacePage();
            await waitForBatchedUpdatesWithAct();

            // Then the workspaces are listed oldest first, not alphabetically
            expect(getRenderedWorkspaceIDs()).toEqual(['policy03', 'policy02', 'policy01']);
        });

        it('stores the picked workspace when a row is selected', async () => {
            // Given a domain admin with a few workspaces
            await setUpDomainAdminWithPolicies(3);
            renderCreatePreferredWorkspacePage();
            await waitForBatchedUpdatesWithAct();

            // When a workspace row is pressed
            fireEvent.press(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}policy02`));
            await waitForBatchedUpdatesWithAct();

            // Then the picked workspace is stored as the preferred one for the group being created
            await expect(getOnyxValue(ONYXKEYS.DOMAIN_GROUP_CREATE_PREFERRED_POLICY_ID)).resolves.toBe('policy02');
        });
    });

    describe('DomainGroupPreferredWorkspacePage', () => {
        it("preselects the group's current preferred workspace and stores the newly picked one via updateDomainSecurityGroup", async () => {
            // Given a domain admin with an existing security group whose preferred workspace is already set
            await setUpDomainAdminWithPolicies(3);
            await setUpSecurityGroup(GROUP_ID, {restrictedPrimaryPolicyID: 'policy01'});

            // When the preferred workspace selector is opened for that group
            renderEditPreferredWorkspacePage();
            await waitForBatchedUpdatesWithAct();

            // Then the page renders normally, with the group's current preferred workspace preselected
            expect(getRenderedWorkspaceIDs()).toHaveLength(3);
            expect(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}policy01`).props.accessibilityState).toMatchObject({selected: true});

            // When a different workspace row is pressed
            fireEvent.press(screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}policy02`));
            await waitForBatchedUpdatesWithAct();

            // Then the group's restrictedPrimaryPolicyID is updated in place, instead of a separate draft key
            const domain = await getOnyxValue(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`);
            expect(domain?.[`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}${GROUP_ID}`]).toMatchObject({restrictedPrimaryPolicyID: 'policy02'});
        });

        it('blocks access when the security group does not exist', async () => {
            // Given a domain admin, but no security group matching the groupID in the route
            await setUpDomainAdminWithPolicies(3);

            // When the preferred workspace selector is opened for that non-existent group
            renderEditPreferredWorkspacePage();
            await waitForBatchedUpdatesWithAct();

            // Then the not found page is shown instead of the workspace selector
            expect(screen.getByTestId('NotFoundPage')).toBeTruthy();
            expect(screen.queryByTestId('DomainGroupPreferredWorkspacePage')).toBeNull();
        });

        it('blocks access when the security group has a pending delete action', async () => {
            // Given a domain admin whose security group is in the middle of being deleted
            await setUpDomainAdminWithPolicies(3);
            await setUpSecurityGroup(GROUP_ID, {restrictedPrimaryPolicyID: 'policy01'});
            await setGroupPendingDelete(GROUP_ID);

            // When the preferred workspace selector is opened for that group
            renderEditPreferredWorkspacePage();
            await waitForBatchedUpdatesWithAct();

            // Then the not found page is shown instead of the workspace selector
            expect(screen.getByTestId('NotFoundPage')).toBeTruthy();
            expect(screen.queryByTestId('DomainGroupPreferredWorkspacePage')).toBeNull();
        });
    });
});
