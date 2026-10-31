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

import {updateMemberCustomField} from '@libs/actions/Policy/Policy';
import Navigation from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import {generateAccountID} from '@libs/UserUtils';

import type {SettingsNavigatorParamList} from '@navigation/types';

import WorkspaceMemberCustomFieldPage from '@pages/workspace/members/WorkspaceMemberCustomFieldPage';

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

jest.mock('@libs/actions/Policy/Policy', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@libs/actions/Policy/Policy');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        updateMemberCustomField: jest.fn(),
    };
});

TestHelper.setupGlobalFetchMock();

const updateMemberCustomFieldMock = jest.mocked(updateMemberCustomField);

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

const renderPage = (initialParams: SettingsNavigatorParamList[typeof SCREENS.WORKSPACE.MEMBER_CUSTOM_FIELD]) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider, CurrentReportIDContextProvider, ModalProvider, PersonalDetailsByLoginProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName={SCREENS.WORKSPACE.MEMBER_CUSTOM_FIELD}>
                        <Stack.Screen
                            name={SCREENS.WORKSPACE.MEMBER_CUSTOM_FIELD}
                            component={WorkspaceMemberCustomFieldPage}
                            initialParams={initialParams}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
};

describe('WorkspaceMemberCustomFieldPage', () => {
    const ownerAccountID = 1;
    const ownerEmail = 'owner@example.com';
    const selfAccountID = 1206;
    const selfEmail = 'self@example.com';
    const invitedAccountID = 5555;
    const invitedEmail = 'newmember@example.com';
    const invitedEmployeeUserID = 'EMP-42';

    const policy = {
        ...LHNTestUtils.getFakePolicy(),
        role: CONST.POLICY.ROLE.ADMIN,
        owner: ownerEmail,
        ownerAccountID,
        type: CONST.POLICY.TYPE.CORPORATE,
        employeeList: {
            [ownerEmail]: {email: ownerEmail, role: CONST.POLICY.ROLE.ADMIN},
            [selfEmail]: {email: selfEmail, role: CONST.POLICY.ROLE.ADMIN},
            [invitedEmail]: {email: invitedEmail, role: CONST.POLICY.ROLE.USER, employeeUserID: invitedEmployeeUserID},
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

    it('should show the member custom field value when the route holds a stale optimistic accountID', async () => {
        // Given a custom field page opened while the invite was in flight, so its route accountID is the login-derived
        // optimistic one, which no longer has a personal details entry after the backend swaps in the real accountID
        const staleOptimisticAccountID = generateAccountID(invitedEmail);

        // When the page renders
        const {unmount} = renderPage({policyID: policy.id, accountID: String(staleOptimisticAccountID), customFieldType: 'customField1'});
        await waitForBatchedUpdatesWithAct();

        // Then the member is still resolved from the employee list, so their saved value prefills the input
        await waitFor(() => {
            expect(screen.getByDisplayValue(invitedEmployeeUserID)).toBeOnTheScreen();
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should save for the member and go back to the details route that holds the stale optimistic accountID', async () => {
        // Given a custom field page whose route still holds the optimistic accountID of a member whose invite has completed
        const staleOptimisticAccountID = generateAccountID(invitedEmail);
        const {unmount} = renderPage({policyID: policy.id, accountID: String(staleOptimisticAccountID), customFieldType: 'customField1'});
        await waitForBatchedUpdatesWithAct();

        // When the admin edits the value and saves it
        await waitFor(() => {
            expect(screen.getByDisplayValue(invitedEmployeeUserID)).toBeOnTheScreen();
        });
        fireEvent.changeText(screen.getByDisplayValue(invitedEmployeeUserID), 'EMP-43');
        fireEvent.press(screen.getByText('Save'));
        await waitForBatchedUpdatesWithAct();

        // Then the update targets the member's login, and going back targets the details route with the stale accountID so it
        // pops to the details screen below instead of stacking a second details screen for the real accountID
        expect(updateMemberCustomFieldMock).toHaveBeenCalledWith(policy.id, invitedEmail, 'customField1', 'EMP-43', invitedEmployeeUserID);
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policy.id, staleOptimisticAccountID));

        unmount();
        await waitForBatchedUpdatesWithAct();
    });
});
