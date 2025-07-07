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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Browser_1 = require("@libs/Browser");
// Changing the scroll position during a momentum scroll does not work on mobile Safari.
// We do a best effort to avoid content jumping by using some hacks on mobile Safari only.
var IS_MOBILE_SAFARI = (0, Browser_1.isMobileSafari)();
function mergeRefs() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return function forwardRef(node) {
        args.forEach(function (ref) {
            if (ref == null) {
                return;
            }
            if (typeof ref === 'function') {
                ref(node);
                return;
            }
            if (typeof ref === 'object') {
                // eslint-disable-next-line no-param-reassign
                ref.current = node;
                return;
            }
            console.error("mergeRefs cannot handle Refs of type boolean, number or string, received ref ".concat(String(ref)));
        });
    };
}
function useMergeRefs() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return (0, react_1.useMemo)(function () { return mergeRefs.apply(void 0, args); }, __spreadArray([], args, true));
}
function getScrollableNode(flatList) {
    return flatList === null || flatList === void 0 ? void 0 : flatList.getScrollableNode();
}
function MVCPFlatList(_a, ref) {
    var maintainVisibleContentPosition = _a.maintainVisibleContentPosition, _b = _a.horizontal, horizontal = _b === void 0 ? false : _b, onScroll = _a.onScroll, props = __rest(_a, ["maintainVisibleContentPosition", "horizontal", "onScroll"]);
    var _c = maintainVisibleContentPosition !== null && maintainVisibleContentPosition !== void 0 ? maintainVisibleContentPosition : {}, mvcpMinIndexForVisible = _c.minIndexForVisible, mvcpAutoscrollToTopThreshold = _c.autoscrollToTopThreshold;
    var scrollRef = (0, react_1.useRef)(null);
    var prevFirstVisibleOffsetRef = (0, react_1.useRef)(0);
    var firstVisibleViewRef = (0, react_1.useRef)(null);
    var mutationObserverRef = (0, react_1.useRef)(null);
    var lastScrollOffsetRef = (0, react_1.useRef)(0);
    var isListRenderedRef = (0, react_1.useRef)(false);
    var mvcpAutoscrollToTopThresholdRef = (0, react_1.useRef)(mvcpAutoscrollToTopThreshold);
    // eslint-disable-next-line react-compiler/react-compiler
    mvcpAutoscrollToTopThresholdRef.current = mvcpAutoscrollToTopThreshold;
    var getScrollOffset = (0, react_1.useCallback)(function () {
        var _a, _b, _c, _d;
        if (!scrollRef.current) {
            return 0;
        }
        return horizontal ? ((_b = (_a = getScrollableNode(scrollRef.current)) === null || _a === void 0 ? void 0 : _a.scrollLeft) !== null && _b !== void 0 ? _b : 0) : ((_d = (_c = getScrollableNode(scrollRef.current)) === null || _c === void 0 ? void 0 : _c.scrollTop) !== null && _d !== void 0 ? _d : 0);
    }, [horizontal]);
    var getContentView = (0, react_1.useCallback)(function () { var _a; return (_a = getScrollableNode(scrollRef.current)) === null || _a === void 0 ? void 0 : _a.childNodes[0]; }, []);
    var scrollToOffset = (0, react_1.useCallback)(function (offset, animated, interrupt) {
        var behavior = animated ? 'smooth' : 'instant';
        var node = getScrollableNode(scrollRef.current);
        if (node == null) {
            return;
        }
        var overflowProp = horizontal ? 'overflowX' : 'overflowY';
        // Stop momentum scrolling on mobile Safari otherwise the scroll position update
        // will not work.
        if (IS_MOBILE_SAFARI && interrupt) {
            node.style[overflowProp] = 'hidden';
        }
        node.scroll(horizontal ? { left: offset, behavior: behavior } : { top: offset, behavior: behavior });
        if (IS_MOBILE_SAFARI && interrupt) {
            node.style[overflowProp] = 'scroll';
        }
    }, [horizontal]);
    var prepareForMaintainVisibleContentPosition = (0, react_1.useCallback)(function () {
        if (mvcpMinIndexForVisible == null) {
            return;
        }
        var contentView = getContentView();
        if (contentView == null) {
            return;
        }
        var scrollOffset = getScrollOffset();
        lastScrollOffsetRef.current = scrollOffset;
        var contentViewLength = contentView.childNodes.length;
        for (var i = mvcpMinIndexForVisible; i < contentViewLength; i++) {
            var subview = contentView.childNodes[i];
            var subviewOffset = horizontal ? subview.offsetLeft : subview.offsetTop;
            if (subviewOffset > scrollOffset) {
                prevFirstVisibleOffsetRef.current = subviewOffset;
                firstVisibleViewRef.current = subview;
                break;
            }
        }
    }, [getContentView, getScrollOffset, mvcpMinIndexForVisible, horizontal]);
    var adjustForMaintainVisibleContentPosition = (0, react_1.useCallback)(function (animated) {
        if (animated === void 0) { animated = true; }
        if (mvcpMinIndexForVisible == null) {
            return;
        }
        var firstVisibleView = firstVisibleViewRef.current;
        var prevFirstVisibleOffset = prevFirstVisibleOffsetRef.current;
        if (firstVisibleView == null || !firstVisibleView.isConnected || prevFirstVisibleOffset == null) {
            return;
        }
        var firstVisibleViewOffset = horizontal ? firstVisibleView.offsetLeft : firstVisibleView.offsetTop;
        var delta = firstVisibleViewOffset - prevFirstVisibleOffset;
        if (Math.abs(delta) > (IS_MOBILE_SAFARI ? 100 : 0.5)) {
            var scrollOffset = lastScrollOffsetRef.current;
            prevFirstVisibleOffsetRef.current = firstVisibleViewOffset;
            scrollToOffset(scrollOffset + delta, false, true);
            if (mvcpAutoscrollToTopThresholdRef.current != null && scrollOffset <= mvcpAutoscrollToTopThresholdRef.current) {
                scrollToOffset(0, animated, false);
            }
        }
    }, [scrollToOffset, mvcpMinIndexForVisible, horizontal]);
    var setupMutationObserver = (0, react_1.useCallback)(function () {
        var _a;
        var contentView = getContentView();
        if (contentView == null) {
            return;
        }
        (_a = mutationObserverRef.current) === null || _a === void 0 ? void 0 : _a.disconnect();
        var mutationObserver = new MutationObserver(function (mutations) {
            var _a;
            var isEditComposerAdded = false;
            // Check if the first visible view is removed and re-calculate it
            // if needed.
            mutations.forEach(function (mutation) {
                mutation.removedNodes.forEach(function (node) {
                    if (node !== firstVisibleViewRef.current) {
                        return;
                    }
                    firstVisibleViewRef.current = null;
                });
                mutation.addedNodes.forEach(function (node) {
                    if (node.nodeType !== Node.ELEMENT_NODE || !node.querySelector('#composer')) {
                        return;
                    }
                    isEditComposerAdded = true;
                });
            });
            if (firstVisibleViewRef.current == null) {
                prepareForMaintainVisibleContentPosition();
            }
            // When the list is hidden, the size will be 0.
            // Ignore the callback if the list is hidden because scrollOffset will always be 0.
            if (!((_a = getScrollableNode(scrollRef.current)) === null || _a === void 0 ? void 0 : _a.clientHeight)) {
                return;
            }
            adjustForMaintainVisibleContentPosition(!isEditComposerAdded);
            prepareForMaintainVisibleContentPosition();
        });
        mutationObserver.observe(contentView, {
            attributes: true,
            childList: true,
            subtree: true,
        });
        mutationObserverRef.current = mutationObserver;
    }, [adjustForMaintainVisibleContentPosition, prepareForMaintainVisibleContentPosition, getContentView]);
    (0, react_1.useEffect)(function () {
        if (!isListRenderedRef.current) {
            return;
        }
        var animationFrame = requestAnimationFrame(function () {
            prepareForMaintainVisibleContentPosition();
            setupMutationObserver();
        });
        return function () {
            cancelAnimationFrame(animationFrame);
        };
    }, [prepareForMaintainVisibleContentPosition, setupMutationObserver]);
    var setMergedRef = useMergeRefs(scrollRef, ref);
    var onRef = (0, react_1.useCallback)(function (newRef) {
        // Make sure to only call refs and re-attach listeners if the node changed.
        if (newRef == null || newRef === scrollRef.current) {
            return;
        }
        setMergedRef(newRef);
        prepareForMaintainVisibleContentPosition();
        setupMutationObserver();
    }, [prepareForMaintainVisibleContentPosition, setMergedRef, setupMutationObserver]);
    (0, react_1.useEffect)(function () {
        var mutationObserver = mutationObserverRef.current;
        return function () {
            mutationObserver === null || mutationObserver === void 0 ? void 0 : mutationObserver.disconnect();
            mutationObserverRef.current = null;
        };
    }, []);
    var onScrollInternal = (0, react_1.useCallback)(function (event) {
        prepareForMaintainVisibleContentPosition();
        onScroll === null || onScroll === void 0 ? void 0 : onScroll(event);
    }, [prepareForMaintainVisibleContentPosition, onScroll]);
    return (<react_native_1.FlatList 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} maintainVisibleContentPosition={maintainVisibleContentPosition} horizontal={horizontal} onScroll={onScrollInternal} scrollEventThrottle={1} ref={onRef} onLayout={function (e) {
            var _a;
            isListRenderedRef.current = true;
            if (!mutationObserverRef.current) {
                prepareForMaintainVisibleContentPosition();
                setupMutationObserver();
            }
            (_a = props.onLayout) === null || _a === void 0 ? void 0 : _a.call(props, e);
        }}/>);
}
MVCPFlatList.displayName = 'MVCPFlatList';
exports.default = react_1.default.forwardRef(MVCPFlatList);
