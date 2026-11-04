import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';

import Navigation from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsSplitNavigatorParamList} from '@libs/Navigation/types';

import PreferencesPage from '@pages/settings/Preferences/PreferencesPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
}));

const Stack = createPlatformStackNavigator<SettingsSplitNavigatorParamList>();

function renderPreferencesPage() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName={SCREENS.SETTINGS.PREFERENCES.ROOT}>
                        <Stack.Screen
                            name={SCREENS.SETTINGS.PREFERENCES.ROOT}
                            component={PreferencesPage}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
}

describe('PreferencesPage distance preferences', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.clear();
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('shows the saved home address and opens the address-only page from it', async () => {
        // Given a member on the commuter exclusions beta who already saved a home address
        await act(async () => {
            await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.COMMUTER_EXCLUSIONS]);
            await Onyx.set(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {
                addresses: [{street: '4127 Maple Ridge Dr', city: 'Boulder', state: 'CO', zip: '80301', country: 'US', current: true}],
            });
        });

        // When the preferences page renders
        renderPreferencesPage();
        await waitForBatchedUpdatesWithAct();

        // Then the distance preferences section lists the home address their commute is measured from
        expect(screen.getByText('Distance preferences')).toBeOnTheScreen();
        expect(screen.getByText('4127 Maple Ridge Dr, Boulder, CO, 80301, US')).toBeOnTheScreen();

        // When the member presses the home address row
        // MenuItem only forwards the press to onPress when it receives an event, so pass a minimal one.
        fireEvent.press(screen.getByText('Home address'), {nativeEvent: {}});

        // Then the address-only page opens, so changing the address does not require a legal name, date of birth,
        // phone number or magic code
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SETTINGS_HOME_ADDRESS);
    });

    it('hides distance preferences without the commuter exclusions beta', async () => {
        // Given a member who is not on the commuter exclusions beta
        await act(async () => {
            await Onyx.set(ONYXKEYS.BETAS, []);
        });

        // When the preferences page renders
        renderPreferencesPage();
        await waitForBatchedUpdatesWithAct();

        // Then the section stays hidden, because its rows only matter for commuter exclusions
        expect(screen.getByText('App preferences')).toBeOnTheScreen();
        expect(screen.queryByText('Distance preferences')).toBeNull();
    });
});
