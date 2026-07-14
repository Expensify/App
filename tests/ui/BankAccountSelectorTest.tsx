import {render} from '@testing-library/react-native';

import BankAccountSelector from '@components/Search/FilterComponents/BankAccountSelector';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';

import CONST from '@src/CONST';

import React from 'react';

// The bank accounts returned by the (mocked) Onyx `BANK_ACCOUNT_LIST` key. Tests mutate this to switch between a
// long list (pinning enabled) and a short list (pinning disabled). Each account's `text` drives the search filter.
let mockBankAccountList: Record<string, {accountData: {bankAccountID: number; accountNumber: string; additionalData: {bankName: string}; state: string}; text: string}> = {};
let mockSearchTerm = '';

jest.mock('@components/SelectionList/SelectionListWithSections', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItem/MultiSelectListItem', () => jest.fn(() => null));
jest.mock('@components/Icon', () => jest.fn(() => null));
jest.mock('@components/Icon/BankIcons', () => jest.fn(() => ({icon: jest.fn(() => null), iconSize: 0, iconStyles: []})));
jest.mock('@components/Search/FilterComponents/ListFilterViewWrapper', () => jest.fn(({children}: {children: React.ReactNode}) => children));

jest.mock('@hooks/useOnyx', () => jest.fn(() => [mockBankAccountList]));
jest.mock('@hooks/useDebouncedState', () => jest.fn(() => [mockSearchTerm, mockSearchTerm, jest.fn()]));
jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({isLargeScreenWidth: true})));
jest.mock('@hooks/useTheme', () => jest.fn(() => ({})));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => ({})));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);
jest.mock('@src/types/utils/isLoadingOnyxValue', () => jest.fn(() => false));
jest.mock('@libs/BankAccountUtils', () => ({
    // The mocked account carries its display label directly on `text`.
    getBankAccountSearchLabel: (bankAccount: {text: string}) => bankAccount.text,
    isFilterableBankAccount: () => true,
}));

describe('BankAccountSelector', () => {
    const mockedSelectionList = jest.mocked(SelectionListWithSections);

    // Build `count` open bank accounts keyed "1".."count" (IDs must be truthy, so they start at 1).
    // `matcher` optionally decides which accounts' labels contain the word "match" so the search test can target them.
    const buildBankAccounts = (count: number, matcher?: (key: string) => boolean) => {
        const list: typeof mockBankAccountList = {};
        for (let index = 1; index <= count; index++) {
            const key = index.toString();
            list[key] = {
                accountData: {
                    bankAccountID: index,
                    accountNumber: `0000${index}`,
                    additionalData: {bankName: 'Chase'},
                    state: CONST.BANK_ACCOUNT.STATE.OPEN,
                },
                text: matcher?.(key) ? `match ${key}` : `Bank ${key}`,
            };
        }
        return list;
    };

    const getSections = () => mockedSelectionList.mock.lastCall?.[0].sections ?? [];

    beforeEach(() => {
        mockedSelectionList.mockClear();
        mockSearchTerm = '';
        // A long list so the "move selected to top" behavior is enabled.
        mockBankAccountList = buildBankAccounts(CONST.STANDARD_LIST_ITEM_LIMIT + 2);
    });

    it('floats the initially-selected bank account to the top of a long list', () => {
        render(
            <BankAccountSelector
                value={['11']}
                onChange={jest.fn()}
            />,
        );

        const sections = getSections();
        // Top section holds only the pre-selected account.
        expect(sections.at(0)?.data.map((item) => item.keyForList)).toEqual(['11']);
        // Main section keeps every other account, with the pinned one removed.
        expect(sections.at(1)?.data.map((item) => item.keyForList)).not.toContain('11');
        expect(sections.at(1)?.data).toHaveLength(CONST.STANDARD_LIST_ITEM_LIMIT + 1);
    });

    it('keeps a bank account in place when it is toggled after first render (does not jump to the top)', () => {
        const {rerender} = render(
            <BankAccountSelector
                value={['11']}
                onChange={jest.fn()}
            />,
        );

        // Simulate the user toggling another account on: the parent re-renders the filter with the updated value.
        rerender(
            <BankAccountSelector
                value={['11', '4']}
                onChange={jest.fn()}
            />,
        );

        const sections = getSections();
        // Only the originally pre-selected account stays pinned at the top.
        expect(sections.at(0)?.data.map((item) => item.keyForList)).toEqual(['11']);

        // The newly toggled account is marked selected but stays in its natural position (keys "1".."14" minus "11",
        // so "4" is at index 3) instead of jumping up.
        const mainSection = sections.at(1)?.data ?? [];
        expect(mainSection.findIndex((item) => item.keyForList === '4')).toBe(3);
        expect(mainSection.find((item) => item.keyForList === '4')?.isSelected).toBe(true);
    });

    it('keeps the initially-selected account pinned at the top while searching, and drops non-matching pinned accounts', () => {
        // Only accounts "3", "11", and "12" have labels containing the search term. "11" is pinned and matches -> it
        // stays at the top; "5" is pinned but does not match -> it is dropped.
        mockSearchTerm = 'match';
        mockBankAccountList = buildBankAccounts(CONST.STANDARD_LIST_ITEM_LIMIT + 2, (key) => key === '3' || key === '11' || key === '12');

        render(
            <BankAccountSelector
                value={['11', '5']}
                onChange={jest.fn()}
            />,
        );

        const sections = getSections();
        // The pinned account that still matches the search stays at the top; the non-matching pinned account is dropped.
        expect(sections.at(0)?.data.map((item) => item.keyForList)).toEqual(['11']);
        // The main section shows the remaining matches with the pinned one removed (no duplicate).
        expect(sections.at(1)?.data.map((item) => item.keyForList)).toEqual(['3', '12']);
    });

    it('does not pin selected accounts to the top of a short list', () => {
        mockBankAccountList = buildBankAccounts(5);

        render(
            <BankAccountSelector
                value={['2']}
                onChange={jest.fn()}
            />,
        );

        const sections = getSections();
        // No pinned section for a short list.
        expect(sections.at(0)?.data).toHaveLength(0);
        // Every account stays in place; the selected one is simply marked in position.
        const mainSection = sections.at(1)?.data ?? [];
        expect(mainSection.map((item) => item.keyForList)).toEqual(['1', '2', '3', '4', '5']);
        expect(mainSection.find((item) => item.keyForList === '2')?.isSelected).toBe(true);
    });
});
