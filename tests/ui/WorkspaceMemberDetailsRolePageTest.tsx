import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import PersonalDetailsByLoginProvider from '@components/PersonalDetailsByLoginProvider';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';

import OnyxUpdateManager from '@libs/actions/OnyxUpdateManager';
import {addMembersToWorkspace, updateWorkspaceMembersRole} from '@libs/actions/Policy/Member';
import type * as PolicyMemberActions from '@libs/actions/Policy/Member';
import {WRITE_COMMANDS} from '@libs/API/types';
import Navigation from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import {flush as flushSequentialQueue} from '@libs/Network/SequentialQueue';
import {getPersonalDetailsOnyxDataForOptimisticUsers} from '@libs/PersonalDetailsUtils';
import {generateAccountID} from '@libs/UserUtils';

import type {SettingsNavigatorParamList} from '@navigation/types';

import WorkspaceMemberDetailsRolePage from '@pages/workspace/members/WorkspaceMemberDetailsRolePage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/actions/Policy/Member', () => {
    const actual = jest.requireActual<typeof PolicyMemberActions>('@libs/actions/Policy/Member');
    return {
        ...actual,
        updateWorkspaceMembersRole: jest.fn(),
    };
});

const mockFetch = TestHelper.setupGlobalFetchMock();
OnyxUpdateManager();

const updateWorkspaceMembersRoleMock = jest.mocked(updateWorkspaceMembersRole);

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

const renderPage = (initialParams: SettingsNavigatorParamList[typeof SCREENS.WORKSPACE.MEMBER_DETAILS_ROLE]) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider, CurrentReportIDContextProvider, ModalProvider, PersonalDetailsByLoginProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName={SCREENS.WORKSPACE.MEMBER_DETAILS_ROLE}>
                        <Stack.Screen
                            name={SCREENS.WORKSPACE.MEMBER_DETAILS_ROLE}
                            component={WorkspaceMemberDetailsRolePage}
                            initialParams={initialParams}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
};

describe('WorkspaceMemberDetailsRolePage', () => {
    const ownerAccountID = 1;
    const ownerEmail = 'owner@example.com';
    const selfAccountID = 1206;
    const selfEmail = 'self@example.com';
    const invitedAccountID = 5555;
    const invitedEmail = 'newmember@example.com';

    const policy = {
        ...LHNTestUtils.getFakePolicy(),
        role: CONST.POLICY.ROLE.ADMIN,
        owner: ownerEmail,
        ownerAccountID,
        type: CONST.POLICY.TYPE.CORPORATE,
        employeeList: {
            [ownerEmail]: {email: ownerEmail, role: CONST.POLICY.ROLE.ADMIN},
            [selfEmail]: {email: selfEmail, role: CONST.POLICY.ROLE.ADMIN},
            [invitedEmail]: {email: invitedEmail, role: CONST.POLICY.ROLE.USER},
        },
    };

    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(async () => {
        mockFetch.succeed();
        await TestHelper.signInWithTestUser(selfAccountID, selfEmail, undefined, 'Self');
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
            await Onyx.set(`${ONYXKEYS.PERSONAL_DETAILS_LIST}`, {
                [ownerAccountID]: TestHelper.buildPersonalDetails(ownerEmail, ownerAccountID, 'Owner'),
                [selfAccountID]: TestHelper.buildPersonalDetails(selfEmail, selfAccountID, 'Self'),
                [invitedAccountID]: TestHelper.buildPersonalDetails(invitedEmail, invitedAccountID, 'Invited'),
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
        });
        const responsiveLayout: ResponsiveLayoutResult = {
            shouldUseNarrowLayout: false,
            isSmallScreenWidth: false,
            isInNarrowPaneModal: false,
            isExtraSmallScreenHeight: false,
            isMediumScreenWidth: false,
            isLargeScreenWidth: true,
            isExtraLargeScreenWidth: false,
            isExtraSmallScreenWidth: false,
            isSmallScreen: false,
            onboardingIsMediumOrLargerScreenWidth: true,
            isInLandscapeMode: false,
        };
        jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue(responsiveLayout);
        jest.spyOn(Navigation, 'goBack').mockImplementation(() => {});
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

    it('should keep showing the role list when the route holds a stale optimistic accountID', async () => {
        // Given a Role page opened while the invite was in flight, so its route accountID is the login-derived
        // optimistic one, which no longer has a personal details entry after the backend swaps in the real accountID
        const staleOptimisticAccountID = generateAccountID(invitedEmail);

        // When the page renders
        const {unmount} = renderPage({policyID: policy.id, accountID: String(staleOptimisticAccountID)});
        await waitForBatchedUpdatesWithAct();

        // Then the member is still resolved from the employee list, so the role list shows instead of the not found page
        await waitFor(() => {
            expect(screen.getByTestId('WorkspaceMemberDetailsRolePage')).toBeOnTheScreen();
        });
        expect(screen.getByText('Workspace admin')).toBeOnTheScreen();
        expect(screen.queryByTestId('NotFoundPage')).not.toBeOnTheScreen();

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it.each([true, false])('handles an offline secondary-login invite when success is %s and no primary login mapping is returned', async (isSuccess) => {
        // Given an offline invite whose Role page resolves the optimistic secondary login before the request completes
        const secondaryEmail = 'secondary@example.com';
        const primaryEmail = 'primary@example.com';
        const primaryAccountID = 7777;
        const optimisticAccountID = generateAccountID(secondaryEmail);
        mockFetch.pause();
        mockFetch.mockAPICommand(WRITE_COMMANDS.ADD_MEMBERS_TO_WORKSPACE, () => ({
            jsonCode: isSuccess ? 200 : 400,
            onyxData: isSuccess
                ? [
                      {
                          onyxMethod: Onyx.METHOD.MERGE,
                          key: `${ONYXKEYS.COLLECTION.POLICY}${policy.id}`,
                          value: {employeeList: {[secondaryEmail]: null, [primaryEmail]: {email: primaryEmail, role: CONST.POLICY.ROLE.USER}}},
                      },
                      {
                          onyxMethod: Onyx.METHOD.MERGE,
                          key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                          value: {[primaryAccountID]: TestHelper.buildPersonalDetails(primaryEmail, primaryAccountID, 'Primary')},
                      },
                  ]
                : [],
        }));
        await act(async () => {
            await Onyx.merge(ONYXKEYS.NETWORK, {shouldForceOffline: true});
            addMembersToWorkspace(
                {[secondaryEmail]: optimisticAccountID},
                getPersonalDetailsOnyxDataForOptimisticUsers([secondaryEmail], [optimisticAccountID], (login) => login),
                '',
                policy,
                [ownerAccountID, selfAccountID],
                CONST.POLICY.ROLE.USER,
                {accountID: selfAccountID, email: selfEmail, displayName: 'Self'},
                {},
            );
        });
        const {unmount} = renderPage({policyID: policy.id, accountID: String(optimisticAccountID)});
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByTestId('WorkspaceMemberDetailsRolePage')).toBeOnTheScreen();
        expect(Navigation.goBack).not.toHaveBeenCalled();

        // When reconnecting processes the real invite request without primaryLoginsInvited
        await act(async () => {
            await Onyx.merge(ONYXKEYS.NETWORK, {shouldForceOffline: false});
            await mockFetch.resume();
            flushSequentialQueue();
        });
        await waitForBatchedUpdatesWithAct();

        // Then a successful alias swap returns to Members, while a failed invite stays editable with its error intact
        const syncedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
        TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.ADD_MEMBERS_TO_WORKSPACE, 1);
        expect(syncedPolicy?.primaryLoginsInvited).toBeUndefined();
        if (isSuccess) {
            await waitFor(() => expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.WORKSPACE_MEMBERS.getRoute(policy.id)));
            expect(syncedPolicy?.employeeList?.[primaryEmail]?.role).toBe(CONST.POLICY.ROLE.USER);
            expect((await getOnyxValue(ONYXKEYS.PERSONAL_DETAILS_LIST))?.[optimisticAccountID]).toBeFalsy();
        } else {
            expect(syncedPolicy?.employeeList?.[secondaryEmail]?.errors).toBeTruthy();
            expect(screen.getByTestId('WorkspaceMemberDetailsRolePage')).toBeOnTheScreen();
            expect(Navigation.goBack).not.toHaveBeenCalled();
        }
        expect(screen.queryByTestId('NotFoundPage')).not.toBeOnTheScreen();
        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('shows not found for a member that never resolved', async () => {
        // Given a direct link that does not identify any workspace member
        const unknownAccountID = generateAccountID('unknown@example.com');

        // When opening the Role page without a prior successful member lookup
        const {unmount} = renderPage({policyID: policy.id, accountID: String(unknownAccountID)});
        await waitForBatchedUpdatesWithAct();

        // Then the invalid link still shows not found instead of returning to Members
        expect(screen.getByTestId('NotFoundPage')).toBeOnTheScreen();
        expect(Navigation.goBack).not.toHaveBeenCalled();
        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should update the role with the real accountID when the route holds a stale optimistic accountID', async () => {
        // Given a Role page whose route still holds the optimistic accountID of a member whose invite has completed
        const staleOptimisticAccountID = generateAccountID(invitedEmail);
        const {unmount} = renderPage({policyID: policy.id, accountID: String(staleOptimisticAccountID)});
        await waitForBatchedUpdatesWithAct();

        // When the admin picks a new role for the member and saves it
        await waitFor(() => {
            expect(screen.getByText('Workspace admin')).toBeOnTheScreen();
        });
        fireEvent.press(screen.getByText('Workspace admin'));
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByText(TestHelper.translateLocal('common.save')));
        await waitForBatchedUpdatesWithAct();

        // Then the update targets the member's real accountID, not the stale optimistic one, so the backend receives a valid member
        expect(updateWorkspaceMembersRoleMock).toHaveBeenCalledWith(expect.objectContaining({id: policy.id}), [invitedEmail], [invitedAccountID], CONST.POLICY.ROLE.ADMIN);

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should go back to the details route that holds the stale optimistic accountID', async () => {
        // Given a Role page opened from a details screen whose route still holds the member's optimistic accountID
        const staleOptimisticAccountID = generateAccountID(invitedEmail);
        const {unmount} = renderPage({policyID: policy.id, accountID: String(staleOptimisticAccountID)});
        await waitForBatchedUpdatesWithAct();

        // When the admin picks a new role for the member and saves it
        await waitFor(() => {
            expect(screen.getByText('Workspace admin')).toBeOnTheScreen();
        });
        fireEvent.press(screen.getByText('Workspace admin'));
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByText(TestHelper.translateLocal('common.save')));
        await waitForBatchedUpdatesWithAct();

        // Then going back targets the details route with the stale accountID, so it pops to the details screen below instead of
        // replacing the Role page with a second details screen for the real accountID
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policy.id, staleOptimisticAccountID));

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    describe('when the invite used a secondary login', () => {
        const primaryAccountID = 7777;
        const primaryEmail = 'primary@example.com';
        const secondaryEmail = 'secondary@example.com';
        const optimisticAccountID = generateAccountID(secondaryEmail);

        beforeEach(async () => {
            // The backend lists the member under their primary login and records which secondary login was invited
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, {
                    primaryLoginsInvited: {[secondaryEmail]: primaryEmail},
                    employeeList: {[primaryEmail]: {email: primaryEmail, role: CONST.POLICY.ROLE.USER}},
                });
                await Onyx.merge(`${ONYXKEYS.PERSONAL_DETAILS_LIST}`, {
                    [primaryAccountID]: TestHelper.buildPersonalDetails(primaryEmail, primaryAccountID, 'Primary'),
                });
            });
        });

        it('should keep showing the role list and update the primary member after the invite syncs', async () => {
            // Given a Role page whose route holds the optimistic accountID of the secondary login, which has no personal details entry
            // once the invite syncs
            const {unmount} = renderPage({policyID: policy.id, accountID: String(optimisticAccountID)});
            await waitForBatchedUpdatesWithAct();

            // When the admin picks a new role for the member and saves it
            await waitFor(() => {
                expect(screen.getByText('Workspace admin')).toBeOnTheScreen();
            });
            expect(screen.queryByTestId('NotFoundPage')).not.toBeOnTheScreen();
            fireEvent.press(screen.getByText('Workspace admin'));
            await waitForBatchedUpdatesWithAct();
            fireEvent.press(screen.getByText(TestHelper.translateLocal('common.save')));
            await waitForBatchedUpdatesWithAct();

            // Then the update targets the primary login and real accountID the member is listed under
            expect(updateWorkspaceMembersRoleMock).toHaveBeenCalledWith(expect.objectContaining({id: policy.id}), [primaryEmail], [primaryAccountID], CONST.POLICY.ROLE.ADMIN);

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should keep showing the role list while the optimistic personal details still hold the secondary login', async () => {
            // Given the backend already listed the member under their primary login, but the optimistic personal details entry
            // with the secondary login hasn't been cleaned up yet
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.PERSONAL_DETAILS_LIST}`, {
                    [optimisticAccountID]: TestHelper.buildPersonalDetails(secondaryEmail, optimisticAccountID, 'Secondary'),
                });
            });

            // When the page renders
            const {unmount} = renderPage({policyID: policy.id, accountID: String(optimisticAccountID)});
            await waitForBatchedUpdatesWithAct();

            // Then the secondary login is mapped to the primary member, so the role list shows instead of the not found page
            await waitFor(() => {
                expect(screen.getByTestId('WorkspaceMemberDetailsRolePage')).toBeOnTheScreen();
            });
            expect(screen.getByText('Workspace admin')).toBeOnTheScreen();
            expect(screen.queryByTestId('NotFoundPage')).not.toBeOnTheScreen();

            unmount();
            await waitForBatchedUpdatesWithAct();
        });
    });
});
