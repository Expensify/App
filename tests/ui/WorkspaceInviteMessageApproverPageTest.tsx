import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsNavigatorParamList} from '@navigation/types';
import WorkspaceInviteMessageApproverPage from '@pages/workspace/WorkspaceInviteMessageApproverPage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.unmock('react-native-reanimated');
jest.unmock('react-native-worklets');

jest.mock('@src/components/ConfirmedRoute.tsx');

TestHelper.setupGlobalFetchMock();

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

const renderPage = (initialRouteName: typeof SCREENS.WORKSPACE.INVITE_MESSAGE_APPROVER, initialParams: SettingsNavigatorParamList[typeof SCREENS.WORKSPACE.INVITE_MESSAGE_APPROVER]) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName={initialRouteName}>
                        <Stack.Screen
                            name={SCREENS.WORKSPACE.INVITE_MESSAGE_APPROVER}
                            component={WorkspaceInviteMessageApproverPage}
                            initialParams={initialParams}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
};

describe('WorkspaceInviteMessageApproverPage', () => {
    const ownerAccountID = 1;
    const ownerEmail = 'owner@example.com';
    const adminAccountID = 1234;
    const adminEmail = 'admin@example.com';
    const userAccountID = 1236;
    const userEmail = 'user@example.com';
    const selfAccountID = 1206;
    const selfEmail = 'self@example.com';

    const policy = {
        ...LHNTestUtils.getFakePolicy(),
        role: CONST.POLICY.ROLE.ADMIN,
        owner: ownerEmail,
        ownerAccountID,
        type: CONST.POLICY.TYPE.CORPORATE,
        approver: adminEmail,
        approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
        areWorkflowsEnabled: true,
        employeeList: {
            [ownerEmail]: {email: ownerEmail, role: CONST.POLICY.ROLE.ADMIN},
            [adminEmail]: {email: adminEmail, role: CONST.POLICY.ROLE.ADMIN},
            [userEmail]: {email: userEmail, role: CONST.POLICY.ROLE.USER},
            [selfEmail]: {email: selfEmail, role: CONST.POLICY.ROLE.ADMIN},
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
                [adminAccountID]: TestHelper.buildPersonalDetails(adminEmail, adminAccountID, 'Admin'),
                [userAccountID]: TestHelper.buildPersonalDetails(userEmail, userAccountID, 'User'),
                [selfAccountID]: TestHelper.buildPersonalDetails(selfEmail, selfAccountID, 'Self'),
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            const inviteeEmail = 'invitee@example.com';
            await Onyx.set(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${policy.id}`, {
                [inviteeEmail]: 9999,
            });
        });
        jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue({
            isSmallScreenWidth: false,
            shouldUseNarrowLayout: false,
        } as ResponsiveLayoutResult);
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    it('should render the approver selection page with header', async () => {
        const {unmount} = renderPage(SCREENS.WORKSPACE.INVITE_MESSAGE_APPROVER, {policyID: policy.id});
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByText('Approver')).toBeOnTheScreen();
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should display workspace members as approver options', async () => {
        const {unmount} = renderPage(SCREENS.WORKSPACE.INVITE_MESSAGE_APPROVER, {policyID: policy.id});
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByText('Owner')).toBeOnTheScreen();
            expect(screen.getByText(adminEmail)).toBeOnTheScreen();
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should filter out members with pending DELETE action', async () => {
        const policyWithPendingDelete = {
            ...policy,
            employeeList: {
                ...policy.employeeList,
                [userEmail]: {email: userEmail, role: CONST.POLICY.ROLE.USER, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE},
            },
        };

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policyWithPendingDelete);
        });

        const {unmount} = renderPage(SCREENS.WORKSPACE.INVITE_MESSAGE_APPROVER, {policyID: policy.id});
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByText('Owner')).toBeOnTheScreen();
            expect(screen.queryByText('User')).not.toBeOnTheScreen();
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should save approver draft when selecting an approver', async () => {
        const {unmount} = renderPage(SCREENS.WORKSPACE.INVITE_MESSAGE_APPROVER, {policyID: policy.id});
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByText(adminEmail)).toBeOnTheScreen();
        });

        const adminOption = screen.getByText(adminEmail);
        fireEvent.press(adminOption);

        await waitForBatchedUpdatesWithAct();

        const approverDraft = await new Promise<string | null | undefined>((resolve) => {
            const connection = Onyx.connect({
                key: `${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_APPROVER_DRAFT}${policy.id}`,
                waitForCollectionCallback: false,
                callback: (value) => {
                    Onyx.disconnect(connection);
                    resolve(value as string | null | undefined);
                },
            });
        });

        expect(approverDraft).toBe(adminEmail);

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should filter out invited members when preventSelfApproval is enabled', async () => {
        const policyWithPreventSelfApproval = {
            ...policy,
            preventSelfApproval: true,
        };

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policyWithPreventSelfApproval);
            await Onyx.set(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${policy.id}`, {
                [userEmail]: userAccountID,
            });
        });

        const {unmount} = renderPage(SCREENS.WORKSPACE.INVITE_MESSAGE_APPROVER, {policyID: policy.id});
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByText('Owner')).toBeOnTheScreen();
            expect(screen.getByText(adminEmail)).toBeOnTheScreen();
            expect(screen.queryByText('User')).not.toBeOnTheScreen();
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });
});
