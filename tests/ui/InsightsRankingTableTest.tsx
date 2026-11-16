import {cleanup, fireEvent, render, screen, within} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {GroupedItem} from '@components/Search/types';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import Navigation from '@libs/Navigation/Navigation';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import InsightsRankingTable from '@pages/Insights/charts/InsightsRankingTable';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import currencyList from '../unit/currencyList.json';
import createMock from '../utils/createMock';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@hooks/useResponsiveLayout', () => ({__esModule: true, default: jest.fn()}));
jest.mock('@libs/Navigation/Navigation');
jest.mock('@libs/getPlatform', () => ({__esModule: true, default: () => 'web'}));

const QUERY = buildSearchQueryJSON('type:expense group-by:violation view:table limit:15 has:submitted-violation date>=2026-01-01 date<=2026-01-31');
const GROUP: GroupedItem = {
    groupedBy: CONST.SEARCH.GROUP_BY.VIOLATION,
    violation: 'missingReceipt',
    formattedViolation: 'Missing receipt',
    keyForList: 'group_missingReceipt',
    count: 10,
    total: 12345,
    currency: CONST.CURRENCY.USD,
    percentOfTotal: 25,
    transactions: [],
};

function renderTable(comparisonCount?: number, isComparingPreviousPeriod = comparisonCount !== undefined) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrencyListContextProvider]}>
            <InsightsRankingTable
                title="Top violations"
                data={[GROUP]}
                groupBy={CONST.SEARCH.GROUP_BY.VIOLATION}
                comparison={comparisonCount === undefined ? undefined : {data: [{...GROUP, count: comparisonCount}], color: '#000000'}}
                isComparingPreviousPeriod={isComparingPreviousPeriod}
                queryJSON={QUERY}
            />
        </ComposeProviders>,
    );
}

describe('Insights ranking table', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    beforeEach(async () => {
        jest.clearAllMocks();
        jest.mocked(useResponsiveLayout).mockReturnValue(createMock<ReturnType<typeof useResponsiveLayout>>({shouldUseNarrowLayout: false}));
        await Onyx.set(ONYXKEYS.CURRENCY_LIST, currencyList);
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        cleanup();
        await Onyx.clear();
    });

    it('exposes desktop data as rows without a conflicting button role', async () => {
        // Given a wide web layout with a previous-period comparison
        renderTable(5);
        await waitForBatchedUpdatesWithAct();

        // When a screen reader finds the data row
        const row = screen.getByRole(CONST.ROLE.ROW, {name: 'Missing receipt, 10 expenses, 25.0%, $123.45, Up 100%'});

        // Then the web pressable can preserve the row role instead of prioritizing a conflicting button role
        expect(row).toHaveProp('role', CONST.ROLE.ROW);
        expect(row.props.accessibilityRole).toBeUndefined();
        expect(within(row).getByText('$123.45')).toBeOnTheScreen();
        expect(screen.queryAllByRole(CONST.ROLE.BUTTON)).toHaveLength(0);
    });

    it.each([
        ['more expenses than the previous period', 5, 'Up 100%'],
        ['no previous-period data', undefined, 'No change'],
    ])('announces all narrow row metrics and the change with %s', async (_description, previousCount, changeLabel) => {
        // Given a narrow layout, where each pressed row is a single accessibility element
        jest.mocked(useResponsiveLayout).mockReturnValue(createMock<ReturnType<typeof useResponsiveLayout>>({shouldUseNarrowLayout: true}));
        renderTable(previousCount, true);
        await waitForBatchedUpdatesWithAct();

        // When a screen reader focuses the row
        const row = screen.getByRole(CONST.ROLE.BUTTON, {name: `Missing receipt, 10 expenses, 25.0%, $123.45, ${changeLabel}`});

        // Then the label includes every metric rather than just the violation name
        expect(row).toBeOnTheScreen();
    });

    it('opens Spend with the chart filters and without the ranking limit', async () => {
        // Given a narrow row whose query can be opened on Spend
        jest.mocked(useResponsiveLayout).mockReturnValue(createMock<ReturnType<typeof useResponsiveLayout>>({shouldUseNarrowLayout: true}));
        renderTable();
        await waitForBatchedUpdatesWithAct();

        // When the user presses the violation
        fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON));

        // Then the destination retains the chart filters without restricting results to the ranking limit
        const route = jest.mocked(Navigation.navigate).mock.calls.at(0)?.[0];
        expect(typeof route).toBe('string');
        const decodedRoute = typeof route === 'string' ? decodeURIComponent(route) : '';
        expect(decodedRoute).toContain('has:submitted-violation');
        expect(decodedRoute).toContain('2026-01-01');
        expect(decodedRoute).not.toContain('limit:');
    });
});
