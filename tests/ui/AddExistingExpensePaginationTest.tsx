import {act, render} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import type {AddExistingExpensesParamList} from '@libs/Navigation/types';

import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';

import AddExistingExpense from '@pages/AddExistingExpense';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Transaction} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

type AddExistingExpenseProps = PlatformStackScreenProps<AddExistingExpensesParamList, typeof SCREENS.ADD_EXISTING_EXPENSES_ROOT>;

type CapturedTableProps = {
    onEndReached: () => void;
};

let mockLatestTableProps: CapturedTableProps | undefined;

const mockFetchUnreportedExpenses = jest.fn<void, [number]>();

// Mocked so the request's optimistic loading flag never reaches Onyx, which lets the tests decide when it changes.
jest.mock('@libs/actions/UnreportedExpenses', () => ({
    fetchUnreportedExpenses: (offset: number) => mockFetchUnreportedExpenses(offset),
}));
jest.mock('@components/Tables/AddExistingExpenseTable', () => (props: CapturedTableProps) => {
    mockLatestTableProps = props;
    return null;
});
jest.mock('@components/AddExistingExpenseFooter', () => () => null);
jest.mock(
    '@components/CollapsibleHeaderOnKeyboard',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock(
    '@components/FixedFooter',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@components/HeaderWithBackButton', () => () => null);
jest.mock(
    '@components/ScreenWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);

const props = createMock<AddExistingExpenseProps>({route: {params: {reportID: 'report1'}}});

const unreportedTransaction = createMock<Transaction>({
    transactionID: '1',
    reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
    amount: 100,
    currency: CONST.CURRENCY.USD,
    created: '2026-01-01',
    merchant: 'Merchant',
});

function renderPage() {
    return render(
        <OnyxListItemProvider>
            <AddExistingExpense {...props} />
        </OnyxListItemProvider>,
    );
}

async function setIsLoadingUnreportedTransactions(isLoading: boolean) {
    await act(async () => {
        await Onyx.merge(ONYXKEYS.IS_LOADING_UNREPORTED_TRANSACTIONS, isLoading);
    });
    await waitForBatchedUpdatesWithAct();
}

function getNextPageRequests() {
    return mockFetchUnreportedExpenses.mock.calls.filter(([offset]) => offset !== 0);
}

describe('AddExistingExpense pagination', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockLatestTableProps = undefined;
        mockFetchUnreportedExpenses.mockClear();
        await Onyx.multiSet({
            [ONYXKEYS.HAS_MORE_UNREPORTED_TRANSACTIONS_RESULTS]: true,
            [ONYXKEYS.IS_LOADING_UNREPORTED_TRANSACTIONS]: false,
        });
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${unreportedTransaction.transactionID}`, unreportedTransaction);
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('requests the next page only once when onEndReached fires again before the loading flag updates', async () => {
        // Given a list with more pages to load, whose loading flag is still false
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // When the list reports reaching its end several times before Onyx applies the optimistic loading flag,
        // which happens when a short (for example, searched) list keeps re-rendering at its end
        act(() => mockLatestTableProps?.onEndReached());
        act(() => mockLatestTableProps?.onEndReached());
        act(() => mockLatestTableProps?.onEndReached());

        // Then only one next-page request is sent, so the page can't loop requesting pages until React crashes
        expect(getNextPageRequests()).toEqual([[CONST.UNREPORTED_EXPENSES_PAGE_SIZE]]);
    });

    it('requests the following page once the previous request has finished loading', async () => {
        // Given a first next-page request that is in flight
        renderPage();
        await waitForBatchedUpdatesWithAct();
        act(() => mockLatestTableProps?.onEndReached());

        // When the request settles, so the loading flag goes true and then back to false
        await setIsLoadingUnreportedTransactions(true);
        await setIsLoadingUnreportedTransactions(false);
        act(() => mockLatestTableProps?.onEndReached());

        // Then the guard has been released and the next page is requested, so pagination doesn't stall
        expect(getNextPageRequests()).toEqual([[CONST.UNREPORTED_EXPENSES_PAGE_SIZE], [CONST.UNREPORTED_EXPENSES_PAGE_SIZE * 2]]);
    });
});
