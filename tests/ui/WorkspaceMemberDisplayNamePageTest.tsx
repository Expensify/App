import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import PersonalDetailsByLoginProvider from '@components/PersonalDetailsByLoginProvider';

import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';

import {WRITE_COMMANDS} from '@libs/API/types';
import Navigation from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import {generateAccountID} from '@libs/UserUtils';

import type {SettingsNavigatorParamList} from '@navigation/types';

import WorkspaceMemberDisplayNamePage from '@pages/workspace/members/WorkspaceMemberDisplayNamePage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {PersonalDetails} from '@src/types/onyx';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import * as LHNTestUtils from '../utils/LHNTestUtils';
import {getPersonalDetailsList, mergePersonalDetailsList, setPersonalDetailsList} from '../utils/PersonalDetailsTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));

TestHelper.setupGlobalFetchMock();

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

const renderPage = (initialParams: SettingsNavigatorParamList[typeof SCREENS.WORKSPACE.DYNAMIC_MEMBER_DISPLAY_NAME]) =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider, PersonalDetailsByLoginProvider, CurrentUserPersonalDetailsProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName={SCREENS.WORKSPACE.DYNAMIC_MEMBER_DISPLAY_NAME}>
                        <Stack.Screen
                            name={SCREENS.WORKSPACE.DYNAMIC_MEMBER_DISPLAY_NAME}
                            component={WorkspaceMemberDisplayNamePage}
                            initialParams={initialParams}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );

const saveName = async () => {
    fireEvent.changeText(screen.getByLabelText('First name'), 'Jane');
    fireEvent.changeText(screen.getByLabelText('Last name'), 'Doe');
    fireEvent.press(screen.getByText('Save'));
    await waitForBatchedUpdatesWithAct();
};

describe('WorkspaceMemberDisplayNamePage', () => {
    const selfAccountID = 1206;
    const selfEmail = 'self@example.com';
    const invitedAccountID = 5555;
    const invitedEmail = 'newmember@example.com';
    const unloadedEmail = 'unloaded@example.com';
    const outsiderEmail = 'outsider@example.com';

    const policy = {
        ...LHNTestUtils.getFakePolicy(),
        role: CONST.POLICY.ROLE.ADMIN,
        owner: selfEmail,
        ownerAccountID: selfAccountID,
        type: CONST.POLICY.TYPE.CORPORATE,
        employeeList: {
            [selfEmail]: {email: selfEmail, role: CONST.POLICY.ROLE.ADMIN},
            [invitedEmail]: {email: invitedEmail, role: CONST.POLICY.ROLE.USER},
            [unloadedEmail]: {email: unloadedEmail, role: CONST.POLICY.ROLE.USER},
        },
    };

    // An invited user without an account has no name yet.
    const invitedPersonalDetails: PersonalDetails = {accountID: invitedAccountID, login: invitedEmail, displayName: invitedEmail};

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await TestHelper.signInWithTestUser(selfAccountID, selfEmail, undefined, 'Self');
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
            // The member with unloadedEmail gets no entry, like a member the backend returned no personal details for.
            await setPersonalDetailsList({
                [selfAccountID]: TestHelper.buildPersonalDetails(selfEmail, selfAccountID, 'Self'),
                [invitedAccountID]: invitedPersonalDetails,
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
        jest.clearAllMocks();
        jest.restoreAllMocks();
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('shows the form and updates the real account when the route keeps the optimistic invite ID', async () => {
        // Given a route that still holds the ID generated from the login while the invite was pending, which has no personal details entry
        const staleOptimisticAccountID = generateAccountID(invitedEmail);
        const {unmount} = renderPage({policyID: policy.id, accountID: String(staleOptimisticAccountID)});
        await waitForBatchedUpdatesWithAct();

        // Then the editor opens, because the member is resolved by login like on Member details
        expect(await screen.findByLabelText('First name')).toBeOnTheScreen();

        // When the admin saves a name while the route still holds the optimistic ID
        await saveName();

        // Then the name is written to the member's real personal details entry, not to the stale ID
        const personalDetailsList = await getPersonalDetailsList();
        expect(personalDetailsList?.[invitedAccountID]?.firstName).toBe('Jane');
        expect(personalDetailsList?.[invitedAccountID]?.lastName).toBe('Doe');
        expect(personalDetailsList?.[staleOptimisticAccountID]).toBeUndefined();
        unmount();
    });

    it('shows the form and saves by login for a member whose personal details did not load', async () => {
        // Given a route with the ID the members list generates for a member that has no personal details
        const {unmount} = renderPage({policyID: policy.id, accountID: String(generateAccountID(unloadedEmail))});
        await waitForBatchedUpdatesWithAct();

        // Then the editor opens, because the login is recovered from the workspace
        expect(await screen.findByLabelText('First name')).toBeOnTheScreen();

        // When the admin saves a name for a member the page only knows by login
        await saveName();

        // Then the request names the member by login, which is how the server finds them
        TestHelper.expectAPICommandToHaveBeenCalledWith(WRITE_COMMANDS.UPDATE_POLICY_MEMBER_DISPLAY_NAME, 0, {policyID: policy.id, email: unloadedEmail, firstName: 'Jane', lastName: 'Doe'});
        unmount();
    });

    it('shows the form for a member opened with their real account ID', async () => {
        // Given a route with the member's real account ID, the path that already worked
        // When the page opens with that ID, so the member is found without the login fallback
        const {unmount} = renderPage({policyID: policy.id, accountID: String(invitedAccountID)});
        await waitForBatchedUpdatesWithAct();

        // Then the editor still opens
        expect(await screen.findByLabelText('First name')).toBeOnTheScreen();
        unmount();
    });

    it('stays blocked when the member found by login already has a name', async () => {
        // Given a stale optimistic route while the member's real entry already has a name
        await act(async () => {
            await mergePersonalDetailsList({[invitedAccountID]: {firstName: 'Jane'}});
        });

        // When the page opens on the stale ID, so the name check has to use the entry found by login
        const {unmount} = renderPage({policyID: policy.id, accountID: String(generateAccountID(invitedEmail))});
        await waitForBatchedUpdatesWithAct();

        // Then the not found page shows, because an admin can only set a name the member has not set
        expect(await screen.findByText("Hmm... it's not here")).toBeOnTheScreen();
        expect(screen.queryByLabelText('First name')).not.toBeOnTheScreen();
        unmount();
    });

    it('stays blocked for an account that is not a workspace member', async () => {
        // Given a route for an account whose login is not in the workspace
        // When the page opens, so the login fallback searches the workspace and finds no member
        const {unmount} = renderPage({policyID: policy.id, accountID: String(generateAccountID(outsiderEmail))});
        await waitForBatchedUpdatesWithAct();

        // Then the not found page shows, so the login fallback does not open the page for non-members
        expect(await screen.findByText("Hmm... it's not here")).toBeOnTheScreen();
        expect(screen.queryByLabelText('First name')).not.toBeOnTheScreen();
        unmount();
    });
});
