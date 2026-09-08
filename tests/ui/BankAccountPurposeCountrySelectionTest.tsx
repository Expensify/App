import {act, render} from '@testing-library/react-native';

import useOnyx from '@hooks/useOnyx';

import CountrySelection from '@pages/settings/Wallet/BankAccountPurposePage/substeps/CountrySelection';
import CountrySelectionList from '@pages/settings/Wallet/CountrySelectionList';

import {clearReimbursementAccount, clearReimbursementAccountDraft, navigateToBankAccountRoute, updateReimbursementAccountDraft} from '@userActions/ReimbursementAccount';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
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
jest.mock('@hooks/useOnyx', () => jest.fn(() => [undefined, {status: 'loaded'}]));
jest.mock('@hooks/usePersonalPolicy', () => jest.fn(() => ({outputCurrency: undefined})));
jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(() => ({
        mt5: {},
    })),
);
jest.mock('@userActions/ReimbursementAccount', () => ({
    clearReimbursementAccount: jest.fn(),
    clearReimbursementAccountDraft: jest.fn(),
    navigateToBankAccountRoute: jest.fn(),
    updateReimbursementAccountDraft: jest.fn(),
}));
jest.mock('@userActions/BankAccounts', () => ({
    clearInternationalBankAccount: jest.fn(),
    clearPersonalBankAccount: jest.fn(),
}));
jest.mock('@userActions/FormActions', () => ({
    clearDraftValues: jest.fn(),
}));

const Stack = createStackNavigator();

describe('BankAccountPurpose CountrySelection', () => {
    const mockedCountrySelectionList = jest.mocked(CountrySelectionList);
    const mockedClearReimbursementAccount = jest.mocked(clearReimbursementAccount);
    const mockedClearReimbursementAccountDraft = jest.mocked(clearReimbursementAccountDraft);
    const mockedNavigateToBankAccountRoute = jest.mocked(navigateToBankAccountRoute);
    const mockedUpdateReimbursementAccountDraft = jest.mocked(updateReimbursementAccountDraft);
    const mockedUseOnyx = jest.mocked(useOnyx);

    let mockMountCount = 0;
    let mockUnmountCount = 0;

    beforeEach(() => {
        jest.useFakeTimers();
        mockMountCount = 0;
        mockUnmountCount = 0;
        mockedCountrySelectionList.mockClear();
        mockedClearReimbursementAccount.mockClear();
        mockedClearReimbursementAccountDraft.mockClear();
        mockedNavigateToBankAccountRoute.mockClear();
        mockedUpdateReimbursementAccountDraft.mockClear();
        mockedUseOnyx.mockImplementation(() => [undefined, {status: 'loaded'}]);
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

    it('preserves a compatible business draft and reuses its backend identity', async () => {
        mockedUseOnyx.mockImplementation((key) => {
            if (key === ONYXKEYS.REIMBURSEMENT_ACCOUNT) {
                return [{achData: {policyID: 'policy-1', bankAccountID: 123}}, {status: 'loaded'}];
            }
            if (key === ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT) {
                return [{country: 'LT', currency: CONST.BBA_COUNTRY_CURRENCY_MAP.LT, companyName: 'Example'}, {status: 'loaded'}];
            }
            return [undefined, {status: 'loaded'}];
        });

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

        act(() => {
            mockedCountrySelectionList.mock.lastCall?.[0]?.onCountrySelected('LT');
        });
        await act(async () => {
            mockedCountrySelectionList.mock.lastCall?.[0]?.onConfirm();
            jest.runOnlyPendingTimers();
        });

        expect(mockedClearReimbursementAccount).not.toHaveBeenCalled();
        expect(mockedClearReimbursementAccountDraft).not.toHaveBeenCalled();
        expect(mockedUpdateReimbursementAccountDraft).not.toHaveBeenCalled();
        expect(mockedNavigateToBankAccountRoute).toHaveBeenCalledWith({policyID: 'policy-1', bankAccountID: 123, backTo: ROUTES.SETTINGS_BANK_ACCOUNT_PURPOSE});
    });

    it('keeps the child list mounted while persisting the selected country and navigating', async () => {
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

        expect(mockedClearReimbursementAccount).toHaveBeenCalled();
        expect(mockedClearReimbursementAccountDraft).toHaveBeenCalled();
        expect(mockedUpdateReimbursementAccountDraft).toHaveBeenCalledWith({country: 'LT', currency: CONST.BBA_COUNTRY_CURRENCY_MAP.LT});
        expect(mockedNavigateToBankAccountRoute).toHaveBeenCalledWith({backTo: ROUTES.SETTINGS_BANK_ACCOUNT_PURPOSE});
        expect(mockMountCount).toBe(1);
        expect(mockUnmountCount).toBe(0);
    });

    afterEach(() => {
        jest.useRealTimers();
    });
});
