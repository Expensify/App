import {act, renderHook} from '@testing-library/react-native';
import React from 'react';
import type {ReactNode} from 'react';
import Onyx from 'react-native-onyx';
import useReportActionsScroll from '@hooks/useReportActionsScroll';
import type Navigation from '@libs/Navigation/Navigation';
import {ActionListContext} from '@pages/inbox/ReportScreenContext';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';
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
const mockScrollManagerRef = {current: null};
jest.mock('@hooks/useReportScrollManager', () => ({
    __esModule: true,
    default: () => ({
        ref: mockScrollManagerRef,
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

// --- useScrollToEndOnNewMessageReceived ---
jest.mock('@hooks/useScrollToEndOnNewMessageReceived', () => ({
    __esModule: true,
    default: jest.fn(),
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
let mockReportRHPActiveRoute: string | undefined;
jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        navigate: (...args: unknown[]) => {
            mockNavigate(...args);
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
let mockRouteParams: {reportActionID?: string; backTo?: string} = {};
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
        report: createMockReport({reportID: REPORT_ID}),
        transactionThreadReport: undefined,
        parentReportAction: undefined,
        sortedVisibleReportActions: [makeAction('1')],
        markNewestActionAsRead: mockMarkNewestActionAsRead,
        completeSkippedMarkAsRead: mockCompleteSkippedMarkAsRead,
        unreadMarkerReportActionID: null,
        unreadMarkerReportActionIndex: -1,
        hasNewerActions: false,
        draftAutoScrollKey: '',
        actionBadgeTargetIndex: -1,
        sortedAllReportActionsForPagination: [],
        treatAsNoPaginationAnchor: false,
        setTreatAsNoPaginationAnchor: mockSetTreatAsNoPaginationAnchor,
        ...overrides,
    };
}

function wrapper({children}: {children: ReactNode}) {
    return <ActionListContext.Provider value={{flatListRef: null, scrollPositionRef: {current: {}}, scrollOffsetRef: mockScrollOffsetRef}}>{children}</ActionListContext.Provider>;
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

function setReportLoadingState(value: {isLoadingInitialReportActions?: boolean; hasOnceLoadedReportActions?: boolean}) {
    return Onyx.merge(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${REPORT_ID}`, value);
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
            expect(result.current.shouldFocusToTopOnMount).toBe(false);
            expect(result.current.shouldAutoscrollToBottom).toBe(false);
        });

        it('is aligned to top and focuses to top on mount for a transaction thread report', async () => {
            mockIsTransactionThread = true;

            const {result} = await renderScroll();

            expect(result.current.shouldBeAlignedToTop).toBe(true);
            expect(result.current.shouldFocusToTopOnMount).toBe(true);
            expect(result.current.shouldAutoscrollToBottom).toBe(true);
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

        it('uses the linked report action as the initial scroll key', async () => {
            mockRouteParams = {reportActionID: LINKED_ACTION_ID};

            const {result} = await renderScroll({sortedVisibleReportActions: [makeAction(LINKED_ACTION_ID)]});

            expect(result.current.initialScrollKey).toBe(LINKED_ACTION_ID);
            expect(result.current.shouldFocusToTopOnMount).toBe(false);
        });

        it('falls back to the unread marker action as the initial scroll key', async () => {
            const {result} = await renderScroll({
                unreadMarkerReportActionID: UNREAD_ACTION_ID,
                sortedVisibleReportActions: [makeAction(UNREAD_ACTION_ID)],
            });

            expect(result.current.initialScrollKey).toBe(UNREAD_ACTION_ID);
        });

        it('suppresses the initial scroll key for an aligned-to-top CREATED anchor action', async () => {
            mockIsTransactionThread = true;
            mockRouteParams = {reportActionID: LINKED_ACTION_ID};

            const {result} = await renderScroll({
                sortedVisibleReportActions: [makeAction(LINKED_ACTION_ID, {actionName: CONST.REPORT.ACTIONS.TYPE.CREATED})],
            });

            expect(result.current.initialScrollKey).toBeUndefined();
            // No key + aligned-to-top → focus to top.
            expect(result.current.shouldFocusToTopOnMount).toBe(true);
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

            expect(mockScrollToIndex).toHaveBeenCalledWith(5);
        });
    });

    describe('flushPendingScrollToBottom', () => {
        it('does nothing when scroll-to-bottom is not enabled', async () => {
            mockIsScrollToBottomEnabled = false;

            const {result} = await renderScroll();
            act(() => {
                result.current.flushPendingScrollToBottom();
            });

            expect(mockScrollToBottom).not.toHaveBeenCalled();
            expect(mockSetIsScrollToBottomEnabled).not.toHaveBeenCalled();
            expect(mockCompleteLiveTailPrune).not.toHaveBeenCalled();
        });

        it('scrolls, disables itself and prunes when scroll-to-bottom is enabled', async () => {
            mockIsScrollToBottomEnabled = true;

            const {result} = await renderScroll();
            act(() => {
                result.current.flushPendingScrollToBottom();
            });

            expect(mockScrollToBottom).toHaveBeenCalledTimes(1);
            expect(mockSetIsScrollToBottomEnabled).toHaveBeenCalledWith(false);
            expect(mockCompleteLiveTailPrune).toHaveBeenCalledTimes(1);
        });
    });

    describe('onLoad', () => {
        it('does nothing when the list is not configured to focus to top on mount', async () => {
            const {result} = await renderScroll();
            act(() => {
                result.current.onLoad();
            });

            // Stays false for a regular chat.
            expect(result.current.shouldAutoscrollToBottom).toBe(false);
        });

        it('waits for the report actions to have loaded before disabling autoscroll-to-top', async () => {
            mockIsTransactionThread = true;
            // No loading state → onLoad bails.

            const {result} = await renderScroll();
            expect(result.current.shouldAutoscrollToBottom).toBe(true);

            act(() => {
                result.current.onLoad();
            });

            expect(result.current.shouldAutoscrollToBottom).toBe(true);
        });

        it('disables autoscroll-to-top after a frame once report actions have loaded', async () => {
            mockIsTransactionThread = true;
            await setReportLoadingState({isLoadingInitialReportActions: false, hasOnceLoadedReportActions: true});

            const {result} = await renderScroll();
            expect(result.current.shouldAutoscrollToBottom).toBe(true);

            act(() => {
                result.current.onLoad();
            });

            expect(result.current.shouldAutoscrollToBottom).toBe(false);
        });

        it('disables autoscroll-to-top when report actions finish loading after the list has mounted', async () => {
            mockIsTransactionThread = true;

            const {result} = await renderScroll();
            expect(result.current.shouldAutoscrollToBottom).toBe(true);

            // Load completes after mount → companion effect turns autoscroll off.
            await act(async () => {
                await setReportLoadingState({isLoadingInitialReportActions: false, hasOnceLoadedReportActions: true});
                await waitForBatchedUpdates();
            });

            expect(result.current.shouldAutoscrollToBottom).toBe(false);
        });
    });

    describe('effects', () => {
        it('schedules an initial scroll-to-bottom on mount for a regular chat report', async () => {
            await renderScroll();

            expect(mockScrollToBottom).not.toHaveBeenCalled();
            flushTransitions();

            expect(mockSetIsFloatingMessageCounterVisible).toHaveBeenCalledWith(false);
            expect(mockScrollToBottom).toHaveBeenCalledTimes(1);
        });

        it('does not scroll to bottom on mount when there is an initial scroll key', async () => {
            mockRouteParams = {reportActionID: LINKED_ACTION_ID};

            await renderScroll({sortedVisibleReportActions: [makeAction(LINKED_ACTION_ID)]});
            flushTransitions();

            expect(mockScrollToBottom).not.toHaveBeenCalled();
        });

        it('does not scroll to bottom on mount when the list focuses to top', async () => {
            mockIsTransactionThread = true;

            await renderScroll();
            flushTransitions();

            expect(mockScrollToBottom).not.toHaveBeenCalled();
        });

        it('auto-scrolls to bottom when a new draft key arrives near the bottom and the newest action is present', async () => {
            mockScrollOffsetRef.current = 0;

            const {rerender} = await renderScroll({draftAutoScrollKey: ''});

            rerender(buildParams({draftAutoScrollKey: 'draft-1'}));

            expect(mockSetIsFloatingMessageCounterVisible).toHaveBeenCalledWith(false);
            expect(mockScrollToBottom).toHaveBeenCalled();
        });

        it('does not auto-scroll on a new draft key when scrolled away from the bottom', async () => {
            mockScrollOffsetRef.current = 9999;

            const {rerender} = await renderScroll({draftAutoScrollKey: ''});
            mockScrollToBottom.mockClear();

            rerender(buildParams({draftAutoScrollKey: 'draft-1'}));

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
    });

    describe('pass-through values', () => {
        it('forwards tracking handlers and visibility flags from the tracking hook', async () => {
            mockIsFloatingMessageCounterVisible = true;
            mockIsActionBadgeAboveViewport = true;

            const {result} = await renderScroll();

            expect(result.current.isFloatingMessageCounterVisible).toBe(true);
            expect(result.current.isActionBadgeAboveViewport).toBe(true);
            expect(result.current.listRef).toBe(mockScrollManagerRef);

            result.current.trackVerticalScrolling(undefined);
            expect(mockTrackVerticalScrolling).toHaveBeenCalledWith(undefined);

            result.current.onViewableItemsChanged({viewableItems: [], changed: []});
            expect(mockOnViewableItemsChanged).toHaveBeenCalled();
        });
    });
});
