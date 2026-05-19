import {act, renderHook} from '@testing-library/react-native';
import type {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import type Navigation from '@libs/Navigation/Navigation';
import useReportUnreadMessageScrollTracking from '@pages/inbox/report/useReportUnreadMessageScrollTracking';
import {readNewestAction} from '@userActions/Report';
import CONST from '@src/CONST';

jest.mock('@userActions/Report', () => {
    return {
        readNewestAction: jest.fn(),
    };
});

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof Navigation>('@react-navigation/native');
    return {
        ...actualNav,
        useIsFocused: jest.fn().mockImplementation(() => true),
    };
});

const reportID = '12345';
const readActionRefFalse = {current: false};
const emptyScrollEventMock = {
    nativeEvent: {layoutMeasurement: {height: 0, width: 0}, contentSize: {width: 100, height: 100}, contentOffset: {x: 0, y: 0}},
} as NativeSyntheticEvent<NativeScrollEvent>;

describe('useReportUnreadMessageScrollTracking', () => {
    describe('on init and without any scrolling', () => {
        const onTrackScrollingMockFn = jest.fn();

        it('returns initial floatingMessage visibility and sets no state', () => {
            // Given
            const offsetRef = {current: 0};
            const {result} = renderHook(() =>
                useReportUnreadMessageScrollTracking({
                    reportID,
                    currentVerticalScrollingOffsetRef: offsetRef,
                    readActionSkippedRef: readActionRefFalse,
                    onTrackScrolling: onTrackScrollingMockFn,
                    hasNewerActions: false,
                    unreadMarkerReportActionIndex: -1,
                    hasOnceLoadedReportActions: true,
                    isInverted: true,
                }),
            );

            // Then
            expect(result.current.isFloatingMessageCounterVisible).toBe(false);
            expect(onTrackScrollingMockFn).not.toHaveBeenCalled();
        });

        it('returns floatingMessage visibility that was set to a new value', () => {
            // Given
            const offsetRef = {current: 0};
            const {result, rerender} = renderHook(() =>
                useReportUnreadMessageScrollTracking({
                    reportID,
                    currentVerticalScrollingOffsetRef: offsetRef,
                    readActionSkippedRef: readActionRefFalse,
                    unreadMarkerReportActionIndex: -1,
                    isInverted: true,
                    hasNewerActions: false,
                    onTrackScrolling: onTrackScrollingMockFn,
                    hasOnceLoadedReportActions: true,
                }),
            );

            // When
            act(() => {
                result.current.setIsFloatingMessageCounterVisible(true);
            });
            rerender({});

            // Then
            expect(result.current.isFloatingMessageCounterVisible).toBe(true);
            expect(onTrackScrollingMockFn).not.toHaveBeenCalled();
        });
    });

    describe('when scrolling', () => {
        const onTrackScrollingMockFn = jest.fn();

        it('returns floatingMessage visibility as true when scrolling outside of threshold', () => {
            // Given
            const offsetRef = {current: 0};
            const {result, rerender} = renderHook(() =>
                useReportUnreadMessageScrollTracking({
                    reportID,
                    currentVerticalScrollingOffsetRef: offsetRef,
                    readActionSkippedRef: readActionRefFalse,
                    isInverted: true,
                    unreadMarkerReportActionIndex: -1,
                    onTrackScrolling: onTrackScrollingMockFn,
                    hasOnceLoadedReportActions: true,
                    hasNewerActions: false,
                }),
            );

            // When
            act(() => {
                offsetRef.current = CONST.REPORT.ACTIONS.LATEST_MESSAGES_PILL_SCROLL_OFFSET_THRESHOLD + 100;
                result.current.trackVerticalScrolling(emptyScrollEventMock);
            });
            rerender({});

            // Then
            expect(result.current.isFloatingMessageCounterVisible).toBe(true);
            expect(onTrackScrollingMockFn).toHaveBeenCalledWith(emptyScrollEventMock);
        });

        it('returns floatingMessage visibility as true when the unread message is not visible in the view port', () => {
            // Given
            const offsetRef = {current: 0};
            const {result} = renderHook(() =>
                useReportUnreadMessageScrollTracking({
                    reportID,
                    currentVerticalScrollingOffsetRef: offsetRef,
                    readActionSkippedRef: readActionRefFalse,
                    isInverted: true,
                    unreadMarkerReportActionIndex: 1,
                    onTrackScrolling: onTrackScrollingMockFn,
                    hasOnceLoadedReportActions: true,
                    hasNewerActions: false,
                }),
            );

            // When
            act(() => {
                result.current.onViewableItemsChanged({viewableItems: [{index: 1, key: 'reportActions_1', isViewable: true, item: {}}], changed: []});
            });

            expect(result.current.isFloatingMessageCounterVisible).toBe(false);

            // When
            act(() => {
                result.current.onViewableItemsChanged({viewableItems: [{index: 2, key: 'reportActions_2', isViewable: true, item: {}}], changed: []});
            });

            // Then
            expect(result.current.isFloatingMessageCounterVisible).toBe(true);
            expect(onTrackScrollingMockFn).toHaveBeenCalledWith(emptyScrollEventMock);
        });

        it('returns floatingMessage visibility as false when scrolling inside the threshold', () => {
            // Given
            const offsetRef = {current: 0};
            const {result} = renderHook(() =>
                useReportUnreadMessageScrollTracking({
                    reportID,
                    currentVerticalScrollingOffsetRef: offsetRef,
                    readActionSkippedRef: readActionRefFalse,
                    unreadMarkerReportActionIndex: -1,
                    isInverted: true,
                    hasNewerActions: false,
                    onTrackScrolling: onTrackScrollingMockFn,
                    hasOnceLoadedReportActions: true,
                }),
            );

            // When
            act(() => {
                offsetRef.current = CONST.REPORT.ACTIONS.LATEST_MESSAGES_PILL_SCROLL_OFFSET_THRESHOLD - 100;
                result.current.trackVerticalScrolling(emptyScrollEventMock);
            });

            // Then
            expect(result.current.isFloatingMessageCounterVisible).toBe(false);
            expect(onTrackScrollingMockFn).toHaveBeenCalledWith(emptyScrollEventMock);
        });

        it('returns floatingMessage visibility as false when unread message is visible', () => {
            // Given
            const offsetRef = {current: 0};
            const {result} = renderHook(() =>
                useReportUnreadMessageScrollTracking({
                    reportID,
                    currentVerticalScrollingOffsetRef: offsetRef,
                    readActionSkippedRef: readActionRefFalse,
                    unreadMarkerReportActionIndex: 1,
                    isInverted: true,
                    onTrackScrolling: onTrackScrollingMockFn,
                    hasOnceLoadedReportActions: true,
                    hasNewerActions: false,
                }),
            );

            // When
            act(() => {
                result.current.onViewableItemsChanged({viewableItems: [{index: 2, key: 'reportActions_2', isViewable: true, item: {}}], changed: []});
            });
            expect(result.current.isFloatingMessageCounterVisible).toBe(true);

            act(() => {
                result.current.onViewableItemsChanged({viewableItems: [{index: 1, key: 'reportActions_1', isViewable: true, item: {}}], changed: []});
            });

            // Then
            expect(result.current.isFloatingMessageCounterVisible).toBe(false);
            expect(onTrackScrollingMockFn).toHaveBeenCalledWith(emptyScrollEventMock);
        });

        it('calls readAction when scrolling to an extent the unread message is visible and read action skipped is true', () => {
            // Given
            const offsetRef = {current: 0};
            const {result} = renderHook(() =>
                useReportUnreadMessageScrollTracking({
                    reportID,
                    currentVerticalScrollingOffsetRef: offsetRef,
                    readActionSkippedRef: {current: true},
                    unreadMarkerReportActionIndex: 1,
                    isInverted: true,
                    onTrackScrolling: onTrackScrollingMockFn,
                    hasOnceLoadedReportActions: true,
                    hasNewerActions: false,
                }),
            );

            // When
            act(() => {
                // if unread action is not visible, the floating button will be visible
                result.current.onViewableItemsChanged({viewableItems: [{index: 2, key: 'reportActions_2', isViewable: true, item: {}}], changed: []});
            });

            expect(result.current.isFloatingMessageCounterVisible).toBe(true);
            expect(readNewestAction).toHaveBeenCalledTimes(0);

            act(() => {
                // scrolling so that the unread action is visible, should call readNewestAction
                result.current.onViewableItemsChanged({viewableItems: [{index: 1, key: 'reportActions_1', isViewable: true, item: {}}], changed: []});
            });

            // Then
            expect(readNewestAction).toHaveBeenCalledTimes(1);
            expect(readActionRefFalse.current).toBe(false);
            expect(result.current.isFloatingMessageCounterVisible).toBe(false);
        });
    });

    describe('action badge above viewport tracking', () => {
        const onTrackScrollingMockFn = jest.fn();

        it('returns isActionBadgeAboveViewport as false initially', () => {
            const offsetRef = {current: 0};
            const {result} = renderHook(() =>
                useReportUnreadMessageScrollTracking({
                    reportID,
                    currentVerticalScrollingOffsetRef: offsetRef,
                    readActionSkippedRef: readActionRefFalse,
                    onTrackScrolling: onTrackScrollingMockFn,
                    hasNewerActions: false,
                    unreadMarkerReportActionIndex: -1,
                    hasOnceLoadedReportActions: true,
                    isInverted: true,
                    actionBadgeTargetIndex: -1,
                }),
            );

            expect(result.current.isActionBadgeAboveViewport).toBe(false);
        });

        it('returns isActionBadgeAboveViewport as true when action badge target is above the viewport in inverted list', () => {
            const offsetRef = {current: 0};
            const {result} = renderHook(() =>
                useReportUnreadMessageScrollTracking({
                    reportID,
                    currentVerticalScrollingOffsetRef: offsetRef,
                    readActionSkippedRef: readActionRefFalse,
                    onTrackScrolling: onTrackScrollingMockFn,
                    hasNewerActions: false,
                    unreadMarkerReportActionIndex: -1,
                    hasOnceLoadedReportActions: true,
                    isInverted: true,
                    actionBadgeTargetIndex: 5,
                }),
            );

            // When viewable items are at indexes 0-3, the target at index 5 is above the viewport (higher index = above in inverted list)
            act(() => {
                result.current.onViewableItemsChanged({
                    viewableItems: [
                        {index: 0, key: 'reportActions_0', isViewable: true, item: {}},
                        {index: 1, key: 'reportActions_1', isViewable: true, item: {}},
                        {index: 2, key: 'reportActions_2', isViewable: true, item: {}},
                        {index: 3, key: 'reportActions_3', isViewable: true, item: {}},
                    ],
                    changed: [],
                });
            });

            expect(result.current.isActionBadgeAboveViewport).toBe(true);
        });

        it('returns isActionBadgeAboveViewport as false when action badge target is visible in viewport', () => {
            const offsetRef = {current: 0};
            const {result} = renderHook(() =>
                useReportUnreadMessageScrollTracking({
                    reportID,
                    currentVerticalScrollingOffsetRef: offsetRef,
                    readActionSkippedRef: readActionRefFalse,
                    onTrackScrolling: onTrackScrollingMockFn,
                    hasNewerActions: false,
                    unreadMarkerReportActionIndex: -1,
                    hasOnceLoadedReportActions: true,
                    isInverted: true,
                    actionBadgeTargetIndex: 2,
                }),
            );

            // When viewable items include index 2, the target is visible
            act(() => {
                result.current.onViewableItemsChanged({
                    viewableItems: [
                        {index: 1, key: 'reportActions_1', isViewable: true, item: {}},
                        {index: 2, key: 'reportActions_2', isViewable: true, item: {}},
                        {index: 3, key: 'reportActions_3', isViewable: true, item: {}},
                    ],
                    changed: [],
                });
            });

            expect(result.current.isActionBadgeAboveViewport).toBe(false);
        });

        it('returns isActionBadgeAboveViewport as false when there is no action badge target', () => {
            const offsetRef = {current: 0};
            const {result} = renderHook(() =>
                useReportUnreadMessageScrollTracking({
                    reportID,
                    currentVerticalScrollingOffsetRef: offsetRef,
                    readActionSkippedRef: readActionRefFalse,
                    onTrackScrolling: onTrackScrollingMockFn,
                    hasNewerActions: false,
                    unreadMarkerReportActionIndex: -1,
                    hasOnceLoadedReportActions: true,
                    isInverted: true,
                    actionBadgeTargetIndex: -1,
                }),
            );

            act(() => {
                result.current.onViewableItemsChanged({
                    viewableItems: [{index: 0, key: 'reportActions_0', isViewable: true, item: {}}],
                    changed: [],
                });
            });

            expect(result.current.isActionBadgeAboveViewport).toBe(false);
        });

        it('preserves isActionBadgeAboveViewport when viewable items are briefly empty (FlashList scroll animation)', () => {
            const offsetRef = {current: 0};
            const {result} = renderHook(() =>
                useReportUnreadMessageScrollTracking({
                    reportID,
                    currentVerticalScrollingOffsetRef: offsetRef,
                    readActionSkippedRef: readActionRefFalse,
                    onTrackScrolling: onTrackScrollingMockFn,
                    hasNewerActions: false,
                    unreadMarkerReportActionIndex: -1,
                    hasOnceLoadedReportActions: true,
                    isInverted: true,
                    actionBadgeTargetIndex: 5,
                }),
            );

            // First, make the badge visible above viewport
            act(() => {
                result.current.onViewableItemsChanged({
                    viewableItems: [{index: 0, key: 'reportActions_0', isViewable: true, item: {}}],
                    changed: [],
                });
            });
            expect(result.current.isActionBadgeAboveViewport).toBe(true);

            // When viewable items are briefly empty (FlashList internal behavior during scroll), state should be preserved
            act(() => {
                result.current.onViewableItemsChanged({viewableItems: [], changed: []});
            });
            expect(result.current.isActionBadgeAboveViewport).toBe(true);
        });

        it('suppresses action badge flicker during scroll-to-target animation', () => {
            const offsetRef = {current: 0};
            const {result} = renderHook(() =>
                useReportUnreadMessageScrollTracking({
                    reportID,
                    currentVerticalScrollingOffsetRef: offsetRef,
                    readActionSkippedRef: readActionRefFalse,
                    onTrackScrolling: onTrackScrollingMockFn,
                    hasNewerActions: false,
                    unreadMarkerReportActionIndex: -1,
                    hasOnceLoadedReportActions: true,
                    isInverted: true,
                    actionBadgeTargetIndex: 92,
                }),
            );

            // Initially the target is above viewport
            act(() => {
                result.current.onViewableItemsChanged({
                    viewableItems: [
                        {index: 85, key: 'reportActions_85', isViewable: true, item: {}},
                        {index: 86, key: 'reportActions_86', isViewable: true, item: {}},
                        {index: 87, key: 'reportActions_87', isViewable: true, item: {}},
                        {index: 88, key: 'reportActions_88', isViewable: true, item: {}},
                    ],
                    changed: [],
                });
            });
            expect(result.current.isActionBadgeAboveViewport).toBe(true);

            // User clicks the pill — suppress flicker
            act(() => {
                result.current.suppressActionBadgeWhileScrolling();
            });
            expect(result.current.isActionBadgeAboveViewport).toBe(false);

            // During scroll animation, maxIndex fluctuates but badge should stay hidden
            act(() => {
                result.current.onViewableItemsChanged({
                    viewableItems: [
                        {index: 88, key: 'reportActions_88', isViewable: true, item: {}},
                        {index: 89, key: 'reportActions_89', isViewable: true, item: {}},
                    ],
                    changed: [],
                });
            });
            // Target (92) is still above maxIndex (89), but suppression keeps it false
            expect(result.current.isActionBadgeAboveViewport).toBe(false);

            // Target becomes visible — suppression clears
            act(() => {
                result.current.onViewableItemsChanged({
                    viewableItems: [
                        {index: 90, key: 'reportActions_90', isViewable: true, item: {}},
                        {index: 91, key: 'reportActions_91', isViewable: true, item: {}},
                        {index: 92, key: 'reportActions_92', isViewable: true, item: {}},
                        {index: 93, key: 'reportActions_93', isViewable: true, item: {}},
                    ],
                    changed: [],
                });
            });
            expect(result.current.isActionBadgeAboveViewport).toBe(false);

            // After scrolling past, normal tracking resumes — target is now below viewport, not above
            act(() => {
                result.current.onViewableItemsChanged({
                    viewableItems: [
                        {index: 93, key: 'reportActions_93', isViewable: true, item: {}},
                        {index: 94, key: 'reportActions_94', isViewable: true, item: {}},
                        {index: 95, key: 'reportActions_95', isViewable: true, item: {}},
                    ],
                    changed: [],
                });
            });
            // In inverted list, target at 92 < minIndex 93 means it's below viewport now, not above
            expect(result.current.isActionBadgeAboveViewport).toBe(false);
        });

        it('recalculates action badge visibility when actionBadgeTargetIndex changes', () => {
            const offsetRef = {current: 0};
            let actionBadgeTargetIndex = -1;
            const {result, rerender} = renderHook(() =>
                useReportUnreadMessageScrollTracking({
                    reportID,
                    currentVerticalScrollingOffsetRef: offsetRef,
                    readActionSkippedRef: readActionRefFalse,
                    onTrackScrolling: onTrackScrollingMockFn,
                    hasNewerActions: false,
                    unreadMarkerReportActionIndex: -1,
                    hasOnceLoadedReportActions: true,
                    isInverted: true,
                    actionBadgeTargetIndex,
                }),
            );

            // Set up viewable items first
            act(() => {
                result.current.onViewableItemsChanged({
                    viewableItems: [
                        {index: 0, key: 'reportActions_0', isViewable: true, item: {}},
                        {index: 1, key: 'reportActions_1', isViewable: true, item: {}},
                    ],
                    changed: [],
                });
            });
            expect(result.current.isActionBadgeAboveViewport).toBe(false);

            // Now set the target to an index above the viewport
            actionBadgeTargetIndex = 5;
            rerender({});

            expect(result.current.isActionBadgeAboveViewport).toBe(true);
        });
    });
});
