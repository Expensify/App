import {render} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import DynamicVerifyAccountPage from '@pages/settings/DynamicVerifyAccountPage';

import {getAccessiblePolicies} from '@userActions/Policy/Policy';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../../utils/waitForBatchedUpdates';

const mockVerifyAccountPageBase = jest.fn<null, [Record<string, unknown>]>(() => null);

jest.mock('@pages/settings/VerifyAccountPageBase', () => ({
    __esModule: true,
    default: (props: Record<string, unknown>) => mockVerifyAccountPageBase(props),
}));

jest.mock('@hooks/useDynamicBackPath', () => jest.fn(() => 'home'));
jest.mock('@hooks/useDynamicForwardPath', () => jest.fn(() => undefined));
jest.mock('@userActions/Policy/Policy', () => ({getAccessiblePolicies: jest.fn()}));

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

function renderPage(params: SettingsNavigatorParamList[typeof SCREENS.SETTINGS.DYNAMIC_VERIFY_ACCOUNT] | undefined) {
    return render(
        <OnyxListItemProvider>
            <NavigationContainer ref={navigationRef}>
                <Stack.Navigator initialRouteName={SCREENS.SETTINGS.DYNAMIC_VERIFY_ACCOUNT}>
                    <Stack.Screen
                        name={SCREENS.SETTINGS.DYNAMIC_VERIFY_ACCOUNT}
                        component={DynamicVerifyAccountPage}
                        initialParams={params}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </OnyxListItemProvider>,
    );
}

describe('DynamicVerifyAccountPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        mockVerifyAccountPageBase.mockClear();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    it('uses the workspace handoff only for the join-workspace task route', async () => {
        renderPage({isJoinWorkspaceTask: 'true'});
        await waitForBatchedUpdates();

        expect(mockVerifyAccountPageBase).toHaveBeenCalledWith(
            expect.objectContaining({
                navigateForwardTo: ROUTES.ONBOARDING_WORKSPACES.getRoute(),
                onValidationSuccess: getAccessiblePolicies,
            }),
        );
    });

    it('preserves generic verification behavior without the task route parameter', async () => {
        renderPage(undefined);
        await waitForBatchedUpdates();

        expect(mockVerifyAccountPageBase).toHaveBeenCalledWith(
            expect.objectContaining({
                navigateForwardTo: undefined,
                onValidationSuccess: undefined,
            }),
        );
    });
});
