"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var mergeRefs_1 = require("@libs/mergeRefs");
var ValueUtils_1 = require("@libs/ValueUtils");
var CONST_1 = require("@src/CONST");
function ActiveHoverable(_a, outerRef) {
    var onHoverIn = _a.onHoverIn, onHoverOut = _a.onHoverOut, shouldHandleScroll = _a.shouldHandleScroll, shouldFreezeCapture = _a.shouldFreezeCapture, children = _a.children;
    var _b = (0, react_1.useState)(false), isHovered = _b[0], setIsHovered = _b[1];
    var elementRef = (0, react_1.useRef)(null);
    var isScrollingRef = (0, react_1.useRef)(false);
    var isHoveredRef = (0, react_1.useRef)(false);
    var isVisibilityHidden = (0, react_1.useRef)(false);
    var updateIsHovered = (0, react_1.useCallback)(function (hovered) {
        if (shouldFreezeCapture) {
            return;
        }
        isHoveredRef.current = hovered;
        isVisibilityHidden.current = false;
        if (shouldHandleScroll && isScrollingRef.current) {
            return;
        }
        setIsHovered(hovered);
        if (hovered) {
            onHoverIn === null || onHoverIn === void 0 ? void 0 : onHoverIn();
        }
        else {
            onHoverOut === null || onHoverOut === void 0 ? void 0 : onHoverOut();
        }
    }, [shouldHandleScroll, shouldFreezeCapture, onHoverIn, onHoverOut]);
    (0, react_1.useEffect)(function () {
        if (!shouldHandleScroll) {
            return;
        }
        var scrollingListener = react_native_1.DeviceEventEmitter.addListener(CONST_1.default.EVENTS.SCROLLING, function (scrolling) {
            var _a;
            isScrollingRef.current = scrolling;
            if (scrolling && isHovered) {
                setIsHovered(false);
                onHoverOut === null || onHoverOut === void 0 ? void 0 : onHoverOut();
            }
            else if (!scrolling && ((_a = elementRef.current) === null || _a === void 0 ? void 0 : _a.matches(':hover'))) {
                setIsHovered(true);
                onHoverIn === null || onHoverIn === void 0 ? void 0 : onHoverIn();
            }
        });
        return function () { return scrollingListener.remove(); };
    }, [shouldHandleScroll, isHovered, onHoverIn, onHoverOut]);
    (0, react_1.useEffect)(function () {
        var handleVisibilityChange = function () {
            if (document.visibilityState === 'hidden') {
                isVisibilityHidden.current = true;
                setIsHovered(false);
            }
            else {
                isVisibilityHidden.current = false;
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return function () { return document.removeEventListener('visibilitychange', handleVisibilityChange); };
    }, []);
    var handleMouseEvents = (0, react_1.useCallback)(function (type) { return function () {
        if (shouldFreezeCapture) {
            return;
        }
        var newHoverState = type === 'enter';
        isHoveredRef.current = newHoverState;
        isVisibilityHidden.current = false;
        updateIsHovered(newHoverState);
    }; }, [shouldFreezeCapture, updateIsHovered]);
    var child = (0, react_1.useMemo)(function () { return (0, ValueUtils_1.getReturnValue)(children, isHovered); }, [children, isHovered]);
    var _c = child.props, onMouseEnter = _c.onMouseEnter, onMouseLeave = _c.onMouseLeave;
    return (0, react_1.cloneElement)(child, {
        ref: (0, mergeRefs_1.default)(elementRef, outerRef, child.ref),
        onMouseEnter: function (e) {
            handleMouseEvents('enter')();
            onMouseEnter === null || onMouseEnter === void 0 ? void 0 : onMouseEnter(e);
        },
        onMouseLeave: function (e) {
            handleMouseEvents('leave')();
            onMouseLeave === null || onMouseLeave === void 0 ? void 0 : onMouseLeave(e);
        },
    });
}
exports.default = (0, react_1.forwardRef)(ActiveHoverable);
