import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import Text from '@components/Text';

import createRootStackNavigator from '@libs/Navigation/AppNavigator/createRootStackNavigator';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {RightModalNavigatorParamList, RootNavigatorParamList, SettingsNavigatorParamList} from '@libs/Navigation/types';

import PlaidBankAccountStep from '@pages/AddPersonalBankAccountPage/substeps/PlaidBankAccountStep';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React, {useState} from 'react';
import {Button, View} from 'react-native';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/AddPlaidBankAccount', () => {
    const NativeButton = jest.requireActual<{Button: typeof Button}>('react-native').Button;
    function MockAddPlaidBankAccount({onExitPlaid}: {onExitPlaid: () => void}) {
        return (
            <NativeButton
                title="Cancel Plaid"
                onPress={onExitPlaid}
            />
        );
    }
    return MockAddPlaidBankAccount;
});
jest.mock('@libs/getPlaidOAuthReceivedRedirectURI', () => jest.fn(() => undefined));

const RootStack = createRootStackNavigator<RootNavigatorParamList>();
const ModalStack = createPlatformStackNavigator<RightModalNavigatorParamList>();
const SettingsStack = createPlatformStackNavigator<SettingsNavigatorParamList>();

function CountrySelector() {
    const [selectedCountry, setSelectedCountry] = useState<string>(CONST.COUNTRY.CA);
    return (
        <View>
            <Text>{selectedCountry}</Text>
            <Button
                title="Select United States"
                onPress={() => setSelectedCountry(CONST.COUNTRY.US)}
            />
        </View>
    );
}

function EntryPoint() {
    return <Text>Log into your bank / Connect manually</Text>;
}

function PlaidPage() {
    return (
        <PlaidBankAccountStep
            onNext={jest.fn()}
            onMove={jest.fn()}
            isEditing={false}
        />
    );
}

function SettingsNavigator() {
    return (
        <SettingsStack.Navigator>
            <SettingsStack.Screen
                name={SCREENS.SETTINGS.ADD_BANK_ACCOUNT}
                component={CountrySelector}
            />
            <SettingsStack.Screen
                name={SCREENS.SETTINGS.DYNAMIC_ADD_US_BANK_ACCOUNT_ENTRY_POINT}
                component={EntryPoint}
            />
            <SettingsStack.Screen
                name={SCREENS.SETTINGS.DYNAMIC_ADD_US_BANK_ACCOUNT}
                component={PlaidPage}
            />
        </SettingsStack.Navigator>
    );
}

function RightModalNavigator() {
    return (
        <ModalStack.Navigator>
            <ModalStack.Screen
                name={SCREENS.RIGHT_MODAL.SETTINGS}
                component={SettingsNavigator}
            />
        </ModalStack.Navigator>
    );
}

async function renderFlow(countryParams?: SettingsNavigatorParamList[typeof SCREENS.SETTINGS.ADD_BANK_ACCOUNT]) {
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <PortalProvider>
                <NavigationContainer
                    ref={navigationRef}
                    initialState={{
                        routes: [
                            {
                                name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR,
                                state: {
                                    routes: [
                                        {
                                            name: SCREENS.RIGHT_MODAL.SETTINGS,
                                            state: {
                                                routes: countryParams
                                                    ? [{name: SCREENS.SETTINGS.ADD_BANK_ACCOUNT, params: countryParams}]
                                                    : [{name: SCREENS.SETTINGS.DYNAMIC_ADD_US_BANK_ACCOUNT_ENTRY_POINT}],
                                            },
                                        },
                                    ],
                                },
                            },
                        ],
                    }}
                >
                    <RootStack.Navigator>
                        <RootStack.Screen
                            name={NAVIGATORS.RIGHT_MODAL_NAVIGATOR}
                            component={RightModalNavigator}
                        />
                    </RootStack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
    await waitForBatchedUpdatesWithAct();
}

async function openPlaid() {
    act(() =>
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.ADD_US_BANK_ACCOUNT.getRoute(CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.PLAID_BANK_ACCOUNT), ROUTES.SETTINGS_WALLET)),
    );
    await waitForBatchedUpdatesWithAct();
}

function getSettingsState() {
    return navigationRef.getRootState().routes.at(-1)?.state?.routes.at(-1)?.state;
}

describe('Personal bank account Plaid cancellation', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.clear();
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
        });
    });

    it.each([ROUTES.SETTINGS_BANK_ACCOUNT_PURPOSE, ROUTES.SETTINGS_WALLET, undefined])('preserves the mounted country selector and backTo=%s', async (backTo) => {
        // Given the existing country selector has an unsaved United States selection
        await renderFlow(backTo ? {backTo} : {});
        fireEvent.press(screen.getByText('Select United States'));
        const countryRoute = getSettingsState()?.routes.at(-1);
        act(() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.ADD_US_BANK_ACCOUNT_ENTRY_POINT.path, ROUTES.SETTINGS_WALLET)));
        await waitForBatchedUpdatesWithAct();
        await openPlaid();

        // When the user cancels Plaid
        fireEvent.press(screen.getByText('Cancel Plaid'));
        await waitForBatchedUpdatesWithAct();

        // Then both US screens are popped and the original country screen keeps its selection and params
        expect(getSettingsState()?.routes).toHaveLength(1);
        expect(getSettingsState()?.routes.at(-1)).toEqual(countryRoute);
        expect(screen.getByText(CONST.COUNTRY.US)).toBeOnTheScreen();
    });

    it('keeps a single back action when there is no country selector in the stack', async () => {
        // Given direct US setup opened Plaid without a country selector
        await renderFlow();
        await openPlaid();

        // When the user cancels Plaid
        fireEvent.press(screen.getByText('Cancel Plaid'));
        await waitForBatchedUpdatesWithAct();

        // Then only Plaid is popped and no country selector is created
        expect(getSettingsState()?.routes.map((route) => route.name)).toEqual([SCREENS.SETTINGS.DYNAMIC_ADD_US_BANK_ACCOUNT_ENTRY_POINT]);
        expect(screen.getByText('Log into your bank / Connect manually')).toBeOnTheScreen();
    });
});
