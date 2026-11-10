import {act, renderHook} from '@testing-library/react-native';

import useReportActionsScroll from '@hooks/useReportActionsScroll';

import type Navigation from '@libs/Navigation/Navigation';

import {ActionListContext} from '@pages/inbox/ActionListContext';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';

import type {ReactNode} from 'react';

import React from 'react';
import {Platform} from 'react-native';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import {createMockReport, getFakeReportAction} from '../utils/ReportTestUtils';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const REPORT_ID = '1';
const LINKED_ACTION_ID = '777';
const UNREAD_ACTION_ID = '888';
const UNREAD_SUMMARY_ACTION_ID = '999';
const NEWEST_CREATED = '2023-09-12 16:27:35.124';

// Run animation frames synchronously so the autoscroll callbacks settle within the test.
jest.spyOn(global, 'requestAnimationFrame').mockImplementation((callback: FrameRequestCallback) => {
    callback(0);
    return 0;
});

// --- useReportScrollManager ---
const mockScrollToBottom = jest.fn();
const mockScrollToIndex = jest.fn();
let mockLinkedActionPosition = 40;
let mockListScroll: number | undefined;
jest.mock('@hooks/useReportScrollManager', () => ({
    __esModule: true,
    default: () => ({
        scrollToBottom: mockScrollToBottom,
        scrollToIndex: mockScrollToIndex,
        scrollToOffset: jest.fn(),
    }),
}));

// --- useReportUnreadMessageScrollTracking ---
const mockSetIsFloatingMessageCounterVisible = jest.fn();
const mockSetIsActionBadgeAboveViewport = jest.fn();
const mockTrackVerticalScrolling = jest.fn();
const mockOnViewableItemsChanged = jest.fn();
const mockUpdatePillVisibility = jest.fn();
let mockIsFloatingMessageCounterVisible = false;
let mockIsActionBadgeAboveViewport = false;
let mockShouldDisablePillTracking: boolean | undefined;
jest.mock('@pages/inbox/report/useReportUnreadMessageScrollTracking', () => ({
    __esModule: true,
    default: ({shouldDisablePillTracking}: {shouldDisablePillTracking?: boolean}) => {
        mockShouldDisablePillTracking = shouldDisablePillTracking;
        return {
            isFloatingMessageCounterVisible: mockIsFloatingMessageCounterVisible,
            setIsFloatingMessageCounterVisible: mockSetIsFloatingMessageCounterVisible,
            isActionBadgeAboveViewport: mockIsActionBadgeAboveViewport,
            setIsActionBadgeAboveViewport: mockSetIsActionBadgeAboveViewport,
            trackVerticalScrolling: mockTrackVerticalScrolling,
            onViewableItemsChanged: mockOnViewableItemsChanged,
            updatePillVisibility: mockUpdatePillVisibility,
        };
    },
}));

// --- useReportActionsNewActionLiveTail ---
const mockSetIsScrollToBottomEnabled = jest.fn();
const mockCompleteLiveTailPrune = jest.fn();
const mockRequestLiveTailJump = jest.fn();
let mockIsScrollToBottomEnabled = false;
jest.mock('@pages/inbox/report/useReportActionsNewActionLiveTail', () => ({
    __esModule: true,
    default: () => ({
        isScrollToBottomEnabled: mockIsScrollToBottomEnabled,
        setIsScrollToBottomEnabled: mockSetIsScrollToBottomEnabled,
        completeLiveTailPruneAfterScrollToBottom: mockCompleteLiveTailPrune,
        requestLiveTailJump: mockRequestLiveTailJump,
    }),
}));

// --- TransitionTracker ---
const mockTransitionCallbacks: Array<() => void> = [];
jest.mock('@libs/Navigation/TransitionTracker', () => ({
    __esModule: true,
    default: {
        runAfterTransitions: jest.fn(({callback}: {callback: () => void}) => {
            mockTransitionCallbacks.push(callback);
            return {
                cancel: jest.fn(() => {
                    const index = mockTransitionCallbacks.indexOf(callback);
                    if (index < 0) {
                        return;
                    }
                    mockTransitionCallbacks.splice(index, 1);
                }),
            };
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

// --- react-navigation route ---
let mockRouteParams: {reportActionID?: string; backTo?: string; shouldScrollToLatest?: string} = {};
let mockIsFocused = true;
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof Navigation>('@react-navigation/native');
    return {
        ...actualNav,
        useRoute: () => ({params: mockRouteParams}),
        useIsFocused: () => mockIsFocused,
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
    // This suite never builds a deleted report preview, so the real function reduces to the action's own errors.
    getVisibleReportActionErrors: (reportAction?: ReportAction) => reportAction?.errors ?? {},
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
        listID: REPORT_ID,
        reportID: REPORT_ID,
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
    return {
        scrollOffsetRef: mockScrollOffsetRef,
        getScrollOffset: () => mockScrollOffsetRef.current,
        registerListRef: () => {},
        getListRef: () => ({
            current: {
                scrollToIndex: mockScrollToIndex,
                scrollToEnd: mockScrollToBottom,
                scrollToOffset: jest.fn(),
                getState: () => ({positionByKey: () => mockLinkedActionPosition, scroll: mockListScroll, contentLength: 5000, scrollLength: 600}),
            },
        }),
    };
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
        for (const callback of mockTransitionCallbacks.splice(0)) {
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
        mockLinkedActionPosition = 40;
        mockListScroll = undefined;
        mockIsFocused = true;
        mockReportRHPActiveRoute = undefined;
        mockIsFloatingMessageCounterVisible = false;
        mockIsActionBadgeAboveViewport = false;
        mockShouldDisablePillTracking = undefined;
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

        it('bottom-aligns a linked report action when it is the final item', async () => {
            mockRouteParams = {reportActionID: LINKED_ACTION_ID};

            const linkedAction = makeAction(LINKED_ACTION_ID);
            const {result} = await renderScroll({sortedVisibleReportActions: [linkedAction], renderedVisibleReportActions: [linkedAction]});

            expect(result.current.initialScrollIndex).toBe(0);
            expect(result.current.initialScrollIndexParams).toEqual({viewPosition: 1});
            expect(result.current.shouldShowNewerActionsSkeleton).toBe(false);
        });

        it('top-aligns a final linked report action above a skeleton until the newest page loads', async () => {
            // Given OpenReport returned the linked action as the newest action of a historical page.
            mockRouteParams = {reportActionID: LINKED_ACTION_ID};
            const linkedAction = makeAction(LINKED_ACTION_ID);
            const {result, rerender} = await renderScroll({hasNewerActions: true, sortedVisibleReportActions: [linkedAction], renderedVisibleReportActions: [linkedAction]});

            // Then it opens at the usual linked offset, with a skeleton holding the space for the newer page.
            expect(result.current.initialScrollIndexParams).toEqual({viewPosition: 0, viewOffset: CONST.REPORT.ACTIONS.LINKED_MESSAGE_OFFSET});
            expect(result.current.shouldShowNewerActionsSkeleton).toBe(true);

            // When an intermediate newer page loads below it.
            const newerAction = makeAction('2');
            rerender(buildParams({hasNewerActions: true, sortedVisibleReportActions: [newerAction, linkedAction], renderedVisibleReportActions: [linkedAction, newerAction]}));

            // Then the skeleton stays, so the content below the link does not shrink while the new rows are sized.
            expect(result.current.shouldShowNewerActionsSkeleton).toBe(true);

            // When the newest page loads.
            rerender(buildParams({sortedVisibleReportActions: [newerAction, linkedAction], renderedVisibleReportActions: [linkedAction, newerAction]}));

            // Then the skeleton is removed.
            expect(result.current.shouldShowNewerActionsSkeleton).toBe(false);
        });

        it('keeps the skeleton below a linked action until its row reports the first newer row as measured', async () => {
            // Given a linked final action that opened above a skeleton for the newer page.
            mockRouteParams = {reportActionID: LINKED_ACTION_ID};
            const linkedAction = makeAction(LINKED_ACTION_ID);
            const {result, rerender} = await renderScroll({hasNewerActions: true, sortedVisibleReportActions: [linkedAction], renderedVisibleReportActions: [linkedAction]});
            expect(result.current.shouldShowSkeletonBelowLinkedAction).toBe(true);

            // When the newest page adds a row below the link.
            const newerAction = makeAction('2');
            rerender(buildParams({sortedVisibleReportActions: [newerAction, linkedAction], renderedVisibleReportActions: [linkedAction, newerAction]}));

            // Then the linked row keeps its skeleton, because LegendList hides the new row until it is measured.
            // The footer skeleton is gone, since nothing newer is left to load.
            expect(result.current.shouldShowSkeletonBelowLinkedAction).toBe(true);
            expect(result.current.shouldShowNewerActionsSkeleton).toBe(false);

            // When the skeleton reports that LegendList measured the row.
            act(() => result.current.hideSkeletonBelowLinkedAction());

            // Then the linked row drops its skeleton, because the measured row is visible and fills the space below the link.
            expect(result.current.shouldShowSkeletonBelowLinkedAction).toBe(false);
        });

        it('prefers a linked action over a later unread marker', async () => {
            // Given a linked action followed by an unread action in chronological order.
            mockRouteParams = {reportActionID: LINKED_ACTION_ID};
            const actions = [makeAction(LINKED_ACTION_ID), makeAction(UNREAD_ACTION_ID)];

            // When the list chooses its initial position.
            const {result} = await renderScroll({
                sortedVisibleReportActions: actions.toReversed(),
                renderedVisibleReportActions: actions,
                unreadMarkerReportActionID: UNREAD_ACTION_ID,
                unreadMarkerReportActionIndex: 1,
            });

            // Then the linked action is aligned below the header.
            expect(result.current.initialScrollIndex).toBe(0);
            expect(result.current.initialScrollIndexParams).toEqual({viewPosition: 0, viewOffset: CONST.REPORT.ACTIONS.LINKED_MESSAGE_OFFSET});
        });

        it('positions an unread marker at chronological index zero', async () => {
            // Given the newest action is unread and can be taller than the viewport.
            const unreadAction = makeAction(UNREAD_ACTION_ID);
            // When opening the report at its unread boundary.
            const {result} = await renderScroll({
                unreadMarkerReportActionID: UNREAD_ACTION_ID,
                sortedVisibleReportActions: [unreadAction],
                renderedVisibleReportActions: [unreadAction],
            });

            // Then the start of the action and its New marker remain visible.
            expect(result.current.initialScrollIndex).toBe(0);
            expect(result.current.initialScrollIndexParams).toEqual({viewPosition: 0, viewOffset: CONST.REPORT.ACTIONS.LINKED_MESSAGE_OFFSET});
        });

        it.each([undefined, ''])('opens at the unread boundary when the route link is %p', async (reportActionID) => {
            // Given unread content before the newest message and no message targeted by the route.
            mockRouteParams = {reportActionID};
            const actions = [makeAction('1'), makeAction(UNREAD_ACTION_ID), makeAction('2')];

            // When reopening the chat, including after sending a message cleared its previous link.
            const {result} = await renderScroll({
                sortedVisibleReportActions: actions.toReversed(),
                renderedVisibleReportActions: actions,
                unreadMarkerReportActionID: UNREAD_ACTION_ID,
                unreadMarkerReportActionIndex: 1,
            });

            // Then initial placement preserves the unread boundary instead of starting at the newest message.
            expect(result.current.initialScrollIndex).toBe(1);
            expect(result.current.initialScrollIndexParams).toEqual({viewPosition: 0, viewOffset: CONST.REPORT.ACTIONS.LINKED_MESSAGE_OFFSET});
        });

        it('ignores unread positioning in a money request report after its link is cleared', async () => {
            // Given a money request whose unread action follows its topmost action.
            mockIsMoneyRequestReport = true;
            mockRouteParams = {reportActionID: ''};
            const actions = [makeAction('1'), makeAction(UNREAD_ACTION_ID)];

            // When opening the report without a message link, its report layout still owns the initial position.
            const {result} = await renderScroll({
                sortedVisibleReportActions: actions.toReversed(),
                renderedVisibleReportActions: actions,
                unreadMarkerReportActionID: UNREAD_ACTION_ID,
                unreadMarkerReportActionIndex: 1,
            });

            // Then unread content does not replace the report's required top alignment.
            expect(result.current.initialScrollIndex).toBe(0);
            expect(result.current.initialScrollIndexParams).toBeUndefined();
        });

        it('uses the rendered summary as the initial scroll target when the unread action is collapsed', async () => {
            // Given the unread action is hidden behind a displayed summary row.
            const {result} = await renderScroll({
                unreadMarkerReportActionID: UNREAD_ACTION_ID,
                reportActionIDToDisplayIndex: new Map([[UNREAD_ACTION_ID, 1]]),
                sortedVisibleReportActions: [makeAction('1'), makeAction(UNREAD_ACTION_ID)],
                renderedVisibleReportActions: [makeAction('1'), makeAction(UNREAD_SUMMARY_ACTION_ID)],
            });

            // Then initial positioning uses the summary row in chronological order.
            expect(result.current.initialScrollIndex).toBe(1);
            expect(result.current.initialScrollIndexParams).toEqual({viewPosition: 0, viewOffset: CONST.REPORT.ACTIONS.LINKED_MESSAGE_OFFSET});
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
            expect(result.current.initialScrollIndex).toBeUndefined();
        });

        it('does not focus to top for an invoice report opened from the X Replies link', async () => {
            mockIsInvoiceReport = true;
            mockRouteParams = {shouldScrollToLatest: 'true'};

            const {result} = await renderScroll();

            expect(result.current.shouldBeAlignedToTop).toBe(true);
        });

        it('does not clear the latest route parameter when it was never set', async () => {
            // Given an ordinary report open without the X Replies flag.
            mockRouteParams = {};

            // When its scroll hook mounts.
            await renderScroll();

            // Then it leaves unrelated route parameters alone.
            expect(mockSetParams).not.toHaveBeenCalledWith({shouldScrollToLatest: undefined});
        });
    });

    describe('linked message positioning', () => {
        it('lets Android preserve an already aligned linked message when a preceding row changes height', async () => {
            // Given Android has already positioned the link and is preserving it during measurement.
            const platform = jest.replaceProperty(Platform, 'OS', 'android');
            mockRouteParams = {reportActionID: LINKED_ACTION_ID};
            mockLinkedActionPosition = 2690;
            mockListScroll = 2650;
            const {result} = await renderScroll({renderedVisibleReportActions: [makeAction('123'), makeAction(LINKED_ACTION_ID), makeAction('999')]});
            act(() => result.current.onLoad());
            flushTransitions();
            mockScrollToIndex.mockClear();

            // When LegendList updates both the measured position and its pending native scroll adjustment.
            mockLinkedActionPosition = 2460;
            mockListScroll = 2420;
            act(() => result.current.onItemSizeChanged({index: 0, previous: 500, size: 270}));
            flushTransitions();

            // Then another imperative scroll does not apply the same correction a second time.
            expect(mockScrollToIndex).not.toHaveBeenCalled();

            // A later scroll event that really moves the link still receives a correction.
            mockListScroll = 2190;
            act(() =>
                result.current.trackLinkedMessageScroll(
                    createMock<Parameters<typeof result.current.trackLinkedMessageScroll>[0]>({
                        nativeEvent: {contentOffset: {x: 0, y: 2190}, contentSize: {width: 300, height: 5000}, layoutMeasurement: {width: 300, height: 600}},
                    }),
                ),
            );
            flushTransitions();
            expect(mockScrollToIndex).toHaveBeenCalledWith(1, {animated: false, viewPosition: 0, viewOffset: CONST.REPORT.ACTIONS.LINKED_MESSAGE_OFFSET});
            platform.restore();
        });

        it('restores a linked message moved out of view by a late native scroll adjustment', async () => {
            // Given the linked message has already landed below a measured long predecessor.
            mockRouteParams = {reportActionID: LINKED_ACTION_ID};
            const {result} = await renderScroll({renderedVisibleReportActions: [makeAction(LINKED_ACTION_ID), makeAction('999')]});
            act(() => result.current.onLoad());
            flushTransitions();
            mockScrollToIndex.mockClear();

            // When a native layout adjustment moves its measured position beyond the viewport.
            mockLinkedActionPosition = 1500;
            const scrollEvent = createMock<Parameters<typeof result.current.trackLinkedMessageScroll>[0]>({
                nativeEvent: {contentOffset: {x: 0, y: 0}, contentSize: {width: 300, height: 2000}, layoutMeasurement: {width: 300, height: 600}},
            });
            act(() => result.current.trackLinkedMessageScroll(scrollEvent));
            flushTransitions();

            // Then the linked position is restored even without another row size notification.
            expect(mockScrollToIndex).toHaveBeenCalledWith(0, {animated: false, viewPosition: 0, viewOffset: CONST.REPORT.ACTIONS.LINKED_MESSAGE_OFFSET});
            mockScrollToIndex.mockClear();
            act(() => {
                result.current.stopLinkedMessagePositioning();
                result.current.trackLinkedMessageScroll(scrollEvent);
            });
            flushTransitions();
            expect(mockScrollToIndex).not.toHaveBeenCalled();
        });

        it.each([false, true])('preserves the previous viewport after returning from child screens, reader scrolled away: %s', async (didScrollAway) => {
            // Given a linked parent stays mounted after its initial positioning, with or without a later manual scroll.
            mockRouteParams = {reportActionID: LINKED_ACTION_ID};
            const actions = [makeAction(LINKED_ACTION_ID), makeAction('999')];
            const params = buildParams({sortedVisibleReportActions: actions.toReversed(), renderedVisibleReportActions: actions});
            const {result, rerender} = await renderScroll(params);
            act(() => result.current.onLoad());
            flushTransitions();
            expect(mockScrollToIndex).toHaveBeenCalled();
            if (didScrollAway) {
                act(() => result.current.stopLinkedMessagePositioning());
            }
            mockScrollToIndex.mockClear();

            // When the reader opens a thread, returns, then opens an attachment and returns again.
            for (let visit = 0; visit < 2; visit++) {
                mockIsFocused = false;
                rerender(params);
                mockIsFocused = true;
                rerender(params);
                flushTransitions();
                act(() => {
                    result.current.onItemSizeChanged({index: 0, previous: 80, size: 350});
                    result.current.trackLinkedMessageScroll(
                        createMock<Parameters<typeof result.current.trackLinkedMessageScroll>[0]>({
                            nativeEvent: {contentOffset: {x: 0, y: 900}, contentSize: {width: 300, height: 2000}, layoutMeasurement: {width: 300, height: 600}},
                        }),
                    );
                });
                flushTransitions();

                // Then neither focus nor late measurements reclaim the viewport from the reader.
                expect(mockScrollToIndex).not.toHaveBeenCalled();
            }
        });

        it('positions a new link when an initially unfocused report first becomes active', async () => {
            // Given a linked report has loaded behind another screen without ever taking focus.
            mockIsFocused = false;
            mockRouteParams = {reportActionID: LINKED_ACTION_ID};
            const params = buildParams({renderedVisibleReportActions: [makeAction(LINKED_ACTION_ID), makeAction('999')]});
            const {result, rerender} = await renderScroll(params);
            act(() => result.current.onLoad());
            flushTransitions();
            expect(mockScrollToIndex).not.toHaveBeenCalled();

            // When the report becomes visible for the first time.
            mockIsFocused = true;
            rerender(params);
            flushTransitions();

            // Then the initial link still receives its first positioning pass.
            expect(mockScrollToIndex).toHaveBeenCalledWith(0, {
                animated: false,
                viewPosition: 0,
                viewOffset: CONST.REPORT.ACTIONS.LINKED_MESSAGE_OFFSET,
            });
        });

        it('positions a different link opened while the report is behind a child screen', async () => {
            // Given a previously positioned linked report has lost focus to a child screen.
            mockRouteParams = {reportActionID: LINKED_ACTION_ID};
            const params = buildParams({renderedVisibleReportActions: [makeAction(LINKED_ACTION_ID), makeAction(UNREAD_ACTION_ID), makeAction('999')]});
            const {result, rerender} = await renderScroll(params);
            act(() => result.current.onLoad());
            flushTransitions();
            mockIsFocused = false;
            rerender(params);
            mockScrollToIndex.mockClear();

            // When another message link targets the same report before it regains focus.
            mockRouteParams = {reportActionID: UNREAD_ACTION_ID};
            rerender(params);
            flushTransitions();
            expect(mockScrollToIndex).not.toHaveBeenCalled();
            mockIsFocused = true;
            rerender(params);
            flushTransitions();

            // Then the new navigation request still positions its own highlighted message.
            expect(mockScrollToIndex).toHaveBeenCalledWith(1, {animated: false, viewPosition: 0, viewOffset: CONST.REPORT.ACTIONS.LINKED_MESSAGE_OFFSET});
        });

        it('repositions a linked PDF after its preview or preceding rows change height', async () => {
            // Given the linked PDF is initially positioned using estimated row heights.
            mockRouteParams = {reportActionID: LINKED_ACTION_ID};
            const actions = [makeAction('123'), makeAction(LINKED_ACTION_ID), makeAction('999')];
            const {result} = await renderScroll(buildParams({renderedVisibleReportActions: actions}));
            act(() => result.current.onLoad());
            flushTransitions();
            mockScrollToIndex.mockClear();

            // When the preview above it finishes measuring, then the PDF itself expands.
            act(() => result.current.onItemSizeChanged({index: 0, previous: 80, size: 350}));
            flushTransitions();
            expect(mockScrollToIndex).toHaveBeenCalledWith(1, {animated: false, viewPosition: 0, viewOffset: CONST.REPORT.ACTIONS.LINKED_MESSAGE_OFFSET});
            mockScrollToIndex.mockClear();
            act(() => result.current.onItemSizeChanged({index: 1, previous: 80, size: 350}));
            flushTransitions();

            // Then the measured target is positioned again, keeping its highlight in view.
            expect(mockScrollToIndex).toHaveBeenCalledWith(1, {animated: false, viewPosition: 0, viewOffset: CONST.REPORT.ACTIONS.LINKED_MESSAGE_OFFSET});
        });

        it('lets the reader scroll away before a pending preview correction runs', async () => {
            // Given a preview resize has scheduled a linked-message correction.
            mockRouteParams = {reportActionID: LINKED_ACTION_ID};
            const {result, rerender} = await renderScroll(buildParams({renderedVisibleReportActions: [makeAction(LINKED_ACTION_ID)]}));
            act(() => result.current.onLoad());
            flushTransitions();
            mockScrollToIndex.mockClear();
            act(() => result.current.onItemSizeChanged({index: 0, previous: 80, size: 350}));

            // When the reader takes over scrolling before the navigation/layout callback runs.
            act(() => result.current.stopLinkedMessagePositioning());
            flushTransitions();
            act(() => result.current.onItemSizeChanged({index: 0, previous: 350, size: 500}));
            rerender(buildParams({renderedVisibleReportActions: [makeAction(LINKED_ACTION_ID)]}));
            flushTransitions();

            // Then later measurements and ordinary rerenders do not reclaim the linked position.
            expect(mockScrollToIndex).not.toHaveBeenCalled();
        });

        it.each(['latest', 'badge'] as const)('stops linked corrections after explicitly jumping to the %s target', async (destination) => {
            // Given a linked message still has late preview measurements to process.
            mockRouteParams = {reportActionID: LINKED_ACTION_ID};
            const {result} = await renderScroll(buildParams({renderedVisibleReportActions: [makeAction(LINKED_ACTION_ID), makeAction('999')], actionBadgeTargetIndex: 1}));
            act(() => result.current.onLoad());
            flushTransitions();

            // When the reader selects another scroll destination.
            act(() => {
                if (destination === 'latest') {
                    result.current.scrollToBottomAndMarkReportAsRead();
                    return;
                }
                result.current.scrollToActionBadgeTarget();
            });
            mockScrollToIndex.mockClear();
            act(() => result.current.onItemSizeChanged({index: 0, previous: 80, size: 350}));
            flushTransitions();

            // Then a later measurement does not pull the list back to the old linked message.
            expect(mockScrollToIndex).not.toHaveBeenCalled();
        });

        it('does not reposition for measurements below the linked message', async () => {
            // Given the linked message is already positioned.
            mockRouteParams = {reportActionID: LINKED_ACTION_ID};
            const {result} = await renderScroll(buildParams({renderedVisibleReportActions: [makeAction(LINKED_ACTION_ID), makeAction('999')]}));
            act(() => result.current.onLoad());
            flushTransitions();
            mockScrollToIndex.mockClear();

            // When only a later message changes height.
            act(() => result.current.onItemSizeChanged({index: 1, previous: 80, size: 350}));
            flushTransitions();

            // Then the reader's viewport is left in place.
            expect(mockScrollToIndex).not.toHaveBeenCalled();
        });

        it('leaves following a new reply to the list after positioning a linked final action', async () => {
            // Given the linked final action has been positioned at the bottom.
            mockRouteParams = {reportActionID: LINKED_ACTION_ID};
            const linkedAction = makeAction(LINKED_ACTION_ID);
            const {result, rerender} = await renderScroll(buildParams({renderedVisibleReportActions: [linkedAction]}));
            act(() => result.current.onLoad());
            flushTransitions();
            expect(mockScrollToIndex).toHaveBeenCalledWith(0, {animated: false, viewPosition: 1});
            mockScrollToIndex.mockClear();

            // When a new reply arrives while normal end-following is active.
            rerender(buildParams({renderedVisibleReportActions: [linkedAction, makeAction('999')]}));
            flushTransitions();
            act(() => result.current.onItemSizeChanged({index: 0, previous: 80, size: 350}));
            flushTransitions();

            // Then the linked action does not reclaim the viewport from the new reply.
            expect(mockScrollToIndex).not.toHaveBeenCalled();
        });

        it('cancels pending positioning when the report loses focus', async () => {
            // Given a linked action has a correction waiting for navigation to finish.
            mockRouteParams = {reportActionID: LINKED_ACTION_ID};
            const params = buildParams({renderedVisibleReportActions: [makeAction(LINKED_ACTION_ID)]});
            const {result, rerender} = await renderScroll(params);
            act(() => result.current.onLoad());

            // When another report takes focus before the callback runs.
            mockIsFocused = false;
            rerender(params);
            flushTransitions();

            // Then the background list is not scrolled by a stale navigation callback.
            expect(mockScrollToIndex).not.toHaveBeenCalled();
        });

        it('waits for the replacement list to be ready after hydration', async () => {
            // Given the cached list is ready and its linked message has been positioned.
            mockRouteParams = {reportActionID: LINKED_ACTION_ID};
            const params = buildParams({renderedVisibleReportActions: [makeAction(LINKED_ACTION_ID)]});
            const {result, rerender} = await renderScroll(params);
            act(() => result.current.onLoad());
            flushTransitions();
            mockScrollToIndex.mockClear();

            // When hydration replaces that list with a newly mounted instance.
            rerender({...params, listID: `${REPORT_ID}:hydrated`});
            act(() => result.current.onItemSizeChanged({index: 0, previous: 80, size: 350}));
            flushTransitions();
            expect(mockScrollToIndex).not.toHaveBeenCalled();
            act(() => result.current.onLoad());
            flushTransitions();

            // Then the correction uses the replacement list only after it is ready.
            expect(mockScrollToIndex).toHaveBeenCalledWith(0, {animated: false, viewPosition: 1});
        });
    });

    describe('new-message following', () => {
        it.each([
            {distance: 50, shouldFollow: true},
            {distance: 250, shouldFollow: false},
            {distance: 300, shouldFollow: false},
        ])('preserves the pixel threshold at $distance pixels from the newest action', async ({distance, shouldFollow}) => {
            // Given a loaded latest page and the reader's current bottom-relative offset.
            const {rerender} = await renderScroll();
            mockScrollOffsetRef.current = distance;
            mockScrollToBottom.mockClear();
            const newestAction = makeAction('2');

            // When another user's message is appended to the chronological list.
            rerender(buildParams({sortedVisibleReportActions: [newestAction, makeAction('1')], renderedVisibleReportActions: [makeAction('1'), newestAction]}));
            await waitForBatchedUpdatesWithAct();

            // Then it follows only inside the same 250-pixel range used before the migration.
            expect(mockScrollToBottom).toHaveBeenCalledTimes(shouldFollow ? 1 : 0);
        });

        it('does not follow a newer page loaded below a linked report preview', async () => {
            // Given a linked report preview is the newest loaded action of a historical page, at the bottom of the list.
            mockRouteParams = {reportActionID: LINKED_ACTION_ID};
            mockIsReportPreviewAction = true;
            mockLastVisibleActionCreated = '2099-01-01 00:00:00.000';
            const linkedAction = makeAction(LINKED_ACTION_ID);
            const {rerender} = await renderScroll(buildParams({hasNewerActions: true, sortedVisibleReportActions: [linkedAction], renderedVisibleReportActions: [linkedAction]}));
            mockScrollToBottom.mockClear();

            // When the next newer page, which also ends with a report preview, is merged below it.
            const newerAction = makeAction('2');
            rerender(buildParams({hasNewerActions: true, sortedVisibleReportActions: [newerAction, linkedAction], renderedVisibleReportActions: [linkedAction, newerAction]}));
            await waitForBatchedUpdatesWithAct();

            // Then the page merge is not treated as a new message, so the list does not jump and request another page.
            expect(mockScrollToBottom).not.toHaveBeenCalled();
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
            expect(mockRequestLiveTailJump).not.toHaveBeenCalled();
        });

        it('waits for the latest page before scrolling when the newest action is not present', async () => {
            // Given a historical page whose newest action has not been loaded.
            mockLastVisibleActionCreated = '2099-01-01 00:00:00.000';

            const {result} = await renderScroll();
            // When the reader presses Latest messages.
            act(() => {
                result.current.scrollToBottomAndMarkReportAsRead();
            });

            // Then the existing catch-up flow owns the eventual scroll, without scrolling the old page first.
            expect(mockRequestLiveTailJump).toHaveBeenCalledTimes(1);
            expect(mockNavigate).not.toHaveBeenCalled();
            expect(mockScrollToBottom).not.toHaveBeenCalled();
            expect(mockMarkNewestActionAsRead).not.toHaveBeenCalled();
        });

        it('does not navigate when a report RHP route is already active', async () => {
            // Given a historical page with another report open in the right pane.
            mockLastVisibleActionCreated = '2099-01-01 00:00:00.000';
            mockReportRHPActiveRoute = 'r/1/rhp';

            const {result} = await renderScroll();
            // When the reader asks for the latest messages.
            act(() => {
                result.current.scrollToBottomAndMarkReportAsRead();
            });

            // Then the catch-up request leaves the focused pane in place.
            expect(mockNavigate).not.toHaveBeenCalled();
            expect(mockRequestLiveTailJump).toHaveBeenCalledTimes(1);
            expect(mockScrollToBottom).not.toHaveBeenCalled();
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

            expect(mockScrollToIndex).toHaveBeenCalledWith(5, {animated: true, viewPosition: 0, viewOffset: CONST.REPORT.ACTIONS.LINKED_MESSAGE_OFFSET});
        });

        it('leaves the pills to viewability tracking when the composer is not expanded', async () => {
            // Given a valid action badge target with the composer at its normal size
            const {result} = await renderScroll({actionBadgeTargetIndex: 5});

            // When the action badge pill is pressed
            act(() => {
                result.current.scrollToActionBadgeTarget();
            });

            // Then the pills are not hidden directly because the target scrolls into view and viewability tracking hides the pill
            expect(mockSetIsActionBadgeAboveViewport).not.toHaveBeenCalled();
            expect(mockSetIsFloatingMessageCounterVisible).not.toHaveBeenCalled();
        });

        it('hides both pills on press when the composer is expanded', async () => {
            // Given a valid action badge target while the expanded composer covers the list
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${REPORT_ID}`, true);
            const {result} = await renderScroll({actionBadgeTargetIndex: 5});

            // When the action badge pill is pressed
            act(() => {
                result.current.scrollToActionBadgeTarget();
            });

            // Then both pills are hidden directly because the target can never become viewable to hide them, and the list still scrolls
            expect(mockSetIsActionBadgeAboveViewport).toHaveBeenCalledWith(false);
            expect(mockSetIsFloatingMessageCounterVisible).toHaveBeenCalledWith(false);
            expect(mockScrollToIndex).toHaveBeenCalledWith(5, {animated: true, viewPosition: 0, viewOffset: CONST.REPORT.ACTIONS.LINKED_MESSAGE_OFFSET});
        });
    });

    describe('pill tracking', () => {
        it('waits for the current list to finish positioning before tracking pills', async () => {
            // Given a read chat whose initial scroll offsets are still estimates.
            const params = buildParams();
            const {result, rerender} = await renderScroll(params);
            expect(mockShouldDisablePillTracking).toBe(true);

            // When the initial viewport settles, its pill state can reflect the visible messages.
            act(() => result.current.onLoad());
            expect(mockShouldDisablePillTracking).toBe(false);

            // Then a replacement list must settle independently of the previous list.
            rerender({...params, listID: `${REPORT_ID}:hydrated`});
            expect(mockShouldDisablePillTracking).toBe(true);
            act(() => result.current.onLoad());
            expect(mockShouldDisablePillTracking).toBe(false);
        });

        it('refreshes pill visibility after the expanded composer collapses', async () => {
            // Given pill tracking is suspended while the expanded composer covers the report.
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${REPORT_ID}`, true);
            const {result} = await renderScroll();
            act(() => result.current.onLoad());
            mockUpdatePillVisibility.mockClear();

            // When the composer collapses and the report becomes visible again.
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${REPORT_ID}`, false);
            });
            await waitForBatchedUpdatesWithAct();

            // Then tracking resumes and the pills reflect the current scroll position.
            expect(mockShouldDisablePillTracking).toBe(false);
            expect(mockUpdatePillVisibility).toHaveBeenCalledTimes(1);
        });

        it('keeps scroll-based pill tracking enabled when the composer is not expanded', async () => {
            // Given the composer at its normal size and no linked message to position

            // When the hook renders
            const {result} = await renderScroll();
            act(() => result.current.onLoad());

            // Then scroll-based pill tracking stays enabled so the Latest messages pill follows scrolling
            expect(mockShouldDisablePillTracking).toBe(false);
        });

        it('disables scroll-based pill tracking while the composer is expanded', async () => {
            // Given the expanded composer covers the list
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${REPORT_ID}`, true);

            // When the hook renders
            await renderScroll();

            // Then scroll-based pill tracking is disabled so scrolling the hidden list cannot bring the Latest messages pill back
            expect(mockShouldDisablePillTracking).toBe(true);
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

        it('clears the stale linked-message offset and hides the pill when consuming the request', async () => {
            // Given a live-tail jump with the offset and pill left over from a linked message
            mockIsScrollToBottomEnabled = true;
            mockScrollOffsetRef.current = CONST.REPORT.ACTIONS.ACTION_VISIBLE_THRESHOLD + 1;
            mockIsFloatingMessageCounterVisible = true;

            // When the list consumes the jump without emitting another scroll event
            await renderScroll();

            // Then later content size changes cannot restore the pill from the historical offset
            expect(mockScrollOffsetRef.current).toBe(0);
            expect(mockSetIsFloatingMessageCounterVisible).toHaveBeenCalledWith(false);
            expect(mockScrollToBottom).toHaveBeenCalledTimes(1);
            expect(mockSetIsScrollToBottomEnabled).toHaveBeenCalledWith(false);
            expect(mockCompleteLiveTailPrune).toHaveBeenCalledTimes(1);
        });
    });

    describe('effects', () => {
        it('follows incoming messages through the shared pixel-based policy', async () => {
            mockScrollOffsetRef.current = 0;

            const {rerender} = await renderScroll();

            const actions = [makeAction('2'), makeAction('1')];
            rerender(buildParams({sortedVisibleReportActions: actions, renderedVisibleReportActions: actions.toReversed()}));

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
