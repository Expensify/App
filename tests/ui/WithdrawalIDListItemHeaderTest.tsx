import {act, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {TransactionWithdrawalIDGroupListItemType} from '@components/Search/SearchList/ListItem/types';
import WithdrawalIDListItemHeader from '@components/Search/SearchList/ListItem/WithdrawalIDListItemHeader';
import type {SearchColumnType} from '@components/Search/types';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchWithdrawalIDGroup} from '@src/types/onyx/SearchResults';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMockSearchContext from '../utils/createMockSearchContext';
import {makeSettlementGroup} from '../utils/ExpensifyCardStatementTestUtils';
import MockSearchContextProvider from '../utils/MockSearchContextProvider';
import testSearchGroupHeader from '../utils/testSearchGroupHeader';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/ConfirmedRoute.tsx');
jest.mock('@libs/Navigation/Navigation');

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
const mockedUseResponsiveLayout = jest.mocked(useResponsiveLayout);

const WIDE_COLUMNS: SearchColumnType[] = [
    CONST.SEARCH.TABLE_COLUMNS.GROUP_WITHDRAWN,
    CONST.SEARCH.TABLE_COLUMNS.GROUP_WITHDRAWAL_STATUS,
    CONST.SEARCH.TABLE_COLUMNS.GROUP_WITHDRAWAL_ID,
    CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES,
    CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL,
];

/** A settlement row by default; pass `{isCashBack: true, count: 0, total: -2500}` for the cash back variant. */
const createWithdrawalItem = (overrides: Partial<SearchWithdrawalIDGroup> = {}): TransactionWithdrawalIDGroupListItemType => ({
    ...makeSettlementGroup(overrides),
    groupedBy: CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID,
    transactions: [],
    transactionsQueryJSON: undefined,
    formattedWithdrawalID: String(overrides.entryID ?? 123),
    keyForList: `group_${overrides.entryID ?? 123}`,
});

const renderHeader = (
    item: TransactionWithdrawalIDGroupListItemType,
    onDownArrowClick?: jest.Mock,
    props: Partial<Omit<Parameters<typeof WithdrawalIDListItemHeader>[0], 'withdrawalID'>> = {},
) => {
    const {state, actions} = createMockSearchContext();
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrencyListContextProvider]}>
            <MockSearchContextProvider
                state={state}
                actions={actions}
            >
                <WithdrawalIDListItemHeader
                    withdrawalID={item}
                    canSelectMultiple={false}
                    onDownArrowClick={onDownArrowClick}
                    isExpanded={false}
                    columns={WIDE_COLUMNS}
                    {...props}
                />
            </MockSearchContextProvider>
        </ComposeProviders>,
    );
};

describe('WithdrawalIDListItemHeader', () => {
    beforeAll(() =>
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        }),
    );

    beforeEach(() => {
        mockedUseResponsiveLayout.mockReturnValue({
            isLargeScreenWidth: true,
            shouldUseNarrowLayout: false,
            isSmallScreenWidth: false,
            isMediumScreenWidth: false,
            isExtraSmallScreenWidth: false,
            isExtraSmallScreenHeight: false,
            isExtraLargeScreenWidth: true,
            isSmallScreen: false,
            isInNarrowPaneModal: false,
            onboardingIsMediumOrLargerScreenWidth: true,
            isInLandscapeMode: false,
        });
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    testSearchGroupHeader({
        createItem: createWithdrawalItem,
        createColumnItem: () => createWithdrawalItem({entryID: 456, total: 12345, count: 7}),
        renderHeader: (item, props, onCheckboxPress) => renderHeader(item, undefined, {canSelectMultiple: true, ...props, onCheckboxPress}),
        identifyingColumn: CONST.SEARCH.TABLE_COLUMNS.GROUP_WITHDRAWAL_ID,
        identifyingText: '456',
        cellText: /^(\$123\.45|456|7)$/,
    });

    describe('Cash back row', () => {
        it('should show the Cash back badge instead of the settlement status', async () => {
            // Given a cash back row carrying state 8, which on its own would render "Cleared"
            // When the header renders
            renderHeader(createWithdrawalItem({isCashBack: true, count: 0, total: -2500, state: 8}));
            await waitForBatchedUpdatesWithAct();

            // Then the cash back badge wins over the settlement state
            expect(screen.getByText('Cash back')).toBeOnTheScreen();
            expect(screen.queryByText('Cleared')).not.toBeOnTheScreen();
        });

        it('should leave the Expenses cell blank rather than showing a count', async () => {
            // Given a cash back row, which holds no expenses
            // When the header renders
            renderHeader(createWithdrawalItem({isCashBack: true, count: 0, total: -2500}));
            await waitForBatchedUpdatesWithAct();

            // Then the Expenses cell stays empty, since a 0 would read as an empty settlement
            expect(screen.queryByText('0')).not.toBeOnTheScreen();
        });

        it('should render the backend-signed total as a negative amount', async () => {
            // Given a cash back row whose total the backend already signs negative
            // When the header renders
            renderHeader(createWithdrawalItem({isCashBack: true, count: 0, total: -2500}));
            await waitForBatchedUpdatesWithAct();

            // Then the credit shows as a negative amount without the client flipping it again
            expect(screen.getByText('-$25.00')).toBeOnTheScreen();
        });
    });

    describe('Settlement row is unaffected', () => {
        it('should show the settlement status badge', async () => {
            // Given a cleared settlement row
            // When the header renders
            renderHeader(createWithdrawalItem({count: 4, total: 40000, state: 8}));
            await waitForBatchedUpdatesWithAct();

            // Then it keeps its settlement status, so the cash back badge only applies to credits
            expect(screen.getByText('Cleared')).toBeOnTheScreen();
            expect(screen.queryByText('Cash back')).not.toBeOnTheScreen();
        });

        it('should show the expense count and a positive total', async () => {
            // Given a settlement row with 4 expenses
            // When the header renders
            renderHeader(createWithdrawalItem({count: 4, total: 40000}));
            await waitForBatchedUpdatesWithAct();

            // Then its count and positive total are unchanged by the cash back handling
            expect(screen.getByText('4')).toBeOnTheScreen();
            expect(screen.getByText('$400.00')).toBeOnTheScreen();
        });
    });

    // The arrow only lives in this component on narrow layouts; on wide screens the parent owns the toggle.
    describe('Narrow layout expand arrow', () => {
        beforeEach(() => {
            mockedUseResponsiveLayout.mockReturnValue({
                isLargeScreenWidth: false,
                shouldUseNarrowLayout: true,
                isSmallScreenWidth: true,
                isMediumScreenWidth: false,
                isExtraSmallScreenWidth: false,
                isExtraSmallScreenHeight: false,
                isExtraLargeScreenWidth: false,
                isSmallScreen: true,
                isInNarrowPaneModal: false,
                onboardingIsMediumOrLargerScreenWidth: false,
                isInLandscapeMode: false,
            });
        });

        it('should render the arrow for a settlement row', async () => {
            // Given a settlement row on a narrow layout, which has expenses to expand into
            // When the header renders
            renderHeader(createWithdrawalItem({count: 4, total: 40000}), jest.fn());
            await waitForBatchedUpdatesWithAct();

            // Then the expand arrow is shown
            expect(screen.getByLabelText('Expand')).toBeOnTheScreen();
        });

        it('should not render the arrow for a cash back row', async () => {
            // Given a cash back row on a narrow layout, which has nothing to expand into
            // When the header renders
            renderHeader(createWithdrawalItem({isCashBack: true, count: 0, total: -2500}));
            await waitForBatchedUpdatesWithAct();

            // Then no expand arrow is shown
            expect(screen.queryByLabelText('Expand')).not.toBeOnTheScreen();
        });
    });
});
