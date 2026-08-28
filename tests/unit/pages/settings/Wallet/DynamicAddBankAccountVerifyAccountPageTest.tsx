import {render} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {hasActiveAdminWorkspaces} from '@libs/PolicyUtils';

import DynamicAddBankAccountVerifyAccountPage from '@pages/settings/Wallet/DynamicAddBankAccountVerifyAccountPage';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../../../utils/waitForBatchedUpdates';

const mockVerifyAccountPageBase = jest.fn<null, [Record<string, unknown>]>(() => null);

jest.mock('@pages/settings/VerifyAccountPageBase', () => ({
    __esModule: true,
    default: (props: Record<string, unknown>) => mockVerifyAccountPageBase(props),
}));

jest.mock('@hooks/useDynamicBackPath', () => jest.fn(() => 'settings/wallet'));

jest.mock('@libs/PolicyUtils', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/PolicyUtils'),
    hasActiveAdminWorkspaces: jest.fn(),
}));

const mockedHasActiveAdminWorkspaces = jest.mocked(hasActiveAdminWorkspaces);

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

function renderPage(params: SettingsNavigatorParamList[typeof SCREENS.SETTINGS.DYNAMIC_ADD_BANK_ACCOUNT_VERIFY_ACCOUNT]) {
    return render(
        <OnyxListItemProvider>
            <NavigationContainer ref={navigationRef}>
                <Stack.Navigator initialRouteName={SCREENS.SETTINGS.DYNAMIC_ADD_BANK_ACCOUNT_VERIFY_ACCOUNT}>
                    <Stack.Screen
                        name={SCREENS.SETTINGS.DYNAMIC_ADD_BANK_ACCOUNT_VERIFY_ACCOUNT}
                        component={DynamicAddBankAccountVerifyAccountPage}
                        initialParams={params}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </OnyxListItemProvider>,
    );
}

describe('DynamicAddBankAccountVerifyAccountPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        mockVerifyAccountPageBase.mockClear();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    // The forward path must mirror the validated branch of openPersonalBankAccountSetupView: shouldSetUpUSBankAccount wins over
    // the purpose screen, so a user who validates here lands in the same flow a validated user is sent to directly.
    it.each([
        {
            name: 'US bank account flow when shouldSetUpUSBankAccount is set (admin)',
            params: {shouldSetUpUSBankAccount: 'true'} as const,
            isAdmin: true,
            expected: ROUTES.SETTINGS_ADD_US_BANK_ACCOUNT.getRoute(),
        },
        {
            name: 'US bank account flow when shouldSetUpUSBankAccount is set (non-admin)',
            params: {shouldSetUpUSBankAccount: 'true'} as const,
            isAdmin: false,
            expected: ROUTES.SETTINGS_ADD_US_BANK_ACCOUNT.getRoute(),
        },
        {name: 'purpose screen for admins without any flags', params: undefined, isAdmin: true, expected: ROUTES.SETTINGS_BANK_ACCOUNT_PURPOSE},
        {name: 'add bank account for non-admins without any flags', params: undefined, isAdmin: false, expected: ROUTES.SETTINGS_ADD_BANK_ACCOUNT.getRoute('settings/wallet')},
        {
            name: 'add bank account for admins when shouldSkipPurposeSelection is set',
            params: {shouldSkipPurposeSelection: 'true'} as const,
            isAdmin: true,
            expected: ROUTES.SETTINGS_ADD_BANK_ACCOUNT.getRoute('settings/wallet'),
        },
    ])('forwards to the $name', async ({params, isAdmin, expected}) => {
        mockedHasActiveAdminWorkspaces.mockReturnValue(isAdmin);

        renderPage(params);
        await waitForBatchedUpdates();

        expect(mockVerifyAccountPageBase).toHaveBeenCalledWith(expect.objectContaining({navigateForwardTo: expected}));
    });
});
