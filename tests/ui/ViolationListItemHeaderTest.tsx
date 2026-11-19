import {act, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {TransactionViolationGroupListItemType} from '@components/Search/SearchList/ListItem/types';
import ViolationListItemHeader from '@components/Search/SearchList/ListItem/ViolationListItemHeader';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import createMockSearchContext from '../utils/createMockSearchContext';
import MockSearchContextProvider from '../utils/MockSearchContextProvider';
import testSearchGroupHeader from '../utils/testSearchGroupHeader';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/ConfirmedRoute.tsx');
jest.mock('@libs/Navigation/Navigation');
jest.mock('@hooks/useResponsiveLayout', () => jest.fn());

// SearchUIUtils builds this row from the violation group and its translated name.
const createViolationItem = (): TransactionViolationGroupListItemType =>
    createMock<TransactionViolationGroupListItemType>({
        groupedBy: CONST.SEARCH.GROUP_BY.VIOLATION,
        violation: CONST.VIOLATIONS.MISSING_CATEGORY,
        formattedViolation: 'Missing category',
        keyForList: 'group_missingCategory',
        transactions: [],
        count: 7,
        total: 12345,
        currency: 'USD',
    });

type ViolationHeaderProps = Parameters<typeof ViolationListItemHeader<TransactionViolationGroupListItemType>>[0];

function renderHeader(item: TransactionViolationGroupListItemType, props: Partial<Omit<ViolationHeaderProps, 'violation'>> = {}) {
    const {state, actions} = createMockSearchContext();
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrencyListContextProvider]}>
            <MockSearchContextProvider
                state={state}
                actions={actions}
            >
                <ViolationListItemHeader<TransactionViolationGroupListItemType>
                    violation={item}
                    canSelectMultiple
                    columns={[CONST.SEARCH.TABLE_COLUMNS.GROUP_VIOLATION, CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES, CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL]}
                    {...props}
                />
            </MockSearchContextProvider>
        </ComposeProviders>,
    );
}

describe('ViolationListItemHeader', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));
    beforeEach(() => {
        jest.mocked(useResponsiveLayout).mockReturnValue(createMock<ReturnType<typeof useResponsiveLayout>>({isLargeScreenWidth: true}));
    });
    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    testSearchGroupHeader<TransactionViolationGroupListItemType>({
        createItem: createViolationItem,
        renderHeader: (item, props, onCheckboxPress) => renderHeader(item, {...props, onCheckboxPress}),
        identifyingColumn: CONST.SEARCH.TABLE_COLUMNS.GROUP_VIOLATION,
        identifyingText: 'Missing category',
        cellText: /^(\$123\.45|Missing category|7)$/,
    });

    it('shows the translated violation name, the expense count and the total', async () => {
        // Given a violation group, whose raw name is an internal key users shouldn't see
        const item = createViolationItem();

        // When its header renders in the default Violation, Expenses and Total columns
        renderHeader(item);
        await waitForBatchedUpdatesWithAct();

        // Then each column shows its value, with the translated name in place of the raw one
        expect(screen.getByText('Missing category')).toBeOnTheScreen();
        expect(screen.queryByText(CONST.VIOLATIONS.MISSING_CATEGORY)).toBeNull();
        expect(screen.getByText('7')).toBeOnTheScreen();
        expect(screen.getByText('$123.45')).toBeOnTheScreen();
    });
});
