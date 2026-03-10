import {act, render} from '@testing-library/react-native';
import React from 'react';
import CountrySelection from '@pages/settings/Wallet/BankAccountPurposePage/substeps/CountrySelection';
import {clearReimbursementAccount, clearReimbursementAccountDraft, navigateToBankAccountRoute, updateReimbursementAccountDraft} from '@userActions/ReimbursementAccount';
import ROUTES from '@src/ROUTES';

type CountrySelectionListProps = {
    onConfirm: () => void;
};

const mockCountrySelectionList = jest.fn<(props: CountrySelectionListProps) => null>(() => null);

jest.mock('@hooks/useOnyx', () => jest.fn(() => ['GB']));
jest.mock('@hooks/usePersonalPolicy', () => jest.fn(() => ({outputCurrency: 'GBP'})));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => ({mt5: {}})));
jest.mock('@components/FormAlertWithSubmitButton', () => 'FormAlertWithSubmitButton');
jest.mock('@pages/settings/Wallet/CountrySelectionList', () => (props: CountrySelectionListProps) => {
    return mockCountrySelectionList(props);
});
jest.mock('@userActions/ReimbursementAccount', () => ({
    clearReimbursementAccount: jest.fn(),
    clearReimbursementAccountDraft: jest.fn(),
    navigateToBankAccountRoute: jest.fn(),
    updateReimbursementAccountDraft: jest.fn(),
}));

describe('Wallet country selection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('clears reimbursement account data before navigating on confirm', () => {
        render(<CountrySelection />);

        const calls = mockCountrySelectionList.mock.calls as Array<[CountrySelectionListProps]>;
        const onConfirm: (() => void) | undefined = calls.at(-1)?.[0].onConfirm;

        expect(onConfirm).toBeDefined();
        if (!onConfirm) {
            throw new Error('Expected CountrySelectionList onConfirm callback to be defined');
        }

        act(() => {
            onConfirm();
        });

        expect(clearReimbursementAccountDraft).toHaveBeenCalledTimes(1);
        expect(clearReimbursementAccount).toHaveBeenCalledTimes(1);
        expect(updateReimbursementAccountDraft).toHaveBeenCalledWith({country: 'GB', currency: 'GBP'});
        expect(navigateToBankAccountRoute).toHaveBeenCalledWith({backTo: ROUTES.SETTINGS_BANK_ACCOUNT_PURPOSE});

        const clearCallOrder = (clearReimbursementAccount as jest.Mock).mock.invocationCallOrder.at(0);
        const navigateCallOrder = (navigateToBankAccountRoute as jest.Mock).mock.invocationCallOrder.at(0);

        expect(clearCallOrder).toBeDefined();
        expect(navigateCallOrder).toBeDefined();
        expect(clearCallOrder).toBeLessThan(navigateCallOrder);
    });
});
