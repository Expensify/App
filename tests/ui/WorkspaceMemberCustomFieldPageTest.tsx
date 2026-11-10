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
import {addMembersToWorkspace} from '@libs/actions/Policy/Member';
import {dismissAddedWithPrimaryLoginMessages, updateMemberCustomField} from '@libs/actions/Policy/Policy';
import {WRITE_COMMANDS} from '@libs/API/types';
import Navigation from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import {flush as flushSequentialQueue} from '@libs/Network/SequentialQueue';
import {getPersonalDetailsOnyxDataForOptimisticUsers} from '@libs/PersonalDetailsUtils';
import {generateAccountID} from '@libs/UserUtils';

import type * as PolicyActions from '@libs/actions/Policy/Policy';

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
import getOnyxValue from '../utils/getOnyxValue';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/actions/Policy/Policy', () => {
    const actual = jest.requireActual<typeof PolicyActions>('@libs/actions/Policy/Policy');
    return {
        ...actual,
        updateMemberCustomField: jest.fn(),
    };
});

const mockFetch = TestHelper.setupGlobalFetchMock();
OnyxUpdateManager();

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

    it.each(['mapped', 'unmapped', 'failed'])('handles an offline secondary-login invite with a %s response while a custom field draft is open', async (responseType) => {
        // Given a secondary login invited offline, with a draft entered before the invite response arrives
        const secondaryEmail = 'secondary@example.com';
        const primaryEmail = 'primary@example.com';
        const primaryAccountID = 7777;
        const optimisticAccountID = generateAccountID(secondaryEmail);
        mockFetch.pause();
        mockFetch.mockAPICommand(WRITE_COMMANDS.ADD_MEMBERS_TO_WORKSPACE, () => ({
            jsonCode: responseType === 'failed' ? 400 : 200,
            onyxData: responseType === 'failed'
                ? []
                : [
                      {
                          onyxMethod: Onyx.METHOD.MERGE,
                          key: `${ONYXKEYS.COLLECTION.POLICY}${policy.id}`,
                          value: {
                              employeeList: {[secondaryEmail]: null, [primaryEmail]: {email: primaryEmail, role: CONST.POLICY.ROLE.USER}},
                              ...(responseType === 'mapped' ? {primaryLoginsInvited: {[secondaryEmail]: primaryEmail}} : {}),
                          },
                      },
                      {
                          onyxMethod: Onyx.METHOD.MERGE,
                          key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                          value: {[primaryAccountID]: TestHelper.buildPersonalDetails(primaryEmail, primaryAccountID, 'Primary')},
                      },
                  ],
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
        const {unmount} = renderPage({policyID: policy.id, accountID: String(optimisticAccountID), customFieldType: 'customField1'});
        await waitForBatchedUpdatesWithAct();
        fireEvent.changeText(screen.getByDisplayValue(''), 'TEST-123');
        expect(Navigation.goBack).not.toHaveBeenCalled();

        // When reconnecting applies the actual invite response and optimistic cleanup while the editor stays mounted
        await act(async () => {
            await Onyx.merge(ONYXKEYS.NETWORK, {shouldForceOffline: false});
            await mockFetch.resume();
            flushSequentialQueue();
        });
        await waitForBatchedUpdatesWithAct();

        // Then mapped members keep the unsaved draft, while an unresolved member cannot be edited or silently saved
        TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.ADD_MEMBERS_TO_WORKSPACE, 1);
        expect(updateMemberCustomFieldMock).not.toHaveBeenCalled();
        if (responseType === 'unmapped') {
            expect(Navigation.goBack).not.toHaveBeenCalled();
            expect(screen.getByTestId('NotFoundPage')).toBeOnTheScreen();
            expect(screen.queryByTestId('WorkspaceMemberCustomFieldPage')).not.toBeOnTheScreen();
        } else {
            expect(screen.queryByTestId('NotFoundPage')).not.toBeOnTheScreen();
            expect(screen.getByDisplayValue('TEST-123')).toBeOnTheScreen();
            expect(Navigation.goBack).not.toHaveBeenCalled();
            if (responseType === 'mapped') {
                fireEvent.press(screen.getByText('Save'));
                await waitForBatchedUpdatesWithAct();
                expect(updateMemberCustomFieldMock).toHaveBeenCalledWith(policy.id, primaryEmail, 'customField1', 'TEST-123', undefined);
                expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policy.id, optimisticAccountID));
            } else {
                const syncedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
                expect(syncedPolicy?.employeeList?.[secondaryEmail]?.errors).toBeTruthy();
            }
        }
        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('does not redirect a direct link to an unknown member', async () => {
        // Given a direct link that never resolved to a member
        const unknownAccountID = generateAccountID('unknown@example.com');

        // When opening the editor
        const {unmount} = renderPage({policyID: policy.id, accountID: String(unknownAccountID), customFieldType: 'customField1'});
        await waitForBatchedUpdatesWithAct();

        // Then not found remains appropriate and no mutation or redirect occurs
        expect(screen.getByTestId('NotFoundPage')).toBeOnTheScreen();
        expect(Navigation.goBack).not.toHaveBeenCalled();
        expect(updateMemberCustomFieldMock).not.toHaveBeenCalled();
        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    describe('identity reconciliation', () => {
        const secondaryEmail = 'secondary@example.com';
        const primaryEmail = 'primary@example.com';
        const primaryAccountID = 7777;
        const optimisticAccountID = generateAccountID(secondaryEmail);
        const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${policy.id}` as const;

        const openEditor = async (routeAccountID = optimisticAccountID) => {
            await act(async () => {
                await Onyx.merge(policyKey, {employeeList: {[secondaryEmail]: {email: secondaryEmail, role: CONST.POLICY.ROLE.USER}}});
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                    [routeAccountID]: {...TestHelper.buildPersonalDetails(secondaryEmail, routeAccountID, 'Secondary'), isOptimisticPersonalDetail: routeAccountID === optimisticAccountID},
                });
            });
            const renderedPage = renderPage({policyID: policy.id, accountID: String(routeAccountID), customFieldType: 'customField1'});
            await waitForBatchedUpdatesWithAct();
            fireEvent.changeText(screen.getByDisplayValue(''), 'TEST-123');
            return renderedPage;
        };

        const syncMappedMember = async () => {
            await act(async () => {
                await Onyx.update([
                    {
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: policyKey,
                        value: {
                            employeeList: {[secondaryEmail]: null, [primaryEmail]: {email: primaryEmail, role: CONST.POLICY.ROLE.USER}},
                            primaryLoginsInvited: {[secondaryEmail]: primaryEmail},
                        },
                    },
                    {
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                        value: {[optimisticAccountID]: null, [primaryAccountID]: TestHelper.buildPersonalDetails(primaryEmail, primaryAccountID, 'Primary')},
                    },
                ]);
            });
            await waitForBatchedUpdatesWithAct();
        };

        it('preserves the draft when the primary mapping arrives in a later delivery', async () => {
            // Given a mounted editor for a member invited by secondary email while offline
            const {unmount} = await openEditor();

            // When one committed delivery removes the optimistic identity before another supplies the mapping
            await act(async () => {
                await Onyx.merge(policyKey, {employeeList: {[secondaryEmail]: null, [primaryEmail]: {email: primaryEmail, role: CONST.POLICY.ROLE.USER}}});
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                    [optimisticAccountID]: null,
                    [primaryAccountID]: TestHelper.buildPersonalDetails(primaryEmail, primaryAccountID, 'Primary'),
                });
            });
            await waitForBatchedUpdatesWithAct();
            expect(Navigation.goBack).not.toHaveBeenCalled();
            expect(screen.getByTestId('NotFoundPage')).toBeOnTheScreen();
            expect(updateMemberCustomFieldMock).not.toHaveBeenCalled();
            await act(async () => {
                await Onyx.merge(policyKey, {primaryLoginsInvited: {[secondaryEmail]: primaryEmail}});
            });
            await waitForBatchedUpdatesWithAct();

            // Then resolution restores the original draft on the same page, and Save targets the primary member
            expect(screen.getByDisplayValue('TEST-123')).toBeOnTheScreen();
            expect(screen.queryByTestId('NotFoundPage')).not.toBeOnTheScreen();
            expect(Navigation.goBack).not.toHaveBeenCalled();
            fireEvent.press(screen.getByText('Save'));
            await waitForBatchedUpdatesWithAct();
            expect(updateMemberCustomFieldMock).toHaveBeenCalledWith(policy.id, primaryEmail, 'customField1', 'TEST-123', undefined);
            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it.each(['policy', 'personalDetails'])('preserves a real-account draft when %s arrives first without an alias mapping', async (firstDelivery) => {
            // Given the route already identifies the real account, even though its login is still secondary
            const {unmount} = await openEditor(primaryAccountID);
            const updatePolicy = () => Onyx.merge(policyKey, {employeeList: {[secondaryEmail]: null, [primaryEmail]: {email: primaryEmail, role: CONST.POLICY.ROLE.USER}}});
            const updatePersonalDetails = () =>
                Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[primaryAccountID]: TestHelper.buildPersonalDetails(primaryEmail, primaryAccountID, 'Primary')});

            // When the login and employee replacement are separate committed deliveries in either order
            await act(async () => {
                await (firstDelivery === 'policy' ? updatePolicy() : updatePersonalDetails());
            });
            await waitForBatchedUpdatesWithAct();
            expect(Navigation.goBack).not.toHaveBeenCalled();
            await act(async () => {
                await (firstDelivery === 'policy' ? updatePersonalDetails() : updatePolicy());
            });
            await waitForBatchedUpdatesWithAct();

            // Then the real account resolves the primary login and the draft survives without any guessed relationship
            expect(screen.getByDisplayValue('TEST-123')).toBeOnTheScreen();
            expect(Navigation.goBack).not.toHaveBeenCalled();
            fireEvent.press(screen.getByText('Save'));
            await waitForBatchedUpdatesWithAct();
            expect(updateMemberCustomFieldMock).toHaveBeenCalledWith(policy.id, primaryEmail, 'customField1', 'TEST-123', undefined);
            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('retains an established primary identity when its informational mapping is dismissed', async () => {
            // Given an optimistic route that has already resolved the canonical member after a successful invite
            const {unmount} = await openEditor();
            await syncMappedMember();
            expect(screen.getByDisplayValue('TEST-123')).toBeOnTheScreen();

            // When dismissing the invitation message removes primaryLoginsInvited
            await act(async () => {
                dismissAddedWithPrimaryLoginMessages(policy.id);
            });
            await waitForBatchedUpdatesWithAct();

            // Then the current primary employee remains editable and saves under the primary login
            expect(screen.getByDisplayValue('TEST-123')).toBeOnTheScreen();
            expect(Navigation.goBack).not.toHaveBeenCalled();
            fireEvent.press(screen.getByText('Save'));
            await waitForBatchedUpdatesWithAct();
            expect(updateMemberCustomFieldMock).toHaveBeenCalledWith(policy.id, primaryEmail, 'customField1', 'TEST-123', undefined);
            expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policy.id, optimisticAccountID));
            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('does not cache the viewing user permissions along with member identity', async () => {
            // Given an editor with a retained canonical member identity
            const {unmount} = await openEditor();
            await syncMappedMember();

            // When the current user loses workspace admin access but the edited member still exists
            await act(async () => {
                await Onyx.merge(policyKey, {role: CONST.POLICY.ROLE.USER, employeeList: {[selfEmail]: {role: CONST.POLICY.ROLE.USER}}});
            });
            await waitForBatchedUpdatesWithAct();

            // Then retaining the member identity does not retain permission to edit it
            expect(screen.getByTestId('NotFoundPage')).toBeOnTheScreen();
            expect(screen.queryByDisplayValue('TEST-123')).not.toBeOnTheScreen();
            expect(updateMemberCustomFieldMock).not.toHaveBeenCalled();
            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('blocks a genuinely deleted member instead of reusing cached membership', async () => {
            // Given the editor has retained the real member identity
            const {unmount} = await openEditor();
            await syncMappedMember();

            // When the primary employee is deleted and the informational mapping is cleared
            await act(async () => {
                await Onyx.merge(policyKey, {employeeList: {[primaryEmail]: null}, primaryLoginsInvited: null});
            });
            await waitForBatchedUpdatesWithAct();

            // Then cached identity cannot bypass the live membership guard or send a custom-field write
            expect(screen.getByTestId('NotFoundPage')).toBeOnTheScreen();
            expect(screen.queryByDisplayValue('TEST-123')).not.toBeOnTheScreen();
            expect(updateMemberCustomFieldMock).not.toHaveBeenCalled();
            expect(Navigation.goBack).not.toHaveBeenCalled();
            unmount();
            await waitForBatchedUpdatesWithAct();
        });
    });
});
