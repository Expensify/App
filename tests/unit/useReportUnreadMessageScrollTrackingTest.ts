import {act, renderHook} from '@testing-library/react-native';
import type {SharedValue} from 'react-native-reanimated';
import useReportUnreadMessageScrollTracking from '@pages/home/report/useReportUnreadMessageScrollTracking';
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

const reportID = '12345';
const readActionRefFalse = {current: false};

describe('useReportUnreadMessageScrollTracking', () => {
    describe('on init and without any scrolling', () => {
        it('returns initial floatingMessage visibility and sets no state', () => {
            // Given
            const offsetY = createMockSharedValue(0);
            const keyboardHeight = createMockSharedValue(0);
            const {result} = renderHook(() =>
                useReportUnreadMessageScrollTracking({
                    reportID,
                    readActionSkippedRef: readActionRefFalse,
                    floatingMessageVisibleInitialValue: false,
                    hasUnreadMarkerReportAction: false,
                    currentVerticalScrollingOffset: offsetY,
                    keyboardHeight,
                }),
            );

            // Then
            expect(result.current.isFloatingMessageCounterVisible).toBe(false);
        });

        it('returns floatingMessage visibility that was set to a new value', () => {
            // Given
            const offsetY = createMockSharedValue(0);
            const keyboardHeight = createMockSharedValue(0);
            const {result, rerender} = renderHook(() =>
                useReportUnreadMessageScrollTracking({
                    reportID,
                    readActionSkippedRef: readActionRefFalse,
                    floatingMessageVisibleInitialValue: false,
                    hasUnreadMarkerReportAction: false,
                    currentVerticalScrollingOffset: offsetY,
                    keyboardHeight,
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
                    floatingMessageVisibleInitialValue: false,
                    hasUnreadMarkerReportAction: true,
                    currentVerticalScrollingOffset: offsetY,
                    keyboardHeight,
                }),
            );

            // When
            act(() => {
                offsetY.set(CONST.REPORT.ACTIONS.SCROLL_VERTICAL_OFFSET_THRESHOLD + 100);
            });

            rerender({});

            // Then
            expect(result.current.isFloatingMessageCounterVisible).toBe(true);
        });

        it('returns floatingMessage visibility as false when scrolling inside the threshold', () => {
            // Given
            const offsetY = createMockSharedValue(0);
            const keyboardHeight = createMockSharedValue(0);
            const {result, rerender} = renderHook(() =>
                useReportUnreadMessageScrollTracking({
                    reportID,
                    readActionSkippedRef: readActionRefFalse,
                    floatingMessageVisibleInitialValue: false,
                    hasUnreadMarkerReportAction: true,
                    currentVerticalScrollingOffset: offsetY,
                    keyboardHeight,
                }),
            );

            // When
            act(() => {
                offsetY.set(CONST.REPORT.ACTIONS.SCROLL_VERTICAL_OFFSET_THRESHOLD - 100);
            });
            rerender({});

            // Then
            expect(result.current.isFloatingMessageCounterVisible).toBe(false);
        });

        it('calls readAction when scrolling inside the threshold and the message and read action skipped is true', () => {
            // Given
            const offsetY = createMockSharedValue(0);
            const keyboardHeight = createMockSharedValue(0);
            const {result, rerender} = renderHook(() =>
                useReportUnreadMessageScrollTracking({
                    reportID,
                    readActionSkippedRef: {current: true},
                    floatingMessageVisibleInitialValue: false,
                    hasUnreadMarkerReportAction: true,
                    currentVerticalScrollingOffset: offsetY,
                    keyboardHeight,
                }),
            );

            // When
            act(() => {
                // offset greater, will set visible to true
                offsetY.set(CONST.REPORT.ACTIONS.SCROLL_VERTICAL_OFFSET_THRESHOLD + 100);
            });

            rerender({});

            expect(result.current.isFloatingMessageCounterVisible).toBe(true);
            expect(readNewestAction).toBeCalledTimes(0);

            rerender({});

            act(() => {
                // scrolling into the offset, should call readNewestAction
                offsetY.set(CONST.REPORT.ACTIONS.SCROLL_VERTICAL_OFFSET_THRESHOLD - 100);
            });

            rerender({});

            // Then
            expect(readNewestAction).toBeCalledTimes(1);
            expect(readActionRefFalse.current).toBe(false);
            expect(result.current.isFloatingMessageCounterVisible).toBe(false);
        });
    });
});
