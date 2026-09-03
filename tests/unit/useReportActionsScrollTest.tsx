import {act, renderHook} from '@testing-library/react-native';

import useReportActionsScroll from '@hooks/useReportActionsScroll';

import type Navigation from '@libs/Navigation/Navigation';

import {ActionListContext} from '@pages/inbox/ActionListContext';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';

import type {ReactNode} from 'react';

import React from 'react';
import Onyx from 'react-native-onyx';

import {createMockReport, getFakeReportAction} from '../utils/ReportTestUtils';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const REPORT_ID = '1';
const LINKED_ACTION_ID = '777';
const UNREAD_ACTION_ID = '888';
const NEWEST_CREATED = '2023-09-12 16:27:35.124';

// Run animation frames synchronously so the autoscroll callbacks settle within the test.
jest.spyOn(global, 'requestAnimationFrame').mockImplementation((callback: FrameRequestCallback) => {
    callback(0);
    return 0;
});

// --- useReportScrollManager ---
const mockScrollToBottom = jest.fn();
const mockScrollToIndex = jest.fn();
jest.mock('@hooks/useReportScrollManager', () => ({
    __esModule: true,
    default: () => ({
        scrollToBottom: mockScrollToBottom,
        scrollToIndex: mockScrollToIndex,
        scrollToEnd: jest.fn(),
        scrollToOffset: jest.fn(),
    }),
}));

// --- useReportUnreadMessageScrollTracking ---
const mockSetIsFloatingMessageCounterVisible = jest.fn();
const mockTrackVerticalScrolling = jest.fn();
const mockOnViewableItemsChanged = jest.fn();
const mockUpdatePillVisibility = jest.fn();
let mockIsFloatingMessageCounterVisible = false;
let mockIsActionBadgeAboveViewport = false;
jest.mock('@pages/inbox/report/useReportUnreadMessageScrollTracking', () => ({
    __esModule: true,
    default: () => ({
        isFloatingMessageCounterVisible: mockIsFloatingMessageCounterVisible,
        setIsFloatingMessageCounterVisible: mockSetIsFloatingMessageCounterVisible,
        isActionBadgeAboveViewport: mockIsActionBadgeAboveViewport,
        trackVerticalScrolling: mockTrackVerticalScrolling,
        onViewableItemsChanged: mockOnViewableItemsChanged,
        updatePillVisibility: mockUpdatePillVisibility,
    }),
}));

// --- useReportActionsNewActionLiveTail ---
const mockSetIsScrollToBottomEnabled = jest.fn();
const mockCompleteLiveTailPrune = jest.fn();
let mockIsScrollToBottomEnabled = false;
jest.mock('@pages/inbox/report/useReportActionsNewActionLiveTail', () => ({
    __esModule: true,
    default: () => ({
        isScrollToBottomEnabled: mockIsScrollToBottomEnabled,
        setIsScrollToBottomEnabled: mockSetIsScrollToBottomEnabled,
        completeLiveTailPruneAfterScrollToBottom: mockCompleteLiveTailPrune,
    }),
}));

// --- TransitionTracker ---
const mockTransitionCallbacks: Array<() => void> = [];
jest.mock('@libs/Navigation/TransitionTracker', () => ({
    __esModule: true,
    default: {
        runAfterTransitions: jest.fn(({callback}: {callback: () => void}) => {
            mockTransitionCallbacks.push(callback);
            return {cancel: jest.fn()};
        }),
    },
}));

// --- Navigation ---
const mockNavigate = jest.fn();
const mockSetParams = jest.fn();
let mockReportRHPActiveRoute: string | undefined;
jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        navigate: (...args: unknown[]) => {
            mockNavigate(...args);
        },
        setParams: (...args: unknown[]) => {
            mockSetParams(...args);
        },
        getReportRHPActiveRoute: () => mockReportRHPActiveRoute,
    },
}));

// --- openReport ---
const mockOpenReport = jest.fn();
jest.mock('@userActions/Report', () => ({
    __esModule: true,
    openReport: (...args: unknown[]) => {
        mockOpenReport(...args);
    },
}));

// --- react-navigation route ---
let mockRouteParams: {reportActionID?: string; backTo?: string; shouldScrollToLatest?: string} = {};
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof Navigation>('@react-navigation/native');
    return {
        ...actualNav,
        useRoute: () => ({params: mockRouteParams}),
    };
});

// --- ReportActionsUtils ---
let mockIsTransactionThread = false;
let mockIsSentMoneyReportAction = false;
let mockIsReportPreviewAction = false;
jest.mock('@libs/ReportActionsUtils', () => ({
    __esModule: true,
    isTransactionThread: () => mockIsTransactionThread,
    isSentMoneyReportAction: () => mockIsSentMoneyReportAction,
    isReportPreviewAction: () => mockIsReportPreviewAction,
}));

// --- ReportUtils ---
let mockIsMoneyRequestReport = false;
let mockIsInvoiceReport = false;
let mockLastVisibleActionCreated: string | undefined = NEWEST_CREATED;
jest.mock('@libs/ReportUtils', () => ({
    __esModule: true,
    isMoneyRequestReport: () => mockIsMoneyRequestReport,
    isInvoiceReport: () => mockIsInvoiceReport,
    getReportLastVisibleActionCreated: () => mockLastVisibleActionCreated,
    shouldReportAlignToTop: () => (mockIsTransactionThread && !mockIsSentMoneyReportAction) || mockIsMoneyRequestReport || mockIsInvoiceReport,
}));

// --- Browser ---
let mockIsSafari = false;
jest.mock('@libs/Browser', () => ({
    __esModule: true,
    isSafari: () => mockIsSafari,
}));

type ScrollParams = Parameters<typeof useReportActionsScroll>[0];

const mockMarkNewestActionAsRead = jest.fn();
const mockCompleteSkippedMarkAsRead = jest.fn();
const mockSetTreatAsNoPaginationAnchor = jest.fn();
const mockScrollOffsetRef = {current: 0};

function makeAction(reportActionID: string, overrides: Partial<ReportAction> = {}): ReportAction {
    return getFakeReportAction(Number(reportActionID), {
        reportActionID,
        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
        created: NEWEST_CREATED,
        ...overrides,
    });
}

function buildParams(overrides: Partial<ScrollParams> = {}): ScrollParams {
    return {
        reportID: REPORT_ID,
        conciergeChat: undefined,
        report: createMockReport({reportID: REPORT_ID}),
        transactionThreadReport: undefined,
        parentReportAction: undefined,
        sortedVisibleReportActions: [makeAction('1')],
        renderedVisibleReportActions: [makeAction('1')],
        keyExtractor: (item: ReportAction) => item.reportActionID,
        markNewestActionAsRead: mockMarkNewestActionAsRead,
        completeSkippedMarkAsRead: mockCompleteSkippedMarkAsRead,
        unreadMarkerReportActionID: null,
        unreadMarkerReportActionIndex: -1,
        hasNewerActions: false,
        actionBadgeTargetIndex: -1,
        sortedAllReportActionsForPagination: [],
        treatAsNoPaginationAnchor: false,
        setTreatAsNoPaginationAnchor: mockSetTreatAsNoPaginationAnchor,
        ...overrides,
    };
}

// Built via a function so the value isn't an inline literal the context-split lint rule would flag; these are all refs/accessors with no re-render concern.
function buildActionListContextValue() {
    return {scrollOffsetRef: mockScrollOffsetRef, getScrollOffset: () => mockScrollOffsetRef.current, registerListRef: () => {}, getListRef: () => null};
}

function wrapper({children}: {children: ReactNode}) {
    return <ActionListContext.Provider value={buildActionListContextValue()}>{children}</ActionListContext.Provider>;
}

async function renderScroll(overrides: Partial<ScrollParams> = {}) {
    const utils = renderHook((props: ScrollParams) => useReportActionsScroll(props), {initialProps: buildParams(overrides), wrapper});
    await waitForBatchedUpdatesWithAct();
    return utils;
}

function flushTransitions() {
    act(() => {
        for (const callback of mockTransitionCallbacks) {
            callback();
        }
    });
}

describe('useReportActionsScroll', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdates();
        mockTransitionCallbacks.length = 0;
        mockRouteParams = {};
        mockReportRHPActiveRoute = undefined;
        mockIsFloatingMessageCounterVisible = false;
        mockIsActionBadgeAboveViewport = false;
        mockIsScrollToBottomEnabled = false;
        mockSetIsScrollToBottomEnabled.mockImplementation((enabled: boolean) => {
            mockIsScrollToBottomEnabled = enabled;
        });
        mockIsTransactionThread = false;
        mockIsSentMoneyReportAction = false;
        mockIsReportPreviewAction = false;
        mockIsMoneyRequestReport = false;
        mockIsInvoiceReport = false;
        mockLastVisibleActionCreated = NEWEST_CREATED;
        mockIsSafari = false;
        mockScrollOffsetRef.current = 0;
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    describe('derived flags', () => {
        it('is not aligned to top for a regular chat report', async () => {
            const {result} = await renderScroll();

            expect(result.current.shouldBeAlignedToTop).toBe(false);
        });

        it('is aligned to top and focuses to top on mount for a transaction thread report', async () => {
            mockIsTransactionThread = true;

            const {result} = await renderScroll();

            expect(result.current.shouldBeAlignedToTop).toBe(true);
        });

        it('is aligned to top for a money request report', async () => {
            mockIsMoneyRequestReport = true;

            const {result} = await renderScroll();

            expect(result.current.shouldBeAlignedToTop).toBe(true);
        });

        it('is aligned to top for an invoice report', async () => {
            mockIsInvoiceReport = true;

            const {result} = await renderScroll();

            expect(result.current.shouldBeAlignedToTop).toBe(true);
        });

        it('positions a linked report action at chronological index zero', async () => {
            mockRouteParams = {reportActionID: LINKED_ACTION_ID};

            const linkedAction = makeAction(LINKED_ACTION_ID);
            const {result} = await renderScroll({sortedVisibleReportActions: [linkedAction], renderedVisibleReportActions: [linkedAction]});

            expect(result.current.initialScrollIndex).toBe(0);
            expect(result.current.initialScrollIndexParams).toEqual({viewPosition: 0, viewOffset: CONST.REPORT.ACTIONS.LINKED_MESSAGE_OFFSET});
        });

        it('positions an unread marker at chronological index zero', async () => {
            const unreadAction = makeAction(UNREAD_ACTION_ID);
            const {result} = await renderScroll({
                unreadMarkerReportActionID: UNREAD_ACTION_ID,
                sortedVisibleReportActions: [unreadAction],
                renderedVisibleReportActions: [unreadAction],
            });

            expect(result.current.initialScrollIndex).toBe(0);
        });

        it('suppresses the initial scroll key for an aligned-to-top CREATED anchor action', async () => {
            mockIsTransactionThread = true;
            mockRouteParams = {reportActionID: LINKED_ACTION_ID};

            const {result} = await renderScroll({
                sortedVisibleReportActions: [makeAction(LINKED_ACTION_ID, {actionName: CONST.REPORT.ACTIONS.TYPE.CREATED})],
            });

            expect(result.current.initialScrollIndex).toBe(0);
            expect(result.current.initialScrollIndexParams).toBeUndefined();
        });

        it('does not focus to top for a single-expense money request report opened from the X Replies link', async () => {
            mockIsMoneyRequestReport = true;
            mockRouteParams = {shouldScrollToLatest: 'true'};

            const {result} = await renderScroll();

            // Still aligned to top so short reports keep their layout, but the mount position is the latest message.
            expect(result.current.shouldBeAlignedToTop).toBe(true);
            expect(result.current.shouldFocusToTopOnMount).toBe(false);
            expect(result.current.initialScrollIndex).toBeUndefined();
        });

        it('does not focus to top for an invoice report opened from the X Replies link', async () => {
            mockIsInvoiceReport = true;
            mockRouteParams = {shouldScrollToLatest: 'true'};

            const {result} = await renderScroll();

            expect(result.current.shouldBeAlignedToTop).toBe(true);
            expect(result.current.shouldFocusToTopOnMount).toBe(false);
        });
    });

    describe('scrollToBottomAndMarkReportAsRead', () => {
        it('scrolls to bottom and marks as read when the newest action is present', async () => {
            // Default created === lastVisibleActionCreated → newest present.
            const {result} = await renderScroll();
            act(() => {
                result.current.scrollToBottomAndMarkReportAsRead();
            });

            expect(mockSetIsFloatingMessageCounterVisible).toHaveBeenCalledWith(false);
            expect(mockScrollToBottom).toHaveBeenCalledTimes(1);
            expect(mockMarkNewestActionAsRead).toHaveBeenCalledTimes(1);
            expect(mockNavigate).not.toHaveBeenCalled();
            expect(mockOpenReport).not.toHaveBeenCalled();
        });

        it('navigates and opens the report when the newest action is not present', async () => {
            mockLastVisibleActionCreated = '2099-01-01 00:00:00.000';

            const {result} = await renderScroll();
            act(() => {
                result.current.scrollToBottomAndMarkReportAsRead();
            });

            expect(mockNavigate).toHaveBeenCalledTimes(1);
            expect(mockOpenReport).toHaveBeenCalledTimes(1);
            expect(mockScrollToBottom).toHaveBeenCalledTimes(1);
            expect(mockMarkNewestActionAsRead).not.toHaveBeenCalled();
        });

        it('does not navigate when a report RHP route is already active', async () => {
            mockLastVisibleActionCreated = '2099-01-01 00:00:00.000';
            mockReportRHPActiveRoute = 'r/1/rhp';

            const {result} = await renderScroll();
            act(() => {
                result.current.scrollToBottomAndMarkReportAsRead();
            });

            expect(mockNavigate).not.toHaveBeenCalled();
            expect(mockOpenReport).toHaveBeenCalledTimes(1);
        });
    });

    describe('scrollToActionBadgeTarget', () => {
        it('does nothing when the action badge target index is negative', async () => {
            const {result} = await renderScroll({actionBadgeTargetIndex: -1});
            act(() => {
                result.current.scrollToActionBadgeTarget();
            });

            expect(mockScrollToIndex).not.toHaveBeenCalled();
        });

        it('scrolls to the action badge target index when it is valid', async () => {
            const {result} = await renderScroll({actionBadgeTargetIndex: 5});
            act(() => {
                result.current.scrollToActionBadgeTarget();
            });

            expect(mockScrollToIndex).toHaveBeenCalledWith(5, {viewPosition: 0, viewOffset: CONST.REPORT.ACTIONS.LINKED_MESSAGE_OFFSET});
        });
    });

    describe('pending live-tail requests', () => {
        it('does nothing when scroll-to-bottom is not enabled', async () => {
            mockIsScrollToBottomEnabled = false;

            await renderScroll();

            expect(mockScrollToBottom).not.toHaveBeenCalled();
            expect(mockSetIsScrollToBottomEnabled).not.toHaveBeenCalled();
            expect(mockCompleteLiveTailPrune).not.toHaveBeenCalled();
        });

        it('consumes the request after render without waiting for a future viewport layout', async () => {
            mockIsScrollToBottomEnabled = true;

            const {rerender} = await renderScroll();

            expect(mockScrollToBottom).toHaveBeenCalledTimes(1);
            expect(mockSetIsScrollToBottomEnabled).toHaveBeenCalledWith(false);
            expect(mockCompleteLiveTailPrune).toHaveBeenCalledTimes(1);

            mockScrollOffsetRef.current = 9999;
            rerender(buildParams());
            expect(mockScrollToBottom).toHaveBeenCalledTimes(1);
        });
    });

    describe('effects', () => {
        it('leaves incoming-message following to LegendList', async () => {
            mockScrollOffsetRef.current = 0;

            const {rerender} = await renderScroll();

            const actions = [makeAction('2'), makeAction('1')];
            rerender(buildParams({sortedVisibleReportActions: actions, renderedVisibleReportActions: actions.toReversed()}));

            expect(mockScrollToBottom).not.toHaveBeenCalled();
        });

        it('scrolls to bottom on mount for a single-expense money request report opened from the X Replies link', async () => {
            mockIsMoneyRequestReport = true;
            mockRouteParams = {shouldScrollToLatest: 'true'};

            await renderScroll();
            flushTransitions();

            expect(mockScrollToBottom).toHaveBeenCalledTimes(1);
        });

        it('clears the X Replies flag once it has been applied', async () => {
            mockIsMoneyRequestReport = true;
            mockRouteParams = {shouldScrollToLatest: 'true'};

            await renderScroll();

            expect(mockSetParams).toHaveBeenCalledWith({shouldScrollToLatest: undefined});
        });

        it('does not schedule a competing scroll when a streamed draft grows', async () => {
            mockScrollOffsetRef.current = 0;

            const draft = makeAction('2', {message: [{type: 'COMMENT', text: 'Hello', html: '<p>Hello</p>'}]});
            const {rerender} = await renderScroll({renderedVisibleReportActions: [makeAction('1'), draft]});
            mockScrollToBottom.mockClear();

            const updatedDraft: ReportAction = {...draft, message: [{type: 'COMMENT', text: 'Hello, here is the rest of the reply.', html: '<p>Hello, here is the rest of the reply.</p>'}]};
            rerender(buildParams({renderedVisibleReportActions: [makeAction('1'), updatedDraft]}));

            expect(mockScrollToBottom).not.toHaveBeenCalled();
        });

        it('scrolls to bottom on Safari when a new track-expense whisper action is added', async () => {
            mockIsSafari = true;

            // Whisper absent first, so the rerender adds it as new.
            const {rerender} = await renderScroll({sortedVisibleReportActions: [makeAction('2')]});
            mockTransitionCallbacks.length = 0;
            mockScrollToBottom.mockClear();

            rerender(buildParams({sortedVisibleReportActions: [makeAction('1', {actionName: CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_TRACK_EXPENSE_WHISPER})]}));
            flushTransitions();

            expect(mockScrollToBottom).toHaveBeenCalled();
        });

        it('does not scroll to bottom on Safari when the whisper action was already present', async () => {
            mockIsSafari = true;

            // Whisper present on both renders → not new → must not scroll.
            const whisper = makeAction('1', {actionName: CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_TRACK_EXPENSE_WHISPER});
            const {rerender} = await renderScroll({sortedVisibleReportActions: [whisper]});
            mockTransitionCallbacks.length = 0;
            mockScrollToBottom.mockClear();

            rerender(buildParams({sortedVisibleReportActions: [whisper]}));
            flushTransitions();

            expect(mockScrollToBottom).not.toHaveBeenCalled();
        });

        it('scrolls to bottom when a new IOU action with an error appears', async () => {
            const erroredAction = makeAction('1', {errors: {error1: 'Something went wrong'}});

            const {rerender} = await renderScroll({sortedVisibleReportActions: [makeAction('2')]});
            mockTransitionCallbacks.length = 0;
            mockScrollToBottom.mockClear();

            rerender(buildParams({sortedVisibleReportActions: [erroredAction]}));
            flushTransitions();

            expect(mockScrollToBottom).toHaveBeenCalled();
        });

        it('does not scroll to bottom when an IOU error clears (retry succeeds)', async () => {
            // Error appears → scrolls (covered above), then the retry succeeds and the error clears.
            const erroredAction = makeAction('1', {errors: {error1: 'Something went wrong'}});
            const {rerender} = await renderScroll({sortedVisibleReportActions: [makeAction('2')]});
            rerender(buildParams({sortedVisibleReportActions: [erroredAction]}));
            flushTransitions();

            mockTransitionCallbacks.length = 0;
            mockScrollToBottom.mockClear();

            // Same action, error resolved → no current error → must not yank the list to the bottom.
            rerender(buildParams({sortedVisibleReportActions: [makeAction('1')]}));
            flushTransitions();

            expect(mockScrollToBottom).not.toHaveBeenCalled();
        });

        it('scrolls to bottom when a new error appears alongside an existing unresolved error', async () => {
            const existing = makeAction('1', {errors: {error1: 'Something went wrong'}});
            const {rerender} = await renderScroll({sortedVisibleReportActions: [existing]});
            flushTransitions();

            mockTransitionCallbacks.length = 0;
            mockScrollToBottom.mockClear();

            // A second, newer action fails while '1' is still errored → genuinely new error → scroll.
            const newer = makeAction('2', {errors: {error1: 'Something went wrong'}});
            rerender(buildParams({sortedVisibleReportActions: [newer, existing]}));
            flushTransitions();

            expect(mockScrollToBottom).toHaveBeenCalled();
        });
    });

    describe('pass-through values', () => {
        it('forwards tracking handlers and visibility flags from the tracking hook', async () => {
            mockIsFloatingMessageCounterVisible = true;
            mockIsActionBadgeAboveViewport = true;

            const {result} = await renderScroll();

            expect(result.current.isFloatingMessageCounterVisible).toBe(true);
            expect(result.current.isActionBadgeAboveViewport).toBe(true);

            result.current.trackVerticalScrolling(undefined);
            expect(mockTrackVerticalScrolling).toHaveBeenCalledWith(undefined);

            result.current.onViewableItemsChanged({viewableItems: [], changed: []});
            expect(mockOnViewableItemsChanged).toHaveBeenCalled();
        });
    });
});
