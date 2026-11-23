import {act, render, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import PersonalDetailsByLoginProvider from '@components/PersonalDetailsByLoginProvider';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useDynamicBackPathModule from '@hooks/useDynamicBackPath';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';

import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';

import type {SettingsNavigatorParamList} from '@navigation/types';

import DynamicWorkspaceInviteMessageRolePage from '@pages/workspace/DynamicWorkspaceInviteMessageRolePage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type {ValueOf} from 'type-fest';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@src/components/ConfirmedRoute.tsx');

TestHelper.setupGlobalFetchMock();

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

function EmptyScreen() {
    return null;
}

type OpenerScreen =
    | typeof SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_INVITE_MESSAGE
    | typeof SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD_INVITE_NEW_MEMBER
    | typeof SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW;

const renderRolePage = (policyID: string, openerScreen?: OpenerScreen) => {
    const initialRoutes = openerScreen
        ? [
              {name: openerScreen, params: {policyID}},
              {name: SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_INVITE_MESSAGE_ROLE, params: {policyID}},
          ]
        : [{name: SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_INVITE_MESSAGE_ROLE, params: {policyID}}];

    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider, CurrentReportIDContextProvider, ModalProvider, PersonalDetailsByLoginProvider]}>
            <PortalProvider>
                <NavigationContainer
                    initialState={{
                        index: initialRoutes.length - 1,
                        routes: initialRoutes,
                    }}
                >
                    <Stack.Navigator>
                        <Stack.Screen
                            name={SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_INVITE_MESSAGE}
                            component={EmptyScreen}
                        />
                        <Stack.Screen
                            name={SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD_INVITE_NEW_MEMBER}
                            component={EmptyScreen}
                        />
                        <Stack.Screen
                            name={SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW}
                            component={EmptyScreen}
                        />
                        <Stack.Screen
                            name={SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_INVITE_MESSAGE_ROLE}
                            component={DynamicWorkspaceInviteMessageRolePage}
                            initialParams={{policyID}}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
};

describe('DynamicWorkspaceInviteMessageRolePage', () => {
    const adminAccountID = 1206;
    const adminEmail = 'admin@example.com';

    const policy = {
        ...LHNTestUtils.getFakePolicy(),
        role: CONST.POLICY.ROLE.ADMIN,
        owner: adminEmail,
        ownerAccountID: adminAccountID,
        type: CONST.POLICY.TYPE.CORPORATE,
        employeeList: {
            [adminEmail]: {email: adminEmail, role: CONST.POLICY.ROLE.ADMIN},
        },
    };

    const roleName = (role: ValueOf<typeof CONST.POLICY.ROLE>) => TestHelper.translateLocal('workspace.common.roleName', role);

    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(async () => {
        await TestHelper.signInWithTestUser(adminAccountID, adminEmail, undefined, 'Admin');
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [adminAccountID]: TestHelper.buildPersonalDetails(adminEmail, adminAccountID, 'Admin'),
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
        });
        jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue(
            createMock<ResponsiveLayoutResult>({
                isSmallScreenWidth: false,
                shouldUseNarrowLayout: false,
            }),
        );
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

    it('hides Approve-only when opened from company card assign invite step', async () => {
        // Given a Control workspace admin opening the invite role picker from company card assignment
        const {unmount} = renderRolePage(policy.id, SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD_INVITE_NEW_MEMBER);

        // When the role list finishes rendering
        await waitForBatchedUpdatesWithAct();

        // Then expense-creating roles are shown and Approve-only is hidden because cardholders must create expenses
        await waitFor(() => {
            expect(screen.getByText(TestHelper.translateLocal('common.member'))).toBeOnTheScreen();
        });
        expect(screen.getByText(roleName(CONST.POLICY.ROLE.ADMIN))).toBeOnTheScreen();
        expect(screen.queryByText(roleName(CONST.POLICY.ROLE.APPROVE_ONLY))).not.toBeOnTheScreen();

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('hides Approve-only when opened from Expensify Card issue new card invite step', async () => {
        // Given a Control workspace admin opening the invite role picker from Expensify Card issuance
        const {unmount} = renderRolePage(policy.id, SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW);

        // When the role list finishes rendering
        await waitForBatchedUpdatesWithAct();

        // Then Approve-only is hidden because cardholders must create expenses
        await waitFor(() => {
            expect(screen.getByText(TestHelper.translateLocal('common.member'))).toBeOnTheScreen();
        });
        expect(screen.queryByText(roleName(CONST.POLICY.ROLE.APPROVE_ONLY))).not.toBeOnTheScreen();

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('shows Approve-only when opened from the regular workspace invite flow', async () => {
        // Given a Control workspace admin opening the invite role picker from the regular member invite screen
        const {unmount} = renderRolePage(policy.id, SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_INVITE_MESSAGE);

        // When the role list finishes rendering
        await waitForBatchedUpdatesWithAct();

        // Then Approve-only remains available for normal workspace invitations
        await waitFor(() => {
            expect(screen.getByText(roleName(CONST.POLICY.ROLE.APPROVE_ONLY))).toBeOnTheScreen();
        });

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('hides Approve-only when deep-linked directly to the company card invite role route', async () => {
        // Given a direct deep link where no opener screen exists in the navigation stack
        const cardInviteBackPath = ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_INVITE_NEW_MEMBER.getRoute({
            policyID: policy.id,
            feed: `${CONST.COMPANY_CARD.FEED_BANK_NAME.VISA}${CONST.COMPANY_CARD.FEED_KEY_SEPARATOR}123`,
            cardID: '1234',
        });
        jest.spyOn(useDynamicBackPathModule, 'default').mockReturnValue(cardInviteBackPath);

        // When the role picker renders from the deep-linked back path
        const {unmount} = renderRolePage(policy.id);
        await waitForBatchedUpdatesWithAct();

        // Then the back path identifies the company card invite flow and hides Approve-only
        await waitFor(() => {
            expect(screen.getByText(TestHelper.translateLocal('common.member'))).toBeOnTheScreen();
        });
        expect(screen.queryByText(roleName(CONST.POLICY.ROLE.APPROVE_ONLY))).not.toBeOnTheScreen();

        unmount();
        await waitForBatchedUpdatesWithAct();
    });
});
