import {act, render, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';

import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import {generateAccountID} from '@libs/UserUtils';

import type {SettingsNavigatorParamList} from '@navigation/types';

import WorkspaceMemberDetailsPage from '@pages/workspace/members/WorkspaceMemberDetailsPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@src/components/ConfirmedRoute.tsx');

TestHelper.setupGlobalFetchMock();

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

const renderPage = (initialParams: SettingsNavigatorParamList[typeof SCREENS.WORKSPACE.MEMBER_DETAILS]) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider, ModalProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName={SCREENS.WORKSPACE.MEMBER_DETAILS}>
                        <Stack.Screen
                            name={SCREENS.WORKSPACE.MEMBER_DETAILS}
                            component={WorkspaceMemberDetailsPage}
                            initialParams={initialParams}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
};

describe('WorkspaceMemberDetailsPage', () => {
    const ownerAccountID = 1;
    const ownerEmail = 'owner@example.com';
    const selfAccountID = 1206;
    const selfEmail = 'self@example.com';
    const invitedAccountID = 5555;
    const invitedEmail = 'newmember@example.com';
    const phoneAccountID = 6666;
    const phoneNumber = '+15005550006';
    const phoneLogin = `${phoneNumber}${CONST.SMS.DOMAIN}`;
    const primaryAccountID = 7777;
    const primaryEmail = 'primary@example.com';
    const secondaryEmail = 'secondary@example.com';

    const policy = {
        ...LHNTestUtils.getFakePolicy(),
        role: CONST.POLICY.ROLE.ADMIN,
        owner: ownerEmail,
        ownerAccountID,
        type: CONST.POLICY.TYPE.CORPORATE,
        primaryLoginsInvited: {
            [secondaryEmail]: primaryEmail,
        },
        employeeList: {
            [ownerEmail]: {email: ownerEmail, role: CONST.POLICY.ROLE.ADMIN},
            [selfEmail]: {email: selfEmail, role: CONST.POLICY.ROLE.ADMIN},
            [invitedEmail]: {email: invitedEmail, role: CONST.POLICY.ROLE.USER},
            [phoneLogin]: {email: phoneLogin, role: CONST.POLICY.ROLE.USER},
            [primaryEmail]: {email: primaryEmail, role: CONST.POLICY.ROLE.USER},
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
                [phoneAccountID]: TestHelper.buildPersonalDetails(phoneLogin, phoneAccountID, 'Phone'),
                [primaryAccountID]: TestHelper.buildPersonalDetails(primaryEmail, primaryAccountID, 'Primary'),
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
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    it('should show the member details when the route accountID matches their personal details entry', async () => {
        const {unmount} = renderPage({policyID: policy.id, accountID: String(invitedAccountID)});
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByTestId('WorkspaceMemberDetailsPage')).toBeOnTheScreen();
        });
        expect(screen.getAllByText('Invited User').length).toBeGreaterThan(0);
        expect(screen.queryByTestId('NotFoundPage')).not.toBeOnTheScreen();

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should keep showing the member details when the route holds a stale optimistic accountID', async () => {
        // The route mimics a details page opened while the invite was in flight: its accountID is the
        // login-derived optimistic one, which no longer has a personal details entry after the swap.
        const staleOptimisticAccountID = generateAccountID(invitedEmail);
        const {unmount} = renderPage({policyID: policy.id, accountID: String(staleOptimisticAccountID)});
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByTestId('WorkspaceMemberDetailsPage')).toBeOnTheScreen();
        });
        expect(screen.getAllByText('Invited User').length).toBeGreaterThan(0);
        expect(screen.queryByTestId('NotFoundPage')).not.toBeOnTheScreen();

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should keep showing the member details when the stale optimistic accountID was derived without the SMS domain', async () => {
        const staleOptimisticAccountID = generateAccountID(phoneNumber);
        const {unmount} = renderPage({policyID: policy.id, accountID: String(staleOptimisticAccountID)});
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByTestId('WorkspaceMemberDetailsPage')).toBeOnTheScreen();
        });
        expect(screen.getAllByText('Phone User').length).toBeGreaterThan(0);
        expect(screen.queryByTestId('NotFoundPage')).not.toBeOnTheScreen();

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should resolve the primary member when the stale optimistic accountID was derived from an invited secondary login', async () => {
        // Inviting a secondary login lists the member under their primary login, so the stale route ID only
        // matches through the secondary-to-primary mapping the backend records.
        const staleOptimisticAccountID = generateAccountID(secondaryEmail);
        const {unmount} = renderPage({policyID: policy.id, accountID: String(staleOptimisticAccountID)});
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByTestId('WorkspaceMemberDetailsPage')).toBeOnTheScreen();
        });
        expect(screen.getAllByText('Primary User').length).toBeGreaterThan(0);
        expect(screen.queryByTestId('NotFoundPage')).not.toBeOnTheScreen();

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should show the not found page when the accountID matches no workspace member', async () => {
        const {unmount} = renderPage({policyID: policy.id, accountID: '999999'});
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByTestId('NotFoundPage')).toBeOnTheScreen();
        });
        expect(screen.queryByTestId('WorkspaceMemberDetailsPage')).not.toBeOnTheScreen();

        unmount();
        await waitForBatchedUpdatesWithAct();
    });
});
