import {act, renderHook} from '@testing-library/react-native';

import type FlatListRefType from '@components/FlashList/types';
import type {ExternalScrollFlashListTableHandle} from '@components/MoneyRequestReportView/ExternalScrollFlashListTable';
import {createScrollOffsetStore} from '@components/MoneyRequestReportView/ExternalScrollFlashListTable';
import type {TransactionListItemData} from '@components/MoneyRequestReportView/MoneyRequestReportTransactionList';
import useScrollToNewTransaction from '@components/MoneyRequestReportView/useScrollToNewTransaction';
import ScreenVisibilityProvider from '@components/ScreenWrapper/ScreenVisibilityProvider';

import type {ViewToken} from '@src/types/utils/ReactNativeCompat';

import type {ReactNode, RefObject} from 'react';

import React, {useEffect, useState} from 'react';

import createMock from '../utils/createMock';

const TRANSACTION_LIST_ITEMS = ['1', '2', '3'].map((transactionID) => createMock<TransactionListItemData>({type: 'transaction', transaction: {transactionID}}));
const NEW_TRANSACTION_ID = '3';
const NEW_TRANSACTION_INDEX = 2;
const VIEWPORT_HEIGHT = 800;
const NEW_ROW_PAGE_OFFSET = {top: 2000, height: 40};

const scrollToIndex = jest.fn();
const scrollToOffset = jest.fn();
let setReportVisible: (isVisible: boolean) => void = () => {};

function Report({isInitiallyVisible, children}: {isInitiallyVisible: boolean; children: ReactNode}) {
    const [isVisible, setIsVisible] = useState(isInitiallyVisible);
    useEffect(() => {
        setReportVisible = setIsVisible;
    }, []);
    return <ScreenVisibilityProvider isVisible={isVisible}>{children}</ScreenVisibilityProvider>;
}

function renderScrollToNewTransaction({isReportVisible = true, shouldInlineTransactions = true}: {isReportVisible?: boolean; shouldInlineTransactions?: boolean} = {}) {
    const wrapper = ({children}: {children: ReactNode}) => <Report isInitiallyVisible={isReportVisible}>{children}</Report>;
    const listRef = createMock<NonNullable<FlatListRefType>>({current: {scrollToIndex, scrollToOffset}});
    const tableRef: RefObject<ExternalScrollFlashListTableHandle | null> = {current: {getRowPageOffset: () => NEW_ROW_PAGE_OFFSET}};
    const viewableItemsRef: RefObject<ViewToken[]> = {current: []};
    const scrollOffsetStore = createScrollOffsetStore();
    renderHook(
        () =>
            useScrollToNewTransaction({
                newTransactionID: NEW_TRANSACTION_ID,
                transactionListItems: TRANSACTION_LIST_ITEMS,
                shouldInlineTransactions,
                listRef,
                tableRef,
                viewableItemsRef,
                scrollOffsetStore,
                viewportHeight: VIEWPORT_HEIGHT,
            }),
        {wrapper},
    );
}

const waitForNextFrame = () => act(() => jest.advanceTimersByTime(100));
const scrolledIndexes = () => scrollToIndex.mock.calls.map(([{index}]: [{index: number}]) => index);

describe('useScrollToNewTransaction', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        scrollToIndex.mockClear();
        scrollToOffset.mockClear();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('scrolls the list to a new transaction on the next frame when the report can be seen', () => {
        // Given a visible report with a transaction just added
        renderScrollToNewTransaction();

        // When the next frame runs
        waitForNextFrame();

        // Then the list scrolls the new row to the middle of the screen
        expect(scrollToIndex).toHaveBeenCalledWith({index: NEW_TRANSACTION_INDEX, animated: true, viewPosition: 0.5});
    });

    it('waits until the report is uncovered to scroll to a transaction added while it was covered', () => {
        // Given a transaction added to a report while another screen covers it
        renderScrollToNewTransaction({isReportVisible: false});
        waitForNextFrame();
        expect(scrolledIndexes()).toEqual([]);

        // When the screen on top closes
        act(() => setReportVisible(true));
        waitForNextFrame();

        // Then the list scrolls to the new row
        expect(scrolledIndexes()).toEqual([NEW_TRANSACTION_INDEX]);
    });

    it('keeps the scroll for later when the report is covered before its frame runs', () => {
        // Given a visible report whose scroll to a new transaction is scheduled for the next frame
        renderScrollToNewTransaction();

        // When another screen covers the report before that frame runs
        act(() => setReportVisible(false));
        waitForNextFrame();

        // Then nothing scrolls under the cover
        expect(scrolledIndexes()).toEqual([]);

        // When the report is uncovered
        act(() => setReportVisible(true));
        waitForNextFrame();

        // Then the owed scroll happens
        expect(scrolledIndexes()).toEqual([NEW_TRANSACTION_INDEX]);
    });

    it('scrolls to a transaction only once, however often the report is covered and uncovered afterwards', () => {
        // Given a report that has already scrolled to its new transaction
        renderScrollToNewTransaction();
        waitForNextFrame();

        // When another screen covers the report and then closes
        act(() => setReportVisible(false));
        act(() => setReportVisible(true));
        waitForNextFrame();

        // Then the list is not scrolled back to that row
        expect(scrolledIndexes()).toEqual([NEW_TRANSACTION_INDEX]);
    });

    it('scrolls the page to a new row of a nested table once the report is uncovered', () => {
        // Given a covered report whose rows live in a nested table, with a row just added
        renderScrollToNewTransaction({isReportVisible: false, shouldInlineTransactions: false});
        waitForNextFrame();
        expect(scrollToOffset).not.toHaveBeenCalled();

        // When the screen on top closes
        act(() => setReportVisible(true));
        waitForNextFrame();

        // Then the page scrolls the new row to the middle of the screen
        expect(scrollToOffset).toHaveBeenCalledWith({offset: NEW_ROW_PAGE_OFFSET.top - VIEWPORT_HEIGHT / 2, animated: true});
    });
});
