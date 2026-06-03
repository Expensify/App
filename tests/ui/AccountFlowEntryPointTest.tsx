import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import {act, render} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccountFlowEntryPoint from '@pages/settings/Wallet/InternationalDepositAccount/subPages/AccountFlowEntryPoint';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import getOnyxValue from '../utils/getOnyxValue';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

TestHelper.setupGlobalFetchMock();

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

function AccountFlowEntryPointScreen() {
    return <AccountFlowEntryPoint onBackButtonPress={() => {}} />;
}

const renderEntryPoint = () =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName={SCREENS.SETTINGS.ADD_US_BANK_ACCOUNT_ENTRY_POINT}>
                        <Stack.Screen
                            name={SCREENS.SETTINGS.ADD_US_BANK_ACCOUNT_ENTRY_POINT}
                            component={AccountFlowEntryPointScreen}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );

describe('AccountFlowEntryPoint', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
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

    it('keeps the personal bank account data on mount and clears it on unmount', async () => {
        await TestHelper.signInWithTestUser();

        // A fallback route is set before the user reaches the AccountFlowEntryPoint screen.
        await act(async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {onSuccessFallbackRoute: ROUTES.ENABLE_PAYMENTS});
        });

        const {unmount} = renderEntryPoint();
        await waitForBatchedUpdatesWithAct();

        // Mounting must not wipe the data, otherwise the route is lost before the rest of the flow can use it.
        expect(await getOnyxValue(ONYXKEYS.PERSONAL_BANK_ACCOUNT)).toEqual({onSuccessFallbackRoute: ROUTES.ENABLE_PAYMENTS});

        // Leaving the screen (flow finished or user went back) must clear the data so it cannot leak into a later flow.
        unmount();
        await waitForBatchedUpdatesWithAct();

        expect(await getOnyxValue(ONYXKEYS.PERSONAL_BANK_ACCOUNT)).toBeFalsy();
    });
});
