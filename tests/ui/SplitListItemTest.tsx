import {render, screen} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import SplitListItem from '@components/SelectionList/ListItem/SplitListItem';
import type {SplitListItemType} from '@components/SelectionList/ListItem/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@components/SelectionList/ListItem/SplitListItem/SplitListItemInput', () => () => null);
jest.mock('@hooks/useAnimatedHighlightStyle', () => () => ({}));
jest.mock('@hooks/useAutoFocusInput', () => () => ({inputCallbackRef: () => {}}));
jest.mock('@hooks/useCurrencyList', () => ({
    useCurrencyListActions: () => ({convertToDisplayStringWithoutCurrency: (amount: number) => String(amount)}),
}));

const createSplitItem = (category: string): SplitListItemType => ({
    keyForList: 'split-1',
    transactionID: 'split-1',
    amount: 1000,
    created: '2026-08-13',
    headerText: 'Aug 13',
    merchant: 'Coffee shop',
    category,
    currency: CONST.CURRENCY.USD,
    currencySymbol: '$',
    originalAmount: 1000,
    isEditable: true,
    mode: CONST.TAB.SPLIT.AMOUNT,
    percentage: 100,
    onSplitExpenseValueChange: jest.fn(),
});

describe('SplitListItem', () => {
    beforeAll(async () => {
        Onyx.init({
            keys: ONYXKEYS,
        });
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.DEFAULT);
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        return Onyx.clear([ONYXKEYS.NVP_PREFERRED_LOCALE]).then(waitForBatchedUpdates);
    });

    it('shows the full category hierarchy consistently in visible and accessible output', async () => {
        const item = createSplitItem('Parent:Child');

        render(
            <LocaleContextProvider>
                <SplitListItem
                    item={item}
                    showTooltip={false}
                    onSelectRow={jest.fn()}
                />
            </LocaleContextProvider>,
        );
        await waitForBatchedUpdates();

        expect(screen.getByText('Parent: Child', {includeHiddenElements: true})).toBeOnTheScreen();
        expect(screen.getByLabelText('Aug 13, Coffee shop, Parent: Child')).toBeOnTheScreen();
    });
});
