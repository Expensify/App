import {render, screen} from '@testing-library/react-native';

import SplitAmountInput from '@components/SelectionList/ListItem/SplitListItem/SplitAmountInput';
import SplitPercentageInput from '@components/SelectionList/ListItem/SplitListItem/SplitPercentageInput';
import type {SplitListItemType} from '@components/SelectionList/ListItem/types';

import CONST from '@src/CONST';

import type {View} from 'react-native';

import React from 'react';

// Each stub renders a test ID so the test can tell which variant SplitAmountInput / SplitPercentageInput chose
function mockLabel(label: string) {
    const {View: MockView} = jest.requireActual<{View: typeof View}>('react-native');
    return () => <MockView testID={label} />;
}
jest.mock('@components/MoneyRequestAmountInput', () => mockLabel('amount input'));
jest.mock('@components/PercentageForm', () => mockLabel('percentage input'));
jest.mock('@components/SelectionList/ListItem/SplitListItem/SplitAmountDisplay', () => mockLabel('amount display'));
jest.mock('@components/SelectionList/ListItem/SplitListItem/SplitPercentageDisplay', () => mockLabel('percentage display'));
jest.mock('@hooks/useCurrencyList', () => ({
    useCurrencyListActions: () => ({getCurrencyDecimals: () => 2}),
}));

const createSplitItem = (overrides: Partial<SplitListItemType> = {}): SplitListItemType => ({
    keyForList: 'split-1',
    transactionID: 'split-1',
    amount: 0,
    created: '2026-10-02',
    headerText: 'Oct 2',
    merchant: '6.00 mi @ $0.00 / mi',
    currency: CONST.CURRENCY.USD,
    currencySymbol: '$',
    originalAmount: 0,
    isEditable: true,
    mode: CONST.TAB.SPLIT.AMOUNT,
    percentage: 50,
    onSplitExpenseValueChange: jest.fn(),
    ...overrides,
});

const renderAmountInput = (splitItem: SplitListItemType) =>
    render(
        <SplitAmountInput
            splitItem={splitItem}
            formattedOriginalAmount="0.00"
            contentWidth={100}
            onSplitExpenseValueChange={jest.fn()}
            focusHandler={jest.fn()}
            inputCallbackRef={jest.fn()}
        />,
    );

const renderPercentageInput = (splitItem: SplitListItemType) =>
    render(
        <SplitPercentageInput
            splitItem={splitItem}
            contentWidth={100}
            percentageDraft={undefined}
            onSplitExpenseValueChange={jest.fn()}
            setPercentageDraft={jest.fn()}
            focusHandler={jest.fn()}
        />,
    );

describe('Split list item amount editability', () => {
    it.each([
        ['an editable split', {}, 'amount input'],
        ['a split whose amount is locked', {isAmountEditable: false}, 'amount display'],
        ['a split that is not editable', {isEditable: false}, 'amount display'],
    ])('renders the amount as %s', (_caseName, overrides: Partial<SplitListItemType>, expectedText) => {
        // Given a split in amount mode with the case's editability
        const splitItem = createSplitItem(overrides);

        // When its amount input is rendered
        renderAmountInput(splitItem);

        // Then the amount is an editable input only when both the split and its amount are editable, and a read-only display otherwise
        expect(screen.getByTestId(expectedText)).toBeOnTheScreen();
    });

    it.each([
        ['an editable split', {}, 'percentage input'],
        ['a split whose amount is locked', {isAmountEditable: false}, 'percentage display'],
    ])('renders the percentage as %s', (_caseName, overrides: Partial<SplitListItemType>, expectedText) => {
        // Given a split in percentage mode with the case's amount editability
        const splitItem = createSplitItem({mode: CONST.TAB.SPLIT.PERCENTAGE, ...overrides});

        // When its percentage input is rendered
        renderPercentageInput(splitItem);

        // Then the percentage is an editable input only when the split's amount is editable, and a read-only display otherwise
        expect(screen.getByTestId(expectedText)).toBeOnTheScreen();
    });
});
