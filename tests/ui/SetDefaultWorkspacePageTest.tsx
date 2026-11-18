import {act, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';

import type {MoneyRequestNavigatorParamList} from '@navigation/types';

import SetDefaultWorkspacePage from '@pages/SetDefaultWorkspacePage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dismissModal: jest.fn(),
    setNavigationActionToMicrotaskQueue: jest.fn((cb: () => void) => cb()),
    getActiveRoute: jest.fn(() => ''),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    isTopmostRouteModalScreen: jest.fn(() => false),
}));

const ACCOUNT_ID = 12345;
const EMAIL = 'test@example.com';

const Stack = createPlatformStackNavigator<MoneyRequestNavigatorParamList>();

function makeWorkspace(id: string, name: string, overrides: Partial<Policy> = {}): Policy {
    return createMock<Policy>({
        id,
        name,
        role: CONST.POLICY.ROLE.USER,
        type: CONST.POLICY.TYPE.TEAM,
        owner: 'owner@example.com',
        employeeList: {[EMAIL]: {email: EMAIL, role: CONST.POLICY.ROLE.USER}},
        pendingAction: null,
        ...overrides,
    });
}

function renderPage() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <Stack.Navigator>
                        <Stack.Screen
                            name={SCREENS.SET_DEFAULT_WORKSPACE}
                            component={SetDefaultWorkspacePage}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
}

describe('SetDefaultWorkspacePage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('only lists workspaces that every create flow would accept as the default', async () => {
        // Given a regular workspace next to archived, pending-delete, approve-only and Teachers Unite ones
        await act(async () => {
            await Onyx.set(ONYXKEYS.SESSION, {accountID: ACCOUNT_ID, email: EMAIL});
            await Onyx.set(ONYXKEYS.IS_LOADING_APP, false);
            for (const policy of [
                makeWorkspace('regular', 'Regular workspace'),
                makeWorkspace('archived', 'Archived workspace', {archivedDate: '2024-01-01'}),
                makeWorkspace('deleting', 'Deleting workspace', {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE, errors: {error: 'Failed'}}),
                makeWorkspace('approveOnly', 'Approve-only workspace', {
                    role: CONST.POLICY.ROLE.APPROVE_ONLY,
                    employeeList: {[EMAIL]: {email: EMAIL, role: CONST.POLICY.ROLE.APPROVE_ONLY}},
                }),
                makeWorkspace(CONST.TEACHERS_UNITE.TEST_POLICY_ID, 'Teachers Unite workspace'),
            ]) {
                await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            }
        });

        // When the default workspace picker opens
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then only the regular workspace is offered. Picking any of the others would set a default every create flow then ignores.
        expect(await screen.findByText('Regular workspace')).toBeOnTheScreen();
        expect(screen.queryByText('Archived workspace')).not.toBeOnTheScreen();
        expect(screen.queryByText('Deleting workspace')).not.toBeOnTheScreen();
        expect(screen.queryByText('Approve-only workspace')).not.toBeOnTheScreen();
        expect(screen.queryByText('Teachers Unite workspace')).not.toBeOnTheScreen();
    });
});
