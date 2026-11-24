import {act, render} from '@testing-library/react-native';

import SelectionScreen from '@components/SelectionScreen';
import type {SelectorType} from '@components/SelectionScreen';

import {updateDigitsBillPaymentAccount} from '@libs/actions/connections/Digits';

import DigitsBillPaymentAccountPage from '@pages/workspace/accounting/digits/advanced/DigitsBillPaymentAccountPage';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';
import type {DigitsAccount} from '@src/types/onyx/Policy';

import React from 'react';

import createMock from '../utils/createMock';

let mockPolicy = createMock<Policy>({});

type DigitsBillPaymentAccountPageProps = React.ComponentProps<typeof DigitsBillPaymentAccountPage>;

jest.mock('@components/SelectionScreen', () => jest.fn(() => null));
jest.mock('@pages/workspace/withPolicyConnections', () => (WrappedComponent: React.ComponentType<{policy: Policy}>) => () => <WrappedComponent policy={mockPolicy} />);
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyIllustrations: jest.fn(() => ({Telescope: 'Telescope'})),
}));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);
jest.mock('@libs/actions/connections/Digits', () => ({
    clearDigitsErrorField: jest.fn(),
    updateDigitsBillPaymentAccount: jest.fn(),
}));
jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
}));

const NEW_COMPANY_ACCOUNTS: DigitsAccount[] = [
    {id: 'cards', name: 'Credit Cards', type: 'Liabilities', subtype: CONST.DIGITS_ACCOUNT_SUBTYPE.CREDIT_CARDS, isActive: false},
    {id: 'bank', name: 'Bank Accounts', type: 'Assets', subtype: CONST.DIGITS_ACCOUNT_SUBTYPE.BANK_ACCOUNTS, isActive: false},
    {id: 'savings', name: 'Savings', type: 'Assets', subtype: CONST.DIGITS_ACCOUNT_SUBTYPE.BANK_ACCOUNTS, isActive: false},
];

function renderPage(accounts: DigitsAccount[]) {
    mockPolicy = createMock<Policy>({id: '1', connections: {digits: {config: {sync: {}}, data: {accounts}}}});
    render(<DigitsBillPaymentAccountPage {...createMock<DigitsBillPaymentAccountPageProps>({})} />);
}

describe('DigitsBillPaymentAccountPage', () => {
    const mockedSelectionScreen = jest.mocked(SelectionScreen);

    beforeEach(() => {
        mockedSelectionScreen.mockClear();
        jest.mocked(updateDigitsBillPaymentAccount).mockClear();
    });

    it('lists inactive bank accounts and selects the one the sync uses by default', () => {
        // Given a new Digits company, where every account is inactive until it has ledger activity, and no saved bill payment account
        renderPage(NEW_COMPANY_ACCOUNTS);

        // When the page renders
        const props = mockedSelectionScreen.mock.lastCall?.[0];

        // Then only the bank accounts are listed, and the first one shows as selected because the sync uses it while none is saved
        expect(props?.data?.map((item) => item.text)).toEqual(['Bank Accounts', 'Savings']);
        expect(props?.data?.filter((item) => item.isSelected).map((item) => item.text)).toEqual(['Bank Accounts']);
    });

    it('saves the default account when the admin picks it', () => {
        // Given a new Digits company with no saved bill payment account
        renderPage(NEW_COMPANY_ACCOUNTS);

        // When the admin picks the account already shown as the default
        act(() => {
            mockedSelectionScreen.mock.lastCall?.[0].onSelectRow?.(createMock<SelectorType>({value: 'bank'}));
        });

        // Then it's saved, so a later change to the default doesn't move the admin's choice
        expect(updateDigitsBillPaymentAccount).toHaveBeenCalledWith('1', 'bank', undefined);
    });
});
