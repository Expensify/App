import {act, renderHook} from '@testing-library/react-native';

import type Navigation from '@libs/Navigation/Navigation';

import useReportUnreadMessageScrollTracking from '@pages/inbox/report/useReportUnreadMessageScrollTracking';

import CONST from '@src/CONST';

import type {SharedValue} from 'react-native-reanimated';

type MockSharedValue<T> = SharedValue<T> & {
    get(): T;
    set(v: T): void;
};

function createMockSharedValue<T>(initial: T): MockSharedValue<T> {
    let internalValue = initial;

    return {
        get value() {
            return internalValue;
        },
        set value(v: T) {
            internalValue = v;
        },
        addListener: jest.fn(),
        removeListener: jest.fn(),
        modify: jest.fn(),
        get: () => internalValue,
        set: (v: T) => {
            internalValue = v;
        },
    };
}

jest.mock('react-native-reanimated', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...require('react-native-reanimated/mock'),
        useAnimatedReaction: (prepare: () => unknown, react: (a: unknown, b: unknown) => void) => {
            const prepared = prepare();
            react(prepared, prepared);
        },
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
const onUnreadActionVisibleMockFn = jest.fn();

describe('useReportUnreadMessageScrollTracking', () => {
    describe('on init and without any scrolling', () => {
        const onTrackScrollingMockFn = jest.fn();

        it('returns initial floatingMessage visibility and sets no state', () => {
            // Given
            const offsetY = createMockSharedValue(0);
            const keyboardHeight = createMockSharedValue(0);
            const {result} = renderHook(() =>
                useReportUnreadMessageScrollTracking({
                    reportID,
                    keyboardHeight,
                    currentVerticalScrollingOffset: offsetY,
                    onUnreadActionVisible: onUnreadActionVisibleMockFn,
                    hasNewerActions: false,
                    unreadMarkerReportActionIndex: -1,
                    isInverted: true,
                }),
            );

            // Then
            expect(result.current.isFloatingMessageCounterVisible).toBe(false);
            expect(onTrackScrollingMockFn).not.toHaveBeenCalled();
        });

        it('returns floatingMessage visibility that was set to a new value', () => {
            // Given
            const offsetY = createMockSharedValue(0);
            const keyboardHeight = createMockSharedValue(0);
            const {result, rerender} = renderHook(() =>
                useReportUnreadMessageScrollTracking({
                    reportID,
                    keyboardHeight,
                    currentVerticalScrollingOffset: offsetY,
                    onUnreadActionVisible: onUnreadActionVisibleMockFn,
                    hasNewerActions: false,
                    unreadMarkerReportActionIndex: -1,
                    isInverted: true,
                }),
            );

            // When
            act(() => {
                result.current.setIsFloatingMessageCounterVisible(true);
            });

            rerender({});

            // Then
            expect(result.current.isFloatingMessageCounterVisible).toBe(true);
        });
    });

    describe('when scrolling', () => {
        it('returns floatingMessage visibility as true when scrolling outside of threshold', () => {
            // Given
            const offsetY = createMockSharedValue(0);
            const keyboardHeight = createMockSharedValue(0);
            const {result, rerender} = renderHook(() =>
                useReportUnreadMessageScrollTracking({
                    reportID,
                    keyboardHeight,
                    currentVerticalScrollingOffset: offsetY,
                    onUnreadActionVisible: onUnreadActionVisibleMockFn,
                    hasNewerActions: false,
                    unreadMarkerReportActionIndex: -1,
                    isInverted: true,
                }),
            );

            // When
            act(() => {
                offsetY.set(CONST.REPORT.ACTIONS.LATEST_MESSAGES_PILL_SCROLL_OFFSET_THRESHOLD + 100);
            });

            rerender({});

            // Then
            expect(result.current.isFloatingMessageCounterVisible).toBe(true);
        });

        it('returns floatingMessage visibility as true when the unread message is not visible in the view port', () => {
            // Given
            const offsetY = createMockSharedValue(0);
            const keyboardHeight = createMockSharedValue(0);
            const {result} = renderHook(() =>
                useReportUnreadMessageScrollTracking({
                    reportID,
                    keyboardHeight,
                    currentVerticalScrollingOffset: offsetY,
                    onUnreadActionVisible: onUnreadActionVisibleMockFn,
                    hasNewerActions: false,
                    unreadMarkerReportActionIndex: 1,
                    isInverted: true,
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
        });

        it('returns floatingMessage visibility as false when scrolling inside the threshold', () => {
            // Given
            const offsetY = createMockSharedValue(0);
            const keyboardHeight = createMockSharedValue(0);
            const {result} = renderHook(() =>
                useReportUnreadMessageScrollTracking({
                    reportID,
                    keyboardHeight,
                    currentVerticalScrollingOffset: offsetY,
                    onUnreadActionVisible: onUnreadActionVisibleMockFn,
                    hasNewerActions: false,
                    unreadMarkerReportActionIndex: -1,
                    isInverted: true,
                }),
            );

            // When
            act(() => {
                offsetY.set(CONST.REPORT.ACTIONS.LATEST_MESSAGES_PILL_SCROLL_OFFSET_THRESHOLD - 100);
            });

            // Then
            expect(result.current.isFloatingMessageCounterVisible).toBe(false);
        });

        it('returns floatingMessage visibility as false when unread message is visible', () => {
            // Given
            const offsetY = createMockSharedValue(0);
            const keyboardHeight = createMockSharedValue(0);
            const {result} = renderHook(() =>
                useReportUnreadMessageScrollTracking({
                    reportID,
                    keyboardHeight,
                    currentVerticalScrollingOffset: offsetY,
                    onUnreadActionVisible: onUnreadActionVisibleMockFn,
                    hasNewerActions: false,
                    unreadMarkerReportActionIndex: 1,
                    isInverted: true,
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
        });

        it('calls onUnreadActionVisible when scrolling to an extent the unread message is visible', () => {
            // Given
            const offsetY = createMockSharedValue(0);
            const keyboardHeight = createMockSharedValue(0);
            const onUnreadActionVisibleLocalMockFn = jest.fn();
            const {result, rerender} = renderHook(() =>
                useReportUnreadMessageScrollTracking({
                    reportID,
                    keyboardHeight,
                    currentVerticalScrollingOffset: offsetY,
                    onUnreadActionVisible: onUnreadActionVisibleLocalMockFn,
                    hasNewerActions: false,
                    unreadMarkerReportActionIndex: 1,
                    isInverted: true,
                }),
            );

            // When
            act(() => {
                // if unread action is not visible, the floating button will be visible
                result.current.onViewableItemsChanged({viewableItems: [{index: 2, key: 'reportActions_2', isViewable: true, item: {}}], changed: []});
            });

            rerender({});

            expect(result.current.isFloatingMessageCounterVisible).toBe(true);
            expect(onUnreadActionVisibleLocalMockFn).toHaveBeenCalledTimes(0);

            act(() => {
                // scrolling so that the unread action is visible, should notify the consumer
                result.current.onViewableItemsChanged({viewableItems: [{index: 1, key: 'reportActions_1', isViewable: true, item: {}}], changed: []});
            });

            rerender({});

            // Then
            expect(onUnreadActionVisibleLocalMockFn).toHaveBeenCalledTimes(1);
            expect(result.current.isFloatingMessageCounterVisible).toBe(false);
        });
    });

    describe('action badge above viewport tracking', () => {
        const onTrackScrollingMockFn = jest.fn();

        it('returns isActionBadgeAboveViewport as false initially', () => {
            const offsetY = createMockSharedValue(0);
            const keyboardHeight = createMockSharedValue(0);
            const {result} = renderHook(() =>
                useReportUnreadMessageScrollTracking({
                    reportID,
                    keyboardHeight,
                    currentVerticalScrollingOffset: offsetY,
                    actionBadgeTargetIndex: -1,
                    onUnreadActionVisible: onUnreadActionVisibleMockFn,
                    hasNewerActions: false,
                    unreadMarkerReportActionIndex: -1,
                    isInverted: true,
                }),
            );

            expect(result.current.isActionBadgeAboveViewport).toBe(false);
        });

        it('returns isActionBadgeAboveViewport as true when action badge target is above the viewport in inverted list', () => {
            const offsetY = createMockSharedValue(0);
            const keyboardHeight = createMockSharedValue(0);
            const {result} = renderHook(() =>
                useReportUnreadMessageScrollTracking({
                    reportID,
                    keyboardHeight,
                    currentVerticalScrollingOffset: offsetY,
                    actionBadgeTargetIndex: 5,
                    onUnreadActionVisible: onUnreadActionVisibleMockFn,
                    hasNewerActions: false,
                    unreadMarkerReportActionIndex: -1,
                    isInverted: true,
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
            const offsetY = createMockSharedValue(0);
            const keyboardHeight = createMockSharedValue(0);
            const {result} = renderHook(() =>
                useReportUnreadMessageScrollTracking({
                    reportID,
                    keyboardHeight,
                    currentVerticalScrollingOffset: offsetY,
                    onUnreadActionVisible: onUnreadActionVisibleMockFn,
                    hasNewerActions: false,
                    unreadMarkerReportActionIndex: -1,
                    actionBadgeTargetIndex: 2,
                    isInverted: true,
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
            const offsetY = createMockSharedValue(0);
            const keyboardHeight = createMockSharedValue(0);
            const {result} = renderHook(() =>
                useReportUnreadMessageScrollTracking({
                    reportID,
                    keyboardHeight,
                    currentVerticalScrollingOffset: offsetY,
                    onUnreadActionVisible: onUnreadActionVisibleMockFn,
                    hasNewerActions: false,
                    unreadMarkerReportActionIndex: -1,
                    actionBadgeTargetIndex: -1,
                    isInverted: true,
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
            const offsetY = createMockSharedValue(0);
            const keyboardHeight = createMockSharedValue(0);
            const {result} = renderHook(() =>
                useReportUnreadMessageScrollTracking({
                    reportID,
                    keyboardHeight,
                    currentVerticalScrollingOffset: offsetY,
                    onUnreadActionVisible: onUnreadActionVisibleMockFn,
                    hasNewerActions: false,
                    unreadMarkerReportActionIndex: -1,
                    actionBadgeTargetIndex: 5,
                    isInverted: true,
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

        it('recalculates action badge visibility when actionBadgeTargetIndex changes', () => {
            const offsetY = createMockSharedValue(0);
            const keyboardHeight = createMockSharedValue(0);
            let actionBadgeTargetIndex = -1;
            const {result, rerender} = renderHook(() =>
                useReportUnreadMessageScrollTracking({
                    reportID,
                    keyboardHeight,
                    currentVerticalScrollingOffset: offsetY,
                    onUnreadActionVisible: onUnreadActionVisibleMockFn,
                    hasNewerActions: false,
                    unreadMarkerReportActionIndex: -1,
                    actionBadgeTargetIndex,
                    isInverted: true,
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
