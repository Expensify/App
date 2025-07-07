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
exports.ScrollContext = void 0;
var react_1 = require("react");
var ScrollView_1 = require("./ScrollView");
var MIN_SMOOTH_SCROLL_EVENT_THROTTLE = 16;
var ScrollContext = (0, react_1.createContext)({
    contentOffsetY: 0,
    scrollViewRef: null,
});
exports.ScrollContext = ScrollContext;
/*
 * <ScrollViewWithContext /> is a wrapper around <ScrollView /> that provides a ref to the <ScrollView />.
 * <ScrollViewWithContext /> can be used as a direct replacement for <ScrollView />
 * if it contains one or more <Picker /> / <RNPickerSelect /> components.
 * Using this wrapper will automatically handle scrolling to the picker's <TextInput />
 * when the picker modal is opened
 */
function ScrollViewWithContext(_a, ref) {
    var onScroll = _a.onScroll, scrollEventThrottle = _a.scrollEventThrottle, children = _a.children, restProps = __rest(_a, ["onScroll", "scrollEventThrottle", "children"]);
    var _b = (0, react_1.useState)(0), contentOffsetY = _b[0], setContentOffsetY = _b[1];
    var defaultScrollViewRef = (0, react_1.useRef)(null);
    var scrollViewRef = ref !== null && ref !== void 0 ? ref : defaultScrollViewRef;
    var setContextScrollPosition = function (event) {
        if (onScroll) {
            onScroll(event);
        }
        setContentOffsetY(event.nativeEvent.contentOffset.y);
    };
    var contextValue = (0, react_1.useMemo)(function () { return ({
        scrollViewRef: scrollViewRef,
        contentOffsetY: contentOffsetY,
    }); }, [scrollViewRef, contentOffsetY]);
    return (<ScrollView_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...restProps} ref={scrollViewRef} onScroll={setContextScrollPosition} 
    // It's possible for scrollEventThrottle to be 0, so we must use "||" to fallback to MIN_SMOOTH_SCROLL_EVENT_THROTTLE.
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    scrollEventThrottle={scrollEventThrottle || MIN_SMOOTH_SCROLL_EVENT_THROTTLE}>
            <ScrollContext.Provider value={contextValue}>{children}</ScrollContext.Provider>
        </ScrollView_1.default>);
}
ScrollViewWithContext.displayName = 'ScrollViewWithContext';
exports.default = (0, react_1.forwardRef)(ScrollViewWithContext);
