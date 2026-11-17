import {act, render} from '@testing-library/react-native';

import CountrySelection from '@pages/settings/Wallet/BankAccountPurposePage/substeps/CountrySelection';
import CountrySelectionList from '@pages/settings/Wallet/CountrySelectionList';

import {navigateToBankAccountRoute, prepareStandaloneBankAccountSetup} from '@userActions/ReimbursementAccount';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';

jest.mock('@components/FormAlertWithSubmitButton', () => jest.fn(() => null));
jest.mock('@pages/settings/Wallet/CountrySelectionList', () => jest.fn(() => null));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);
jest.mock('@hooks/useOnyx', () => jest.fn(() => [undefined, jest.fn()]));
jest.mock('@hooks/usePersonalPolicy', () => jest.fn(() => ({outputCurrency: undefined})));
jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(() => ({
        mt5: {},
    })),
);
jest.mock('@userActions/ReimbursementAccount', () => ({
    prepareStandaloneBankAccountSetup: jest.fn(),
    navigateToBankAccountRoute: jest.fn(),
}));

const Stack = createStackNavigator();

describe('BankAccountPurpose CountrySelection', () => {
    const mockedCountrySelectionList = jest.mocked(CountrySelectionList);
    const mockedPrepareStandaloneBankAccountSetup = jest.mocked(prepareStandaloneBankAccountSetup);
    const mockedNavigateToBankAccountRoute = jest.mocked(navigateToBankAccountRoute);

    let mockMountCount = 0;
    let mockUnmountCount = 0;

    beforeEach(() => {
        jest.useFakeTimers();
        mockMountCount = 0;
        mockUnmountCount = 0;
        mockedCountrySelectionList.mockClear();
        mockedPrepareStandaloneBankAccountSetup.mockClear();
        mockedNavigateToBankAccountRoute.mockClear();
        mockedCountrySelectionList.mockImplementation(() => {
            React.useEffect(() => {
                mockMountCount += 1;

                return () => {
                    mockUnmountCount += 1;
                };
            }, []);

            return <View />;
        });
    });

    it('keeps the child list mounted while persisting the selected country and navigating', async () => {
        // Given the country list mounted within the bank account setup screen.
        render(
            <NavigationContainer>
                <Stack.Navigator>
                    <Stack.Screen
                        name={SCREENS.SETTINGS.BANK_ACCOUNT_PURPOSE}
                        component={CountrySelection}
                    />
                </Stack.Navigator>
            </NavigationContainer>,
        );

        const initialProps = mockedCountrySelectionList.mock.lastCall?.[0];
        expect(mockMountCount).toBe(1);
        expect(mockUnmountCount).toBe(0);

        // When the user chooses Lithuania and confirms bank account setup.
        act(() => {
            initialProps?.onCountrySelected('LT');
        });

        const updatedSelectionProps = mockedCountrySelectionList.mock.lastCall?.[0];
        expect(updatedSelectionProps?.selectedCountry).toBe('LT');
        expect(mockMountCount).toBe(1);
        expect(mockUnmountCount).toBe(0);

        // Async act flushes the microtask after usePressLoading's deferring await, so the deferred actions run before the assertions.
        await act(async () => {
            updatedSelectionProps?.onConfirm();
            jest.runOnlyPendingTimers();
        });

        // Then setup preserves the selected country and the list stays mounted while navigating.
        expect(mockedPrepareStandaloneBankAccountSetup).toHaveBeenCalledWith(CONST.BBA_COUNTRY_CURRENCY_MAP.LT, 'LT');
        expect(mockedNavigateToBankAccountRoute).toHaveBeenCalledWith({backTo: ROUTES.SETTINGS_BANK_ACCOUNT_PURPOSE});
        expect(mockMountCount).toBe(1);
        expect(mockUnmountCount).toBe(0);
    });

    afterEach(() => {
        jest.useRealTimers();
    });
});
