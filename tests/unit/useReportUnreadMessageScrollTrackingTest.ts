import {act, renderHook} from '@testing-library/react-native';
import type {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import useReportUnreadMessageScrollTracking from '@pages/home/report/useReportUnreadMessageScrollTracking';
import {readNewestAction} from '@userActions/Report';
import CONST from '@src/CONST';

jest.mock('@userActions/Report', () => {
    return {
        readNewestAction: jest.fn(),
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
                    floatingMessageVisibleInitialValue: false,
                    hasUnreadMarkerReportAction: false,
                    onTrackScrolling: onTrackScrollingMockFn,
                }),
            );

            // Then
            expect(result.current.isFloatingMessageCounterVisible).toBe(false);
            expect(onTrackScrollingMockFn).not.toBeCalled();
        });

        it('returns floatingMessage visibility that was set to a new value', () => {
            // Given
            const offsetRef = {current: 0};
            const {result, rerender} = renderHook(() =>
                useReportUnreadMessageScrollTracking({
                    reportID,
                    currentVerticalScrollingOffsetRef: offsetRef,
                    readActionSkippedRef: readActionRefFalse,
                    floatingMessageVisibleInitialValue: false,
                    hasUnreadMarkerReportAction: false,
                    onTrackScrolling: onTrackScrollingMockFn,
                }),
            );

            // When
            act(() => {
                result.current.setIsFloatingMessageCounterVisible(true);
            });
            rerender({});

            // Then
            expect(result.current.isFloatingMessageCounterVisible).toBe(true);
            expect(onTrackScrollingMockFn).not.toBeCalled();
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
                    floatingMessageVisibleInitialValue: false,
                    hasUnreadMarkerReportAction: true,
                    onTrackScrolling: onTrackScrollingMockFn,
                }),
            );

            // When
            act(() => {
                offsetRef.current = CONST.REPORT.ACTIONS.SCROLL_VERTICAL_OFFSET_THRESHOLD + 100;
                result.current.trackVerticalScrolling(emptyScrollEventMock);
            });
            rerender({});

            // Then
            expect(result.current.isFloatingMessageCounterVisible).toBe(true);
            expect(onTrackScrollingMockFn).toBeCalledWith(emptyScrollEventMock);
        });

        it('returns floatingMessage visibility as false when scrolling inside the threshold', () => {
            // Given
            const offsetRef = {current: 0};
            const {result, rerender} = renderHook(() =>
                useReportUnreadMessageScrollTracking({
                    reportID,
                    currentVerticalScrollingOffsetRef: offsetRef,
                    readActionSkippedRef: readActionRefFalse,
                    floatingMessageVisibleInitialValue: false,
                    hasUnreadMarkerReportAction: true,
                    onTrackScrolling: onTrackScrollingMockFn,
                }),
            );

            // When
            act(() => {
                offsetRef.current = CONST.REPORT.ACTIONS.SCROLL_VERTICAL_OFFSET_THRESHOLD - 100;
                result.current.trackVerticalScrolling(emptyScrollEventMock);
            });
            rerender({});

            // Then
            expect(result.current.isFloatingMessageCounterVisible).toBe(false);
            expect(onTrackScrollingMockFn).toBeCalledWith(emptyScrollEventMock);
        });

        it('calls readAction when scrolling inside the threshold and the message and read action skipped is true', () => {
            // Given
            const offsetRef = {current: 0};
            const {result, rerender} = renderHook(() =>
                useReportUnreadMessageScrollTracking({
                    reportID,
                    currentVerticalScrollingOffsetRef: offsetRef,
                    readActionSkippedRef: {current: true},
                    floatingMessageVisibleInitialValue: false,
                    hasUnreadMarkerReportAction: true,
                    onTrackScrolling: onTrackScrollingMockFn,
                }),
            );

            // When
            act(() => {
                // offset greater, will set visible to true
                offsetRef.current = CONST.REPORT.ACTIONS.SCROLL_VERTICAL_OFFSET_THRESHOLD + 100;
                result.current.trackVerticalScrolling(emptyScrollEventMock);
            });

            expect(result.current.isFloatingMessageCounterVisible).toBe(true);
            expect(readNewestAction).toBeCalledTimes(0);

            rerender({});

            act(() => {
                // scrolling into the offset, should call readNewestAction
                offsetRef.current = CONST.REPORT.ACTIONS.SCROLL_VERTICAL_OFFSET_THRESHOLD - 100;
                result.current.trackVerticalScrolling(emptyScrollEventMock);
            });

            // Then
            expect(readNewestAction).toBeCalledTimes(1);
            expect(onTrackScrollingMockFn).toBeCalledWith(emptyScrollEventMock);
            expect(readActionRefFalse.current).toBe(false);
            expect(result.current.isFloatingMessageCounterVisible).toBe(false);
        });
    });
});
