import {act, render} from '@testing-library/react-native';
import React from 'react';
import {View} from 'react-native';
import CountrySelection from '@pages/settings/Wallet/BankAccountPurposePage/substeps/CountrySelection';
import CountrySelectionList from '@pages/settings/Wallet/CountrySelectionList';
import {clearReimbursementAccount, clearReimbursementAccountDraft, navigateToBankAccountRoute, updateReimbursementAccountDraft} from '@userActions/ReimbursementAccount';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

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
    clearReimbursementAccount: jest.fn(),
    clearReimbursementAccountDraft: jest.fn(),
    navigateToBankAccountRoute: jest.fn(),
    updateReimbursementAccountDraft: jest.fn(),
}));

describe('BankAccountPurpose CountrySelection', () => {
    const mockedCountrySelectionList = jest.mocked(CountrySelectionList);
    const mockedClearReimbursementAccount = jest.mocked(clearReimbursementAccount);
    const mockedClearReimbursementAccountDraft = jest.mocked(clearReimbursementAccountDraft);
    const mockedNavigateToBankAccountRoute = jest.mocked(navigateToBankAccountRoute);
    const mockedUpdateReimbursementAccountDraft = jest.mocked(updateReimbursementAccountDraft);

    let mockMountCount = 0;
    let mockUnmountCount = 0;

    beforeEach(() => {
        mockMountCount = 0;
        mockUnmountCount = 0;
        mockedCountrySelectionList.mockClear();
        mockedClearReimbursementAccount.mockClear();
        mockedClearReimbursementAccountDraft.mockClear();
        mockedNavigateToBankAccountRoute.mockClear();
        mockedUpdateReimbursementAccountDraft.mockClear();
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

    it('keeps the child list mounted while persisting the selected country and navigating', () => {
        render(<CountrySelection />);

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

        act(() => {
            updatedSelectionProps?.onConfirm();
        });

        expect(mockedClearReimbursementAccount).toHaveBeenCalled();
        expect(mockedClearReimbursementAccountDraft).toHaveBeenCalled();
        expect(mockedUpdateReimbursementAccountDraft).toHaveBeenCalledWith({country: 'LT', currency: CONST.BBA_COUNTRY_CURRENCY_MAP.LT});
        expect(mockedNavigateToBankAccountRoute).toHaveBeenCalledWith({backTo: ROUTES.SETTINGS_BANK_ACCOUNT_PURPOSE});
        expect(mockMountCount).toBe(1);
        expect(mockUnmountCount).toBe(0);
    });
});
