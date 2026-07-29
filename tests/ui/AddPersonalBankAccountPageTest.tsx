import {act, render} from '@testing-library/react-native';

import HeaderWithBackButton from '@components/HeaderWithBackButton';

import AddPersonalBankAccountPage from '@pages/AddPersonalBankAccountPage';

import {clearPersonalBankAccount} from '@userActions/BankAccounts';

import ROUTES from '@src/ROUTES';
import type PersonalBankAccount from '@src/types/onyx/PersonalBankAccount';

import React from 'react';

let mockPersonalBankAccount: PersonalBankAccount | undefined;

jest.mock('@pages/settings/Wallet/InternationalDepositAccount/PersonalInfo/PersonalInfo', () => jest.fn(() => null));
jest.mock('@components/ScreenWrapper', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@components/BlockingViews/FullPageNotFoundView', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@components/ScrollView', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@components/ConfirmationPage', () => jest.fn(() => null));
jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
jest.mock('@hooks/useOnyx', () => jest.fn(() => [mockPersonalBankAccount, jest.fn()]));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => ({})));
jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        goBack: jest.fn(),
        closeRHPFlow: jest.fn(),
        dismissModalWithReport: jest.fn(),
    },
    navigationRef: {current: null},
}));
jest.mock('@userActions/BankAccounts', () => ({
    clearPersonalBankAccount: jest.fn(),
}));
jest.mock('@userActions/PaymentMethods', () => ({
    continueSetup: jest.fn(),
}));

describe('AddPersonalBankAccountPage', () => {
    const mockedClearPersonalBankAccount = jest.mocked(clearPersonalBankAccount);

    beforeEach(() => {
        mockPersonalBankAccount = undefined;
        mockedClearPersonalBankAccount.mockClear();
    });

    it('keeps the KYC continuation route when the user leaves the flow mid-setup', () => {
        mockPersonalBankAccount = {onSuccessFallbackRoute: ROUTES.ENABLE_PAYMENTS};
        const {unmount} = render(<AddPersonalBankAccountPage />);

        unmount();

        expect(mockedClearPersonalBankAccount).toHaveBeenCalledWith({onSuccessFallbackRoute: ROUTES.ENABLE_PAYMENTS, exitReportID: undefined});
    });

    it('keeps the report to return to when the user leaves the flow mid-setup', () => {
        mockPersonalBankAccount = {exitReportID: '1234'};
        const {unmount} = render(<AddPersonalBankAccountPage />);

        unmount();

        expect(mockedClearPersonalBankAccount).toHaveBeenCalledWith({onSuccessFallbackRoute: undefined, exitReportID: '1234'});
    });

    it('drops the KYC continuation route once the user deliberately leaves the success screen', () => {
        mockPersonalBankAccount = {onSuccessFallbackRoute: ROUTES.ENABLE_PAYMENTS, shouldShowSuccess: true};
        const {rerender, unmount} = render(<AddPersonalBankAccountPage />);

        act(() => {
            jest.mocked(HeaderWithBackButton).mock.calls.at(-1)?.at(0)?.onBackButtonPress?.();
        });
        rerender(<AddPersonalBankAccountPage />);
        unmount();

        expect(mockedClearPersonalBankAccount.mock.calls.at(-1)?.at(0)).toBeUndefined();
    });

    it('clears everything when there is no flow to continue', () => {
        mockPersonalBankAccount = {bankAccountID: 1234};
        const {unmount} = render(<AddPersonalBankAccountPage />);

        unmount();

        expect(mockedClearPersonalBankAccount.mock.calls.at(0)?.at(0)).toBeUndefined();
    });
});
