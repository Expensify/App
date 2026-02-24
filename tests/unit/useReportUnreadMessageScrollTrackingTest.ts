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
                    onTrackScrolling: onTrackScrollingMockFn,
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
});
