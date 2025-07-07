"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("@testing-library/react-native");
var useReportUnreadMessageScrollTracking_1 = require("@pages/home/report/useReportUnreadMessageScrollTracking");
var Report_1 = require("@userActions/Report");
var CONST_1 = require("@src/CONST");
jest.mock('@userActions/Report', function () {
    return {
        readNewestAction: jest.fn(),
    };
});
var reportID = '12345';
var readActionRefFalse = { current: false };
var emptyScrollEventMock = {
    nativeEvent: { layoutMeasurement: { height: 0, width: 0 }, contentSize: { width: 100, height: 100 }, contentOffset: { x: 0, y: 0 } },
};
describe('useReportUnreadMessageScrollTracking', function () {
    describe('on init and without any scrolling', function () {
        var onTrackScrollingMockFn = jest.fn();
        it('returns initial floatingMessage visibility and sets no state', function () {
            // Given
            var offsetRef = { current: 0 };
            var result = (0, react_native_1.renderHook)(function () {
                return (0, useReportUnreadMessageScrollTracking_1.default)({
                    reportID: reportID,
                    currentVerticalScrollingOffsetRef: offsetRef,
                    readActionSkippedRef: readActionRefFalse,
                    floatingMessageVisibleInitialValue: false,
                    hasUnreadMarkerReportAction: false,
                    onTrackScrolling: onTrackScrollingMockFn,
                });
            }).result;
            // Then
            expect(result.current.isFloatingMessageCounterVisible).toBe(false);
            expect(onTrackScrollingMockFn).not.toBeCalled();
        });
        it('returns floatingMessage visibility that was set to a new value', function () {
            // Given
            var offsetRef = { current: 0 };
            var _a = (0, react_native_1.renderHook)(function () {
                return (0, useReportUnreadMessageScrollTracking_1.default)({
                    reportID: reportID,
                    currentVerticalScrollingOffsetRef: offsetRef,
                    readActionSkippedRef: readActionRefFalse,
                    floatingMessageVisibleInitialValue: false,
                    hasUnreadMarkerReportAction: false,
                    onTrackScrolling: onTrackScrollingMockFn,
                });
            }), result = _a.result, rerender = _a.rerender;
            // When
            (0, react_native_1.act)(function () {
                result.current.setIsFloatingMessageCounterVisible(true);
            });
            rerender({});
            // Then
            expect(result.current.isFloatingMessageCounterVisible).toBe(true);
            expect(onTrackScrollingMockFn).not.toBeCalled();
        });
    });
    describe('when scrolling', function () {
        var onTrackScrollingMockFn = jest.fn();
        it('returns floatingMessage visibility as true when scrolling outside of threshold', function () {
            // Given
            var offsetRef = { current: 0 };
            var _a = (0, react_native_1.renderHook)(function () {
                return (0, useReportUnreadMessageScrollTracking_1.default)({
                    reportID: reportID,
                    currentVerticalScrollingOffsetRef: offsetRef,
                    readActionSkippedRef: readActionRefFalse,
                    floatingMessageVisibleInitialValue: false,
                    hasUnreadMarkerReportAction: true,
                    onTrackScrolling: onTrackScrollingMockFn,
                });
            }), result = _a.result, rerender = _a.rerender;
            // When
            (0, react_native_1.act)(function () {
                offsetRef.current = CONST_1.default.REPORT.ACTIONS.SCROLL_VERTICAL_OFFSET_THRESHOLD + 100;
                result.current.trackVerticalScrolling(emptyScrollEventMock);
            });
            rerender({});
            // Then
            expect(result.current.isFloatingMessageCounterVisible).toBe(true);
            expect(onTrackScrollingMockFn).toBeCalledWith(emptyScrollEventMock);
        });
        it('returns floatingMessage visibility as false when scrolling inside the threshold', function () {
            // Given
            var offsetRef = { current: 0 };
            var _a = (0, react_native_1.renderHook)(function () {
                return (0, useReportUnreadMessageScrollTracking_1.default)({
                    reportID: reportID,
                    currentVerticalScrollingOffsetRef: offsetRef,
                    readActionSkippedRef: readActionRefFalse,
                    floatingMessageVisibleInitialValue: false,
                    hasUnreadMarkerReportAction: true,
                    onTrackScrolling: onTrackScrollingMockFn,
                });
            }), result = _a.result, rerender = _a.rerender;
            // When
            (0, react_native_1.act)(function () {
                offsetRef.current = CONST_1.default.REPORT.ACTIONS.SCROLL_VERTICAL_OFFSET_THRESHOLD - 100;
                result.current.trackVerticalScrolling(emptyScrollEventMock);
            });
            rerender({});
            // Then
            expect(result.current.isFloatingMessageCounterVisible).toBe(false);
            expect(onTrackScrollingMockFn).toBeCalledWith(emptyScrollEventMock);
        });
        it('calls readAction when scrolling inside the threshold and the message and read action skipped is true', function () {
            // Given
            var offsetRef = { current: 0 };
            var _a = (0, react_native_1.renderHook)(function () {
                return (0, useReportUnreadMessageScrollTracking_1.default)({
                    reportID: reportID,
                    currentVerticalScrollingOffsetRef: offsetRef,
                    readActionSkippedRef: { current: true },
                    floatingMessageVisibleInitialValue: false,
                    hasUnreadMarkerReportAction: true,
                    onTrackScrolling: onTrackScrollingMockFn,
                });
            }), result = _a.result, rerender = _a.rerender;
            // When
            (0, react_native_1.act)(function () {
                // offset greater, will set visible to true
                offsetRef.current = CONST_1.default.REPORT.ACTIONS.SCROLL_VERTICAL_OFFSET_THRESHOLD + 100;
                result.current.trackVerticalScrolling(emptyScrollEventMock);
            });
            expect(result.current.isFloatingMessageCounterVisible).toBe(true);
            expect(Report_1.readNewestAction).toBeCalledTimes(0);
            rerender({});
            (0, react_native_1.act)(function () {
                // scrolling into the offset, should call readNewestAction
                offsetRef.current = CONST_1.default.REPORT.ACTIONS.SCROLL_VERTICAL_OFFSET_THRESHOLD - 100;
                result.current.trackVerticalScrolling(emptyScrollEventMock);
            });
            // Then
            expect(Report_1.readNewestAction).toBeCalledTimes(1);
            expect(onTrackScrollingMockFn).toBeCalledWith(emptyScrollEventMock);
            expect(readActionRefFalse.current).toBe(false);
            expect(result.current.isFloatingMessageCounterVisible).toBe(false);
        });
    });
});
