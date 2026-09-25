import {act, renderHook} from '@testing-library/react-native';

import useMoneyRequestReportScroll from '@components/MoneyRequestReportView/useMoneyRequestReportScroll';

import type useScrollToEndOnNewMessageReceived from '@hooks/useScrollToEndOnNewMessageReceived';

import {ActionListContext} from '@pages/inbox/ActionListContext';
import type useReportUnreadMessageScrollTracking from '@pages/inbox/report/useReportUnreadMessageScrollTracking';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

import type {ReactNode} from 'react';
import type {LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent} from 'react-native';

import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import {getFakeReportAction} from '../utils/ReportTestUtils';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const REPORT_ID = '1';
const CURRENT_USER_ACCOUNT_ID = 1;
const THRESHOLD = CONST.REPORT.ACTIONS.ACTION_VISIBLE_THRESHOLD;

const LIST_LAYOUT_HEIGHT = 800;
const LIST_CONTENT_HEIGHT = 1200;
const BOTTOM_OFFSET_AT_TOP = LIST_CONTENT_HEIGHT - LIST_LAYOUT_HEIGHT;
const LAST_ITEM_INDEX = 4;

const mockScrollToIndex = jest.fn();
const mockScrollToEnd = jest.fn();
jest.mock('@hooks/useReportScrollManager', () => ({
    __esModule: true,
    default: () => ({
        scrollToIndex: mockScrollToIndex,
        scrollToEnd: mockScrollToEnd,
        scrollToBottom: jest.fn(),
        scrollToOffset: jest.fn(),
    }),
}));

type UnreadTrackingArgs = Parameters<typeof useReportUnreadMessageScrollTracking>[0];

const mockSetIsFloatingMessageCounterVisible = jest.fn();
let mockOnTrackScrolling: UnreadTrackingArgs['onTrackScrolling'] | undefined;
let mockUnreadTrackingArgs: UnreadTrackingArgs | undefined;
jest.mock('@pages/inbox/report/useReportUnreadMessageScrollTracking', () => ({
    __esModule: true,
    default: (args: UnreadTrackingArgs) => {
        mockUnreadTrackingArgs = args;
        mockOnTrackScrolling = args.onTrackScrolling;
        return {
            isFloatingMessageCounterVisible: false,
            setIsFloatingMessageCounterVisible: mockSetIsFloatingMessageCounterVisible,
            isActionBadgeAboveViewport: false,
            trackVerticalScrolling: jest.fn(),
            onViewableItemsChanged: jest.fn(),
        };
    },
}));

type ScrollToEndOnNewMessageArgs = Parameters<typeof useScrollToEndOnNewMessageReceived>[0];
let mockScrollToEndOnNewMessageArgs: ScrollToEndOnNewMessageArgs | undefined;
jest.mock('@hooks/useScrollToEndOnNewMessageReceived', () => ({
    __esModule: true,
    default: (args: ScrollToEndOnNewMessageArgs) => {
        mockScrollToEndOnNewMessageArgs = args;
    },
}));

let mockCandidateAgentIDs: number[] = [];
jest.mock('@pages/inbox/AgentZeroStatusContext', () => ({
    __esModule: true,
    useAgentZeroStatus: () => ({candidateAgentIDs: mockCandidateAgentIDs}),
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: () => ({accountID: CURRENT_USER_ACCOUNT_ID}),
}));

jest.mock('@libs/Navigation/TransitionTracker', () => ({
    __esModule: true,
    default: {
        runAfterTransitions: ({callback}: {callback: () => void}) => {
            callback();
            return {cancel: jest.fn()};
        },
    },
}));

type NewActionSubscriber = (isFromCurrentUser: boolean, reportAction?: OnyxTypes.ReportAction) => void;
const newActionSubscribers: NewActionSubscriber[] = [];
const mockUnsubscribe = jest.fn();
const mockSubscribeToNewActionEvent = jest.fn((reportID: string, callback: NewActionSubscriber) => {
    newActionSubscribers.push(callback);
    return mockUnsubscribe;
});
jest.mock('@userActions/Report/reportActionSubscribers', () => ({
    __esModule: true,
    subscribeToNewActionEvent: (reportID: string, callback: NewActionSubscriber) => mockSubscribeToNewActionEvent(reportID, callback),
}));

const mockOpenReport = jest.fn();
jest.mock('@userActions/Report', () => ({
    __esModule: true,
    openReport: (...args: unknown[]) => {
        mockOpenReport(...args);
    },
}));

type ScrollParams = Parameters<typeof useMoneyRequestReportScroll>[0];
type ScrollResult = ReturnType<typeof useMoneyRequestReportScroll>;

const mockScrollOffsetRef = {current: 0};
const mockMarkNewestActionAsRead = jest.fn();
const mockCompleteSkippedMarkAsRead = jest.fn();
const mockOnScrolledOverThresholdChange = jest.fn();

function buildActionListContextValue() {
    return {scrollOffsetRef: mockScrollOffsetRef, getScrollOffset: () => mockScrollOffsetRef.current, registerListRef: () => {}, getListRef: () => null};
}

function Wrapper({children}: {children: ReactNode}) {
    return <ActionListContext.Provider value={buildActionListContextValue()}>{children}</ActionListContext.Provider>;
}

function makeAction(reportActionID: string): OnyxTypes.ReportAction {
    return getFakeReportAction(Number(reportActionID), {
        reportActionID,
        reportID: REPORT_ID,
        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
    });
}

function buildParams(overrides: Partial<ScrollParams> = {}): ScrollParams {
    return {
        reportID: REPORT_ID,
        shouldBeAlignedToTop: false,
        resetKey: REPORT_ID,
        visibleReportActions: [makeAction('1')],
        reportActionsLength: 1,
        lastAction: makeAction('1'),
        hasNewestReportAction: true,
        hasNewerActions: false,
        unreadMarkerReportActionIndex: -1,
        onScrolledOverThresholdChange: mockOnScrolledOverThresholdChange,
        markNewestActionAsRead: mockMarkNewestActionAsRead,
        completeSkippedMarkAsRead: mockCompleteSkippedMarkAsRead,
        ...overrides,
    };
}

function buildScrollEvent(contentOffsetY: number, contentHeight = LIST_CONTENT_HEIGHT, layoutHeight = LIST_LAYOUT_HEIGHT): NativeSyntheticEvent<NativeScrollEvent> {
    return createMock<NativeSyntheticEvent<NativeScrollEvent>>({
        nativeEvent: {
            layoutMeasurement: {height: layoutHeight, width: 0},
            contentSize: {width: 0, height: contentHeight},
            contentOffset: {x: 0, y: contentOffsetY},
        },
    });
}

function buildLayoutEvent(height: number): LayoutChangeEvent {
    return createMock<LayoutChangeEvent>({nativeEvent: {layout: {x: 0, y: 0, width: 0, height}}});
}

async function renderScroll(overrides: Partial<ScrollParams> = {}) {
    const utils = renderHook((props: ScrollParams) => useMoneyRequestReportScroll(props), {initialProps: buildParams(overrides), wrapper: Wrapper});
    await waitForBatchedUpdatesWithAct();
    utils.result.current.updateLastItemIndex(LAST_ITEM_INDEX);
    return utils;
}

function fireScroll(bottomOffset: number) {
    act(() => {
        mockOnTrackScrolling?.(buildScrollEvent(LIST_CONTENT_HEIGHT - LIST_LAYOUT_HEIGHT - bottomOffset));
    });
}

function applyLayoutAndScroll(result: {current: ScrollResult}, bottomOffset: number) {
    act(() => {
        result.current.onListLayout(buildLayoutEvent(LIST_LAYOUT_HEIGHT));
    });
    act(() => {
        result.current.onListContentSizeChange(0, LIST_CONTENT_HEIGHT);
    });
    fireScroll(bottomOffset);
}

function notifyNewAction(isFromCurrentUser: boolean, reportAction: OnyxTypes.ReportAction) {
    act(() => {
        for (const subscriber of newActionSubscribers) {
            subscriber(isFromCurrentUser, reportAction);
        }
    });
}

describe('useMoneyRequestReportScroll', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdates();
        jest.useFakeTimers({doNotFake: ['nextTick', 'setImmediate']});
        mockOnTrackScrolling = undefined;
        mockUnreadTrackingArgs = undefined;
        mockScrollToEndOnNewMessageArgs = undefined;
        mockCandidateAgentIDs = [];
        mockScrollOffsetRef.current = 0;
        newActionSubscribers.length = 0;
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('bottom offset tracking', () => {
        it('should report the list as scrolled over the threshold while it sits away from the bottom', async () => {
            // Given a money request report whose list is taller than the viewport
            const {result} = await renderScroll();

            // When the list lays out scrolled to the top
            applyLayoutAndScroll(result, BOTTOM_OFFSET_AT_TOP);

            // Then the caller is told the user is far enough from the newest message to want the "Latest messages" pill
            expect(mockOnScrolledOverThresholdChange).toHaveBeenLastCalledWith(true);
        });

        it('should report the list as under the threshold once it reaches the bottom', async () => {
            // Given a list laid out away from the bottom
            const {result} = await renderScroll();
            applyLayoutAndScroll(result, BOTTOM_OFFSET_AT_TOP);

            // When the list scrolls to within the action-visible threshold of its bottom
            fireScroll(THRESHOLD - 1);

            // Then the caller is told the newest message is in view, which is what arms mark-as-read
            expect(mockOnScrolledOverThresholdChange).toHaveBeenLastCalledWith(false);
        });

        it('should keep the shared scroll offset in sync with the distance from the bottom', async () => {
            // Given a rendered scroll hook
            const {result} = await renderScroll();

            // When the list lays out 400px from its bottom
            applyLayoutAndScroll(result, BOTTOM_OFFSET_AT_TOP);

            // Then the offset the app shares through the action-list context matches, because that is what decides
            // whether incoming messages auto-scroll the list
            expect(mockScrollOffsetRef.current).toBe(BOTTOM_OFFSET_AT_TOP);
        });

        it('should hand the unread-marker visibility callback to the pill tracking hook', async () => {
            // Given a report with a skipped mark-as-read pending
            await renderScroll();

            // Then the caller's completion callback is what runs when the unread action comes back into view, and the
            // list is described as non-inverted so the pill math measures from the bottom
            expect(mockUnreadTrackingArgs?.onUnreadActionVisible).toBe(mockCompleteSkippedMarkAsRead);
            expect(mockUnreadTrackingArgs?.isInverted).toBe(false);
            expect(mockUnreadTrackingArgs?.reportID).toBe(REPORT_ID);
        });

        it('should hand the last-item jump to the new-message autoscroll hook', async () => {
            // Given a rendered scroll hook whose list has published its last item index
            await renderScroll();

            // Then autoscroll is told to detect a merge by the growth of the pre-filter action count
            expect(mockScrollToEndOnNewMessageArgs?.sizeChangeType).toBe('grewFromReportActions');

            // When it asks to scroll to the end
            mockScrollToEndOnNewMessageArgs?.scrollToEnd();

            // Then it jumps to the last item rather than calling scrollToEnd, because scrollToIndex renders its own
            // landing region and the jump never lands on a blank bottom
            expect(mockScrollToIndex).toHaveBeenCalledWith(LAST_ITEM_INDEX, {animated: false, viewPosition: 1});
        });
    });

    describe('scrollToLatestMessages', () => {
        it('should mark the report as read only once the scroll reaches the bottom', async () => {
            // Given a list scrolled away from the bottom, with the newest action already loaded
            const {result} = await renderScroll();
            applyLayoutAndScroll(result, BOTTOM_OFFSET_AT_TOP);

            // When the user taps "Latest messages"
            act(() => {
                result.current.scrollToLatestMessages();
            });

            // Then the jump targets the last item and the pill hides, but nothing is marked read yet because the
            // jump still has to land
            expect(mockScrollToIndex).toHaveBeenCalledWith(LAST_ITEM_INDEX, {animated: false, viewPosition: 1});
            expect(mockSetIsFloatingMessageCounterVisible).toHaveBeenCalledWith(false);
            expect(mockMarkNewestActionAsRead).not.toHaveBeenCalled();
            expect(mockOpenReport).not.toHaveBeenCalled();

            // When the scroll reports the list at its bottom
            fireScroll(0);

            // Then the report is marked as read, and only once however many scroll events follow
            expect(mockMarkNewestActionAsRead).toHaveBeenCalledTimes(1);
            fireScroll(0);
            expect(mockMarkNewestActionAsRead).toHaveBeenCalledTimes(1);
        });

        it('should not mark the report as read while the jump is still away from the bottom', async () => {
            // Given a list scrolled away from the bottom
            const {result} = await renderScroll();
            applyLayoutAndScroll(result, BOTTOM_OFFSET_AT_TOP);

            // When the user taps "Latest messages" and the list is still settling above its bottom
            act(() => {
                result.current.scrollToLatestMessages();
            });
            fireScroll(THRESHOLD);

            // Then nothing is marked read, because deferred content can still land below the current viewport
            expect(mockMarkNewestActionAsRead).not.toHaveBeenCalled();
        });

        it('should cancel the pending mark-as-read when the user drags away first', async () => {
            // Given a list scrolled away from the bottom
            const {result} = await renderScroll();
            applyLayoutAndScroll(result, BOTTOM_OFFSET_AT_TOP);

            // When the user taps "Latest messages" and then drags before the jump lands
            act(() => {
                result.current.scrollToLatestMessages();
            });
            act(() => {
                result.current.onListScrollBeginDrag();
            });
            fireScroll(0);

            // Then the report is not marked read, because the user took over the scroll position
            expect(mockMarkNewestActionAsRead).not.toHaveBeenCalled();
        });

        it('should fetch the newest actions before jumping when they are not loaded', async () => {
            // Given a report whose newest action is beyond the loaded page
            const {result} = await renderScroll({hasNewestReportAction: false, hasNewerActions: true});
            applyLayoutAndScroll(result, BOTTOM_OFFSET_AT_TOP);

            // When the user taps "Latest messages"
            act(() => {
                result.current.scrollToLatestMessages();
            });

            // Then the report is opened so the newest actions load, and nothing is marked read yet
            expect(mockOpenReport).toHaveBeenCalledTimes(1);
            expect(mockMarkNewestActionAsRead).not.toHaveBeenCalled();
        });

        it('should pass the onboarding and session context the fetch needs', async () => {
            // Given a user who has not finished the guided setup flow
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
            await waitForBatchedUpdates();
            const {result} = await renderScroll({hasNewestReportAction: false, hasNewerActions: true});

            // When the user taps "Latest messages"
            act(() => {
                result.current.scrollToLatestMessages();
            });

            // Then the fetch carries the flags read live from Onyx rather than values captured at mount
            expect(mockOpenReport).toHaveBeenCalledWith(
                expect.objectContaining({
                    reportID: REPORT_ID,
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    hasReportActions: true,
                    hasCompletedGuidedSetupFlow: false,
                }),
            );
        });
    });

    describe('stick to bottom', () => {
        it('should keep re-pinning the list to the bottom while content settles after the jump', async () => {
            // Given a list scrolled away from the bottom
            const {result} = await renderScroll();
            applyLayoutAndScroll(result, BOTTOM_OFFSET_AT_TOP);

            // When the user taps "Latest messages"
            act(() => {
                result.current.scrollToLatestMessages();
            });
            mockScrollToIndex.mockClear();

            // When deferred content grows the list below the viewport
            act(() => {
                result.current.onListContentSizeChange(0, LIST_CONTENT_HEIGHT + 500);
            });

            // Then the list is pinned back to the last item, so the user ends up at the newest message
            expect(mockScrollToIndex).toHaveBeenCalledWith(LAST_ITEM_INDEX, {animated: false, viewPosition: 1});
        });

        it('should stop re-pinning the list once the stick-to-bottom window expires', async () => {
            // Given a list scrolled away from the bottom
            const {result} = await renderScroll();
            applyLayoutAndScroll(result, BOTTOM_OFFSET_AT_TOP);

            // When the user taps "Latest messages" and the stick-to-bottom window passes
            act(() => {
                result.current.scrollToLatestMessages();
            });
            act(() => {
                jest.advanceTimersByTime(2000);
            });
            mockScrollToIndex.mockClear();

            // When unrelated content changes the list height afterwards
            act(() => {
                result.current.onListContentSizeChange(0, LIST_CONTENT_HEIGHT + 500);
            });

            // Then the list is not yanked back down, because an unrelated layout change is no longer the user's jump
            expect(mockScrollToIndex).not.toHaveBeenCalled();
        });

        it('should stop re-pinning the list as soon as the user drags', async () => {
            // Given a fresh "Latest messages" jump
            const {result} = await renderScroll();
            applyLayoutAndScroll(result, BOTTOM_OFFSET_AT_TOP);
            act(() => {
                result.current.scrollToLatestMessages();
            });

            // When the user drags the list and the content height then changes inside the stick-to-bottom window
            act(() => {
                result.current.onListScrollBeginDrag();
            });
            mockScrollToIndex.mockClear();
            act(() => {
                result.current.onListContentSizeChange(0, LIST_CONTENT_HEIGHT + 500);
            });

            // Then the list stays where the user put it
            expect(mockScrollToIndex).not.toHaveBeenCalled();
        });

        it('should not re-pin the list on content changes without a jump', async () => {
            // Given a list nobody asked to jump to the bottom
            const {result} = await renderScroll();
            applyLayoutAndScroll(result, BOTTOM_OFFSET_AT_TOP);
            mockScrollToIndex.mockClear();

            // When the content height changes
            act(() => {
                result.current.onListContentSizeChange(0, LIST_CONTENT_HEIGHT + 500);
            });

            // Then the scroll position is only re-measured, never moved
            expect(mockScrollToIndex).not.toHaveBeenCalled();
        });
    });

    describe('own comment autoscroll', () => {
        it('should subscribe to new actions once per report', async () => {
            // Given a rendered money request report
            await renderScroll();

            // Then it listens for new actions on this report through the single-source-of-truth subscriber
            expect(mockSubscribeToNewActionEvent).toHaveBeenCalledWith(REPORT_ID, expect.any(Function));
        });

        it('should jump to the newest message when the current user sends a comment', async () => {
            // Given a list scrolled away from the bottom
            const {result} = await renderScroll();
            applyLayoutAndScroll(result, BOTTOM_OFFSET_AT_TOP);

            // When a comment from the current user arrives and is already rendered
            notifyNewAction(true, makeAction('1'));
            act(() => {
                jest.advanceTimersByTime(100);
            });

            // Then the list follows the user's own message, the delay giving the item time to land in the data
            expect(mockScrollToIndex).toHaveBeenCalledWith(LAST_ITEM_INDEX, {animated: false, viewPosition: 1});
        });

        it('should not move the list when someone else sends a comment', async () => {
            // Given a list scrolled away from the bottom
            const {result} = await renderScroll();
            applyLayoutAndScroll(result, BOTTOM_OFFSET_AT_TOP);

            // When a comment from another user arrives
            notifyNewAction(false, makeAction('1'));
            act(() => {
                jest.advanceTimersByTime(100);
            });

            // Then the reader's position is left alone, and only the pill is dismissed
            expect(mockScrollToIndex).not.toHaveBeenCalled();
            expect(mockSetIsFloatingMessageCounterVisible).toHaveBeenCalledWith(false);
        });

        it('should not move the list for an own action that is not a comment', async () => {
            // Given a list scrolled away from the bottom
            const {result} = await renderScroll();
            applyLayoutAndScroll(result, BOTTOM_OFFSET_AT_TOP);

            // When a non-comment action from the current user arrives
            notifyNewAction(true, {...makeAction('1'), actionName: CONST.REPORT.ACTIONS.TYPE.IOU} as OnyxTypes.ReportAction);
            act(() => {
                jest.advanceTimersByTime(100);
            });

            // Then the list does not jump, because expense rows scroll through their own flow
            expect(mockScrollToIndex).not.toHaveBeenCalled();
        });

        it('should jump when a comment the user sent lands after the event was handled', async () => {
            // Given a comment that arrives for an action the list does not render yet
            const {result, rerender} = await renderScroll({visibleReportActions: [makeAction('1')]});
            applyLayoutAndScroll(result, BOTTOM_OFFSET_AT_TOP);
            notifyNewAction(true, makeAction('2'));

            // Then nothing jumps yet, because the action is not in the rendered data
            act(() => {
                jest.advanceTimersByTime(100);
            });
            expect(mockScrollToIndex).not.toHaveBeenCalled();

            // When the action shows up in the rendered list
            rerender(buildParams({visibleReportActions: [makeAction('1'), makeAction('2')], reportActionsLength: 2, lastAction: makeAction('2')}));
            await waitForBatchedUpdatesWithAct();
            act(() => {
                jest.advanceTimersByTime(100);
            });

            // Then the deferred jump fires for the action the first pass could not find
            expect(mockScrollToIndex).toHaveBeenCalledWith(LAST_ITEM_INDEX, {animated: false, viewPosition: 1});
        });
    });

    describe('AgentZero thinking indicator', () => {
        it('should scroll to the end once when the thinking indicator appears near the bottom', async () => {
            // Given a list sitting within the threshold of its bottom
            const {rerender} = await renderScroll();

            // When AgentZero starts thinking
            mockCandidateAgentIDs = [10];
            rerender(buildParams());
            await waitForBatchedUpdatesWithAct();
            act(() => {
                jest.advanceTimersByTime(100);
            });

            // Then the list reveals the indicator, which lives in the footer below the row a last-item jump targets
            expect(mockScrollToEnd).toHaveBeenCalledTimes(1);
        });

        it('should not scroll for the thinking indicator while the list is away from the bottom', async () => {
            // Given a list scrolled away from the bottom
            const {result, rerender} = await renderScroll();
            applyLayoutAndScroll(result, BOTTOM_OFFSET_AT_TOP);

            // When AgentZero starts thinking
            mockCandidateAgentIDs = [10];
            rerender(buildParams());
            await waitForBatchedUpdatesWithAct();
            act(() => {
                jest.advanceTimersByTime(100);
            });

            // Then the reading position is untouched
            expect(mockScrollToEnd).not.toHaveBeenCalled();
            expect(result.current.isFloatingMessageCounterVisible).toBe(false);
        });

        it('should scroll once per thinking-indicator run even as its label changes', async () => {
            // Given a list at the bottom where AgentZero starts thinking
            const {rerender} = await renderScroll();
            mockCandidateAgentIDs = [10];
            rerender(buildParams());
            await waitForBatchedUpdatesWithAct();
            act(() => {
                jest.advanceTimersByTime(100);
            });
            expect(mockScrollToEnd).toHaveBeenCalledTimes(1);

            // When the thinking label changes, which re-renders the list many times per run
            rerender(buildParams());
            rerender(buildParams());
            await waitForBatchedUpdatesWithAct();
            act(() => {
                jest.advanceTimersByTime(100);
            });

            // Then the viewport is not yanked down again
            expect(mockScrollToEnd).toHaveBeenCalledTimes(1);
        });

        it('should scroll again for a new thinking-indicator run', async () => {
            // Given one thinking-indicator run already revealed
            const {rerender} = await renderScroll();
            mockCandidateAgentIDs = [10];
            rerender(buildParams());
            await waitForBatchedUpdatesWithAct();
            act(() => {
                jest.advanceTimersByTime(100);
            });
            expect(mockScrollToEnd).toHaveBeenCalledTimes(1);

            // When that run ends and another one starts
            mockCandidateAgentIDs = [];
            rerender(buildParams());
            await waitForBatchedUpdatesWithAct();
            mockCandidateAgentIDs = [10];
            rerender(buildParams());
            await waitForBatchedUpdatesWithAct();
            act(() => {
                jest.advanceTimersByTime(100);
            });

            // Then the new run's indicator is revealed too
            expect(mockScrollToEnd).toHaveBeenCalledTimes(2);
        });
    });

    describe('teardown', () => {
        it('should drop the report subscription and pending jumps on unmount', async () => {
            // Given a jump still pending for a comment the user sent
            const {result, unmount} = await renderScroll();
            applyLayoutAndScroll(result, BOTTOM_OFFSET_AT_TOP);
            notifyNewAction(true, makeAction('1'));

            // When the report view unmounts before the jump fires
            unmount();
            mockScrollToIndex.mockClear();
            act(() => {
                jest.advanceTimersByTime(100);
            });

            // Then nothing scrolls against a list that no longer exists, and the subscription is released
            expect(mockScrollToIndex).not.toHaveBeenCalled();
            expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
        });
    });
});
