import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import {act, render, screen} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxProvider from '@components/OnyxProvider';
import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import PersonalAddressPage from '@pages/settings/Profile/PersonalDetails/PersonalAddressPage';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@rnmapbox/maps', () => {
    return {
        default: jest.fn(),
        MarkerView: jest.fn(),
        setAccessToken: jest.fn(),
    };
});

jest.mock('@react-native-community/geolocation', () => ({
    setRNConfiguration: jest.fn(),
}));

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

const renderPage = (initialRouteName: typeof SCREENS.SETTINGS.PROFILE.ADDRESS) => {
    return render(
        <ComposeProviders components={[OnyxProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <NavigationContainer ref={navigationRef}>
                    <Stack.Navigator initialRouteName={initialRouteName}>
                        <Stack.Screen
                            name={SCREENS.SETTINGS.PROFILE.ADDRESS}
                            component={PersonalAddressPage}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
};

describe('AddressPageTest', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
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

        renderPage(SCREENS.SETTINGS.PROFILE.ADDRESS);

        await waitForBatchedUpdatesWithAct();
        const state = screen.getAllByLabelText('State / Province');
        expect(state.at(1)?.props.value).toEqual('Test');
        Navigation.setParams({
            country: 'VN',
        });
        await waitForBatchedUpdatesWithAct();
        expect(state?.at(1)?.props.value).toEqual('Test');
    });
});
