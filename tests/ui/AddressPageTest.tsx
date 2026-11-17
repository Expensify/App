import {act, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';

import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import PersonalAddressPage from '@pages/settings/Profile/PersonalDetails/PersonalAddressPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@rnmapbox/maps', () => {
    return {
        default: jest.fn(),
        MarkerView: jest.fn(),
        setAccessToken: jest.fn(),
    };
});

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

const renderPage = (initialRouteName: typeof SCREENS.SETTINGS.PROFILE.ADDRESS | typeof SCREENS.SETTINGS.PREFERENCES.HOME_ADDRESS, fieldToFocus?: string) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <NavigationContainer
                    ref={navigationRef}
                    initialState={{routes: [{name: initialRouteName, params: {fieldToFocus}}]}}
                >
                    <Stack.Navigator initialRouteName={initialRouteName}>
                        <Stack.Screen
                            name={SCREENS.SETTINGS.PROFILE.ADDRESS}
                            component={PersonalAddressPage}
                        />
                        <Stack.Screen
                            name={SCREENS.SETTINGS.PREFERENCES.HOME_ADDRESS}
                            component={PersonalAddressPage}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
};

describe('AddressPageTest', () => {
    beforeAll(async () => {
        Onyx.init({
            keys: ONYXKEYS,
        });

        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
        });
        await waitForBatchedUpdatesWithAct();
    });
    it.each([
        [SCREENS.SETTINGS.PREFERENCES.HOME_ADDRESS, 'addressLine1', true],
        [SCREENS.SETTINGS.PREFERENCES.HOME_ADDRESS, undefined, false],
        [SCREENS.SETTINGS.PREFERENCES.HOME_ADDRESS, 'city', false],
        [SCREENS.SETTINGS.PROFILE.ADDRESS, 'addressLine1', false],
    ] as const)('only focuses the requested home address input: %s / %s', async (route, fieldToFocus, shouldAutoFocus) => {
        // Given message links opt in to focus, unlike ordinary Preferences and Profile navigation
        await TestHelper.signInWithTestUser();
        await act(async () => {
            await Onyx.set(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {addresses: []});
            await Onyx.set(ONYXKEYS.IS_LOADING_APP, false);
        });

        // When the real page and address form render for that entry point
        renderPage(route, fieldToFocus);
        await waitForBatchedUpdatesWithAct();

        // Then focus intent reaches only Address line 1, without premature required-field validation
        expect(screen.getByLabelText('Address line 1').props.autoFocus).toBe(shouldAutoFocus);
        for (const label of ['Address line 2', 'City', 'State / Province', 'Zip / Postcode']) {
            expect(screen.getByLabelText(label).props.autoFocus).not.toBe(true);
        }
        expect(screen.queryByText('This field is required')).toBeNull();
    });

    it('should not reset state', async () => {
        await TestHelper.signInWithTestUser();
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.PRIVATE_PERSONAL_DETAILS}`, {
                addresses: [
                    {
                        state: 'Test',
                        country: 'VN',
                        street: 'Test',
                    },
                ],
            });
            await Onyx.merge(`${ONYXKEYS.IS_LOADING_APP}`, false);
        });

        await waitForBatchedUpdatesWithAct();

        renderPage(SCREENS.SETTINGS.PROFILE.ADDRESS);

        await waitForBatchedUpdatesWithAct();
        const stateInput = screen.getByLabelText('State / Province');
        expect(stateInput.props.value).toEqual('Test');
        Navigation.setParams({
            country: 'VN',
        });
        await waitForBatchedUpdatesWithAct();
        const stateInputAfterParams = screen.getByLabelText('State / Province');
        expect(stateInputAfterParams.props.value).toEqual('Test');
    });

    it('should prefill address line 2 from explicit street2', async () => {
        await TestHelper.signInWithTestUser();
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.PRIVATE_PERSONAL_DETAILS}`, {
                addresses: [
                    {
                        country: 'US',
                        street: '123 Main St\nLegacy Suite',
                        street2: 'Suite 500',
                    },
                ],
            });
            await Onyx.merge(`${ONYXKEYS.IS_LOADING_APP}`, false);
        });

        await waitForBatchedUpdatesWithAct();

        renderPage(SCREENS.SETTINGS.PROFILE.ADDRESS);

        await waitForBatchedUpdatesWithAct();
        expect(screen.getByDisplayValue('Suite 500')).toBeDefined();
    });

    it('should prefill address line 2 from legacy newline when street2 is missing', async () => {
        await TestHelper.signInWithTestUser();
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.PRIVATE_PERSONAL_DETAILS}`, {
                addresses: [
                    {
                        country: 'US',
                        street: '123 Main St\nLegacy Suite',
                    },
                ],
            });
            await Onyx.merge(`${ONYXKEYS.IS_LOADING_APP}`, false);
        });

        await waitForBatchedUpdatesWithAct();

        renderPage(SCREENS.SETTINGS.PROFILE.ADDRESS);

        await waitForBatchedUpdatesWithAct();
        expect(screen.getByDisplayValue('Legacy Suite')).toBeDefined();
    });
});
