import {act, renderHook} from '@testing-library/react-native';

import type {MoneyRequestReportPreviewStyleType} from '@components/ReportActionItem/MoneyRequestReportPreview/types';
import useReportPreviewCarousel from '@components/ReportActionItem/MoneyRequestReportPreview/useReportPreviewCarousel';
import ScreenVisibilityProvider from '@components/ScreenWrapper/ScreenVisibilityProvider';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';

import type {FlashListRef} from '@shopify/flash-list';
import type {ReactNode} from 'react';

import React, {useEffect, useState} from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const TRANSACTIONS = ['1', '2', '3'].map((transactionID, index) => createMock<Transaction>({transactionID, reportID: 'report', created: `2026-09-0${index + 1}`}));
const NEW_TRANSACTION_ID = '3';
const NEW_TRANSACTION_INDEX = 2;

let setChatVisible: (isVisible: boolean) => void = () => {};
const scrollToIndex = jest.fn();

function Chat({isInitiallyVisible, children}: {isInitiallyVisible: boolean; children: ReactNode}) {
    const [isVisible, setIsVisible] = useState(isInitiallyVisible);
    useEffect(() => {
        setChatVisible = setIsVisible;
    }, []);
    return <ScreenVisibilityProvider isVisible={isVisible}>{children}</ScreenVisibilityProvider>;
}

function renderCarousel(newTransactionIDs: Set<string>, {isChatVisible = true}: {isChatVisible?: boolean} = {}) {
    const wrapper = ({children}: {children: ReactNode}) => <Chat isInitiallyVisible={isChatVisible}>{children}</Chat>;
    const params = {
        transactions: TRANSACTIONS,
        transactionViolations: undefined,
        iouReport: undefined,
        policy: undefined,
        shouldShowAccessPlaceHolder: false,
        reportPreviewStyles: createMock<MoneyRequestReportPreviewStyleType>({transactionPreviewCarouselStyle: {width: 300}}),
        currentWidth: 400,
        renderTransactionItem: () => null,
    };
    const {result} = renderHook(({ids}: {ids: Set<string>}) => useReportPreviewCarousel({...params, newTransactionIDs: ids}), {wrapper, initialProps: {ids: newTransactionIDs}});
    act(() => {
        result.current.setCarouselRef(createMock<FlashListRef<Transaction>>({scrollToIndex}));
    });
}

const waitForScrollDelay = () => act(() => jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_SCROLL_DELAY));
const scrolledIndexes = () => scrollToIndex.mock.calls.map(([{index}]: [{index: number}]) => index);

describe('useReportPreviewCarousel', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.useFakeTimers();
        scrollToIndex.mockClear();
        await waitForBatchedUpdates();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('scrolls to a new expense once the scroll delay passes when the chat can be seen', () => {
        // Given a chat the user can see
        // When an expense in its preview becomes new
        renderCarousel(new Set([NEW_TRANSACTION_ID]));
        waitForScrollDelay();

        // Then the carousel scrolls to it
        expect(scrolledIndexes()).toEqual([NEW_TRANSACTION_INDEX]);
    });

    it('scrolls to an expense that became new while the chat was covered once the chat is uncovered', () => {
        // Given a chat covered by another screen for longer than the scroll delay
        renderCarousel(new Set([NEW_TRANSACTION_ID]), {isChatVisible: false});
        waitForScrollDelay();
        expect(scrolledIndexes()).toEqual([]);

        // When the screen on top closes
        act(() => setChatVisible(true));
        waitForScrollDelay();

        // Then the carousel scrolls to the new expense, whose highlight plays now
        expect(scrolledIndexes()).toEqual([NEW_TRANSACTION_INDEX]);
    });

    it('does not scroll when the chat is covered again before the scroll delay passes, and scrolls when it is next uncovered', () => {
        // Given a chat the user can see, with an expense that has just become new
        renderCarousel(new Set([NEW_TRANSACTION_ID]));

        // When another screen covers the chat before the delay passes
        act(() => setChatVisible(false));
        waitForScrollDelay();

        // Then nothing scrolls under the cover
        expect(scrolledIndexes()).toEqual([]);

        // When the chat is uncovered
        act(() => setChatVisible(true));
        waitForScrollDelay();

        // Then it scrolls
        expect(scrolledIndexes()).toEqual([NEW_TRANSACTION_INDEX]);
    });

    it('waits the whole scroll delay from the moment the chat is uncovered, and scrolls once', () => {
        // Given an expense that became new while the chat was covered
        renderCarousel(new Set([NEW_TRANSACTION_ID]), {isChatVisible: false});

        // When the chat is uncovered partway through the delay that started under the cover
        act(() => jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_SCROLL_DELAY / 2));
        act(() => setChatVisible(true));
        act(() => jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_SCROLL_DELAY / 2));

        // Then nothing has scrolled yet
        expect(scrolledIndexes()).toEqual([]);

        // When the rest of the delay passes
        act(() => jest.advanceTimersByTime(CONST.PENDING_TRANSACTION_SCROLL_DELAY / 2));

        // Then it scrolls, once
        expect(scrolledIndexes()).toEqual([NEW_TRANSACTION_INDEX]);
    });

    it('scrolls to a new expense only once, however often the chat is covered and uncovered while it is still new', () => {
        // Given a chat that has already scrolled its carousel to a new expense
        renderCarousel(new Set([NEW_TRANSACTION_ID]));
        waitForScrollDelay();
        expect(scrolledIndexes()).toEqual([NEW_TRANSACTION_INDEX]);

        // When the chat is covered and uncovered twice, faster than the scroll delay
        act(() => setChatVisible(false));
        act(() => setChatVisible(true));
        act(() => setChatVisible(false));
        act(() => setChatVisible(true));
        waitForScrollDelay();

        // Then the carousel is not pulled back to it
        expect(scrolledIndexes()).toEqual([NEW_TRANSACTION_INDEX]);
    });
});
