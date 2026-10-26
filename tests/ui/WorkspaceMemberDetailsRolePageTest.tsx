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

import {updateWorkspaceMembersRole} from '@libs/actions/Policy/Member';
import Navigation from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
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

import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/actions/Policy/Member', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@libs/actions/Policy/Member');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        updateWorkspaceMembersRole: jest.fn(),
    };
});

TestHelper.setupGlobalFetchMock();

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
});
