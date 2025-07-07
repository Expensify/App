"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var CONST_1 = require("@src/CONST");
var BaseInvertedFlatList_1 = require("./BaseInvertedFlatList");
var CellRendererComponent_1 = require("./CellRendererComponent");
// This is adapted from https://codesandbox.io/s/react-native-dsyse
// It's a HACK alert since FlatList has inverted scrolling on web
function InvertedFlatList(_a, ref) {
    var _b = _a.onScroll, onScrollProp = _b === void 0 ? function () { } : _b, props = __rest(_a, ["onScroll"]);
    var lastScrollEvent = (0, react_1.useRef)(null);
    var scrollEndTimeout = (0, react_1.useRef)(null);
    var updateInProgress = (0, react_1.useRef)(false);
    (0, react_1.useEffect)(function () { return function () {
        if (!scrollEndTimeout.current) {
            return;
        }
        clearTimeout(scrollEndTimeout.current);
    }; }, [ref]);
    /**
     * Emits when the scrolling is in progress. Also,
     * invokes the onScroll callback function from props.
     *
     * @param event - The onScroll event from the FlatList
     */
    var onScroll = function (event) {
        onScrollProp(event);
        if (!updateInProgress.current) {
            updateInProgress.current = true;
            react_native_1.DeviceEventEmitter.emit(CONST_1.default.EVENTS.SCROLLING, true);
        }
    };
    /**
     * Emits when the scrolling has ended.
     */
    var onScrollEnd = function () {
        react_native_1.DeviceEventEmitter.emit(CONST_1.default.EVENTS.SCROLLING, false);
        updateInProgress.current = false;
    };
    /**
     * Decides whether the scrolling has ended or not. If it has ended,
     * then it calls the onScrollEnd function. Otherwise, it calls the
     * onScroll function and pass the event to it.
     *
     * This is a temporary work around, since react-native-web doesn't
     * support onScrollBeginDrag and onScrollEndDrag props for FlatList.
     * More info:
     * https://github.com/necolas/react-native-web/pull/1305
     *
     * This workaround is taken from below and refactored to fit our needs:
     * https://github.com/necolas/react-native-web/issues/1021#issuecomment-984151185
     *
     */
    var handleScroll = function (event) {
        onScroll(event);
        var timestamp = Date.now();
        if (scrollEndTimeout.current) {
            clearTimeout(scrollEndTimeout.current);
        }
        if (lastScrollEvent.current) {
            scrollEndTimeout.current = setTimeout(function () {
                if (lastScrollEvent.current !== timestamp) {
                    return;
                }
                // Scroll has ended
                lastScrollEvent.current = null;
                onScrollEnd();
            }, 250);
        }
        lastScrollEvent.current = timestamp;
    };
    return (<BaseInvertedFlatList_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} ref={ref} onScroll={handleScroll} CellRendererComponent={CellRendererComponent_1.default}/>);
}
InvertedFlatList.displayName = 'InvertedFlatList';
exports.default = (0, react_1.forwardRef)(InvertedFlatList);
