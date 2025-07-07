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
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var GenericTooltip_1 = require("@components/Tooltip/GenericTooltip");
var useIsResizing_1 = require("@hooks/useIsResizing");
var useSafeAreaInsets_1 = require("@hooks/useSafeAreaInsets");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var measureTooltipCoordinate_1 = require("./measureTooltipCoordinate");
/**
 * A component used to wrap an element intended for displaying a tooltip.
 * This tooltip would show immediately without user's interaction and hide after 5 seconds.
 */
function BaseEducationalTooltip(_a) {
    var children = _a.children, _b = _a.shouldRender, shouldRender = _b === void 0 ? false : _b, _c = _a.shouldHideOnNavigate, shouldHideOnNavigate = _c === void 0 ? true : _c, _d = _a.shouldHideOnScroll, shouldHideOnScroll = _d === void 0 ? false : _d, props = __rest(_a, ["children", "shouldRender", "shouldHideOnNavigate", "shouldHideOnScroll"]);
    var genericTooltipStateRef = (0, react_1.useRef)(undefined);
    var tooltipElementRef = (0, react_1.useRef)(undefined);
    var _e = (0, react_1.useState)(false), shouldMeasure = _e[0], setShouldMeasure = _e[1];
    var show = (0, react_1.useRef)(undefined);
    var navigator = (0, react_1.useContext)(native_1.NavigationContext);
    var insets = (0, useSafeAreaInsets_1.default)();
    var isResizing = (0, useIsResizing_1.default)();
    var renderTooltip = (0, react_1.useCallback)(function () {
        if (!tooltipElementRef.current || !genericTooltipStateRef.current) {
            return;
        }
        var _a = genericTooltipStateRef.current, hideTooltip = _a.hideTooltip, showTooltip = _a.showTooltip, updateTargetBounds = _a.updateTargetBounds;
        (0, measureTooltipCoordinate_1.getTooltipCoordinates)(tooltipElementRef.current, function (bounds) {
            updateTargetBounds(bounds);
            var x = bounds.x, y = bounds.y, elementWidth = bounds.width, height = bounds.height;
            var offset = 10; // Tooltip hides when content moves 10px past header/footer.
            var dimensions = react_native_1.Dimensions.get('window');
            var top = y - (insets.top || 0);
            var bottom = y + height + insets.bottom || 0;
            var left = x - (insets.left || 0);
            var right = x + elementWidth + (insets.right || 0);
            // Calculate the available space at the top, considering the header height and offset
            var availableHeightForTop = top - (variables_1.default.contentHeaderHeight - offset);
            // Calculate the total height available after accounting for the bottom tab and offset
            var availableHeightForBottom = dimensions.height - (bottom + variables_1.default.bottomTabHeight - offset);
            // Calculate available horizontal space, taking into account safe-area insets
            var availableWidthForLeft = left - offset;
            var availableWidthForRight = dimensions.width - (right - offset);
            // Hide if the element scrolled out vertically or horizontally
            if (availableHeightForTop < 0 || availableHeightForBottom < 0 || availableWidthForLeft < 0 || availableWidthForRight < 0) {
                hideTooltip();
            }
            else {
                showTooltip();
            }
        });
    }, [insets]);
    (0, react_1.useEffect)(function () {
        if (!genericTooltipStateRef.current || !shouldRender) {
            return;
        }
        if (isResizing) {
            var hideTooltip = genericTooltipStateRef.current.hideTooltip;
            // Hide the tooltip if the screen is being resized
            hideTooltip();
        }
        else {
            // Re-render the tooltip when resizing ends
            // This is necessary to ensure the tooltip is positioned correctly after resizing
            renderTooltip();
        }
    }, [isResizing, renderTooltip, shouldRender]);
    var setTooltipPosition = (0, react_1.useCallback)(function (isScrolling) {
        if (!shouldHideOnScroll || !genericTooltipStateRef.current) {
            return;
        }
        var hideTooltip = genericTooltipStateRef.current.hideTooltip;
        if (isScrolling) {
            hideTooltip();
        }
        else {
            renderTooltip();
        }
    }, [renderTooltip, shouldHideOnScroll]);
    (0, react_1.useLayoutEffect)(function () {
        if (!shouldRender || !shouldHideOnScroll) {
            return;
        }
        setTooltipPosition(false);
        var scrollingListener = react_native_1.DeviceEventEmitter.addListener(CONST_1.default.EVENTS.SCROLLING, function (_a) {
            var _b = _a === void 0 ? { isScrolling: false } : _a, isScrolling = _b.isScrolling;
            setTooltipPosition(isScrolling);
        });
        return function () { return scrollingListener.remove(); };
    }, [shouldRender, shouldHideOnScroll, setTooltipPosition]);
    (0, react_1.useEffect)(function () {
        return function () {
            var _a;
            (_a = genericTooltipStateRef.current) === null || _a === void 0 ? void 0 : _a.hideTooltip();
        };
    }, []);
    (0, react_1.useEffect)(function () {
        var _a;
        if (!shouldMeasure) {
            return;
        }
        if (!shouldRender) {
            (_a = genericTooltipStateRef.current) === null || _a === void 0 ? void 0 : _a.hideTooltip();
            return;
        }
        // When tooltip is used inside an animated view (e.g. popover), we need to wait for the animation to finish before measuring content.
        var timerID = setTimeout(function () {
            var _a;
            (_a = show.current) === null || _a === void 0 ? void 0 : _a.call(show);
        }, 500);
        return function () {
            clearTimeout(timerID);
        };
    }, [shouldMeasure, shouldRender]);
    (0, react_1.useEffect)(function () {
        if (!navigator) {
            return;
        }
        var unsubscribe = navigator.addListener('blur', function () {
            var _a;
            if (!shouldHideOnNavigate) {
                return;
            }
            (_a = genericTooltipStateRef.current) === null || _a === void 0 ? void 0 : _a.hideTooltip();
        });
        return unsubscribe;
    }, [navigator, shouldHideOnNavigate]);
    return (<GenericTooltip_1.default shouldForceAnimate shouldRender={shouldRender} isEducationTooltip 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}>
            {function (genericTooltipState) {
            var updateTargetBounds = genericTooltipState.updateTargetBounds, showTooltip = genericTooltipState.showTooltip;
            // eslint-disable-next-line react-compiler/react-compiler
            genericTooltipStateRef.current = genericTooltipState;
            return react_1.default.cloneElement(children, {
                onLayout: function (e) {
                    if (!shouldMeasure) {
                        setShouldMeasure(true);
                    }
                    // e.target is specific to native, use e.nativeEvent.target on web instead
                    var target = e.target || e.nativeEvent.target;
                    tooltipElementRef.current = target;
                    show.current = function () { return (0, measureTooltipCoordinate_1.default)(target, updateTargetBounds, showTooltip); };
                },
            });
        }}
        </GenericTooltip_1.default>);
}
BaseEducationalTooltip.displayName = 'BaseEducationalTooltip';
exports.default = (0, react_1.memo)(BaseEducationalTooltip);
