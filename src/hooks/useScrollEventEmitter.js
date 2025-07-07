"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var CONST_1 = require("@src/CONST");
/**
 * This hook tracks scroll events and emits a "scrolling" event when scrolling starts and ends.
 */
var useScrollEventEmitter = function () {
    var isScrollingRef = (0, react_1.useRef)(false);
    var timeoutRef = (0, react_1.useRef)(null);
    var triggerScrollEvent = (0, react_1.useCallback)(function () {
        var emitScrolling = function (isScrolling) {
            react_native_1.DeviceEventEmitter.emit(CONST_1.default.EVENTS.SCROLLING, {
                isScrolling: isScrolling,
            });
        };
        // Start emitting the scrolling event when the scroll begins
        if (!isScrollingRef.current) {
            emitScrolling(true);
            isScrollingRef.current = true;
        }
        // End the scroll and emit after a brief timeout to detect the end of scrolling
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(function () {
            emitScrolling(false);
            isScrollingRef.current = false;
        }, 250);
    }, []);
    // Cleanup timeout on unmount
    (0, react_1.useEffect)(function () {
        return function () {
            if (!timeoutRef.current) {
                return;
            }
            clearTimeout(timeoutRef.current);
        };
    }, []);
    return triggerScrollEvent;
};
exports.default = useScrollEventEmitter;
