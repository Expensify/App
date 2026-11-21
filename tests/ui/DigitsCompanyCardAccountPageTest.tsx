import {act, render} from '@testing-library/react-native';

import SelectionScreen from '@components/SelectionScreen';

import DigitsCompanyCardAccountPage from '@pages/workspace/accounting/digits/export/DigitsCompanyCardAccountPage';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';
import type {DigitsAccount} from '@src/types/onyx/Policy';

import React from 'react';

import createMock from '../utils/createMock';

const mockUseState = React.useState;
let mockPolicy = createMock<Policy>({});

type DigitsCompanyCardAccountPageProps = React.ComponentProps<typeof DigitsCompanyCardAccountPage>;

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
// Search filters on the debounced value, so skip the debounce to read the result in the same act()
jest.mock('@hooks/useDebouncedState', () =>
    jest.fn((initialValue: string) => {
        const [value, setValue] = mockUseState(initialValue);
        return [value, value, setValue];
    }),
);
jest.mock('@libs/actions/connections/Digits', () => ({
    clearDigitsErrorField: jest.fn(),
    updateDigitsCreditCardAccount: jest.fn(),
}));
jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
}));

function buildCardAccounts(count: number): DigitsAccount[] {
    return Array.from({length: count}, (_, index) => ({
        id: `card-${index + 1}`,
        name: `Company Visa ${index + 1}`,
        type: 'Liability',
        subtype: CONST.DIGITS_ACCOUNT_SUBTYPE.CREDIT_CARDS,
        isActive: true,
    }));
}

function renderPage(accounts: DigitsAccount[]) {
    mockPolicy = createMock<Policy>({id: '1', connections: {digits: {config: {export: {}}, data: {accounts}}}});
    render(<DigitsCompanyCardAccountPage {...createMock<DigitsCompanyCardAccountPageProps>({})} />);
}

describe('DigitsCompanyCardAccountPage', () => {
    const mockedSelectionScreen = jest.mocked(SelectionScreen);

    beforeEach(() => {
        mockedSelectionScreen.mockClear();
    });

    it('says no results match instead of asking to add accounts when a search finds nothing', () => {
        // Given enough accounts that the page shows a search input
        renderPage(buildCardAccounts(CONST.STANDARD_LIST_ITEM_LIMIT));

        // When the admin searches for a name no account has
        act(() => {
            mockedSelectionScreen.mock.lastCall?.[0].textInputOptions?.onChangeText?.('Amex');
        });

        // Then the list is empty, but it's because of the search, so the page says nothing matched and keeps the
        // "add accounts in Digits and sync again" message for a workspace that really has no accounts
        const props = mockedSelectionScreen.mock.lastCall?.[0];
        expect(props?.data).toHaveLength(0);
        expect(props?.shouldShowListEmptyContent).toBe(false);
        expect(props?.textInputOptions?.headerMessage).toBe('common.noResultsFound');
    });

    it('lists inactive bank and credit card accounts, because Digits marks unused accounts inactive', () => {
        // Given a new Digits company whose bank and credit card accounts have no ledger activity yet, next to an account of another subtype
        renderPage([
            {id: 'cards', name: 'Credit Cards', type: 'Liabilities', subtype: CONST.DIGITS_ACCOUNT_SUBTYPE.CREDIT_CARDS, isActive: false},
            {id: 'rewards', name: 'Credit Card Rewards', type: 'OtherIncome', subtype: 'CreditCardRewards', isActive: false},
            {id: 'bank', name: 'Bank Accounts', type: 'Assets', subtype: CONST.DIGITS_ACCOUNT_SUBTYPE.BANK_ACCOUNTS, isActive: false},
        ]);

        // When the page renders
        const props = mockedSelectionScreen.mock.lastCall?.[0];

        // Then both inactive accounts can be picked, and the account of another subtype stays out of the list
        expect(props?.data?.map((item) => item.text)).toEqual(['Credit Cards', 'Bank Accounts']);
        expect(props?.shouldShowListEmptyContent).toBe(true);
    });

    it('asks to add accounts in Digits when the workspace has none', () => {
        // Given a Digits connection that imported no bank or credit card accounts
        // When the page renders
        renderPage([]);

        // Then the empty list shows the message that tells the admin to add accounts in Digits and sync again
        const props = mockedSelectionScreen.mock.lastCall?.[0];
        expect(props?.data).toHaveLength(0);
        expect(props?.shouldShowListEmptyContent).toBe(true);
    });
});
