import {act, renderHook} from '@testing-library/react-native';
import type {SharedValue} from 'react-native-reanimated';
import type Navigation from '@libs/Navigation/Navigation';
import useReportUnreadMessageScrollTracking from '@pages/inbox/report/useReportUnreadMessageScrollTracking';
import {readNewestAction} from '@userActions/Report';
import CONST from '@src/CONST';

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

jest.mock('@userActions/Report', () => {
    return {
        readNewestAction: jest.fn(),
    };
});

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
const readActionRefFalse = {current: false};

describe('useReportUnreadMessageScrollTracking', () => {
    describe('on init and without any scrolling', () => {
        it('returns floatingMessage visibility that was set to a new value', () => {
            // Given
            const offsetY = createMockSharedValue(0);
            const keyboardHeight = createMockSharedValue(0);
            const {result, rerender} = renderHook(() =>
                useReportUnreadMessageScrollTracking({
                    reportID,
                    readActionSkippedRef: readActionRefFalse,
                    unreadMarkerReportActionIndex: -1,
                    isInverted: true,
                    currentVerticalScrollingOffset: offsetY,
                    keyboardHeight,
                    hasUnreadMarkerReportAction: false,
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
                    readActionSkippedRef: readActionRefFalse,
                    isInverted: true,
                    unreadMarkerReportActionIndex: -1,
                    currentVerticalScrollingOffset: offsetY,
                    keyboardHeight,
                    hasUnreadMarkerReportAction: false,
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
                    currentVerticalScrollingOffset: offsetY,
                    readActionSkippedRef: readActionRefFalse,
                    isInverted: true,
                    unreadMarkerReportActionIndex: 1,
                    hasUnreadMarkerReportAction: false,
                    keyboardHeight,
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
                    readActionSkippedRef: readActionRefFalse,
                    unreadMarkerReportActionIndex: -1,
                    isInverted: true,
                    currentVerticalScrollingOffset: offsetY,
                    hasUnreadMarkerReportAction: false,
                    keyboardHeight,
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
                    currentVerticalScrollingOffset: offsetY,
                    readActionSkippedRef: readActionRefFalse,
                    unreadMarkerReportActionIndex: 1,
                    isInverted: true,
                    hasUnreadMarkerReportAction: false,
                    keyboardHeight,
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

        it('calls readAction when scrolling to an extent the unread message is visible and read action skipped is true', () => {
            // Given
            const offsetY = createMockSharedValue(0);
            const keyboardHeight = createMockSharedValue(0);
            const {result, rerender} = renderHook(() =>
                useReportUnreadMessageScrollTracking({
                    reportID,
                    currentVerticalScrollingOffset: offsetY,
                    readActionSkippedRef: {current: true},
                    unreadMarkerReportActionIndex: 1,
                    isInverted: true,
                    hasUnreadMarkerReportAction: false,
                    keyboardHeight,
                }),
            );

            // When
            act(() => {
                // if unread action is not visible, the floating button will be visible
                result.current.onViewableItemsChanged({viewableItems: [{index: 2, key: 'reportActions_2', isViewable: true, item: {}}], changed: []});
            });

            rerender({});

            expect(result.current.isFloatingMessageCounterVisible).toBe(true);
            expect(readNewestAction).toHaveBeenCalledTimes(0);

            act(() => {
                // scrolling so that the unread action is visible, should call readNewestAction
                result.current.onViewableItemsChanged({viewableItems: [{index: 1, key: 'reportActions_1', isViewable: true, item: {}}], changed: []});
            });

            rerender({});

            // Then
            expect(readNewestAction).toHaveBeenCalledTimes(1);
            expect(readActionRefFalse.current).toBe(false);
            expect(result.current.isFloatingMessageCounterVisible).toBe(false);
        });
    });
});
