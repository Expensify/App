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
var bounds_observer_1 = require("@react-ng/bounds-observer");
var react_1 = require("react");
var Hoverable_1 = require("@components/Hoverable");
var GenericTooltip_1 = require("@components/Tooltip/GenericTooltip");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var deviceHasHoverSupport = (0, DeviceCapabilities_1.hasHoverSupport)();
/**
 * A component used to wrap an element intended for displaying a tooltip. The term "tooltip's target" refers to the
 * wrapped element, which, upon hover, triggers the tooltip to be shown.
 */
/**
 * Choose the correct bounding box for the tooltip to be positioned against.
 * This handles the case where the target is wrapped across two lines, and
 * so we need to find the correct part (the one that the user is hovering
 * over) and show the tooltip there.
 *
 * @param target The DOM element being hovered over.
 * @param clientX The X position from the MouseEvent.
 * @param clientY The Y position from the MouseEvent.
 * @return The chosen bounding box.
 */
function chooseBoundingBox(target, clientX, clientY) {
    var slop = 5;
    var bbs = target.getClientRects();
    var clientXMin = clientX - slop;
    var clientXMax = clientX + slop;
    var clientYMin = clientY - slop;
    var clientYMax = clientY + slop;
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (var i = 0; i < bbs.length; i++) {
        var bb = bbs[i];
        if (clientXMin <= bb.right && clientXMax >= bb.left && clientYMin <= bb.bottom && clientYMax >= bb.top) {
            return bb;
        }
    }
    // If no matching bounding box is found, fall back to getBoundingClientRect.
    return target.getBoundingClientRect();
}
function Tooltip(_a, ref) {
    var children = _a.children, _b = _a.shouldHandleScroll, shouldHandleScroll = _b === void 0 ? false : _b, _c = _a.isFocused, isFocused = _c === void 0 ? true : _c, props = __rest(_a, ["children", "shouldHandleScroll", "isFocused"]);
    var target = (0, react_1.useRef)(null);
    var initialMousePosition = (0, react_1.useRef)({ x: 0, y: 0 });
    var updateTargetAndMousePosition = (0, react_1.useCallback)(function (e) {
        if (!(e.currentTarget instanceof HTMLElement)) {
            return;
        }
        target.current = e.currentTarget;
        initialMousePosition.current = { x: e.clientX, y: e.clientY };
    }, []);
    /**
     * Get the tooltip bounding rectangle
     */
    var getBounds = function (bounds) {
        if (!target.current) {
            return bounds;
        }
        // Choose a bounding box for the tooltip to target.
        // In the case when the target is a link that has wrapped onto
        // multiple lines, we want to show the tooltip over the part
        // of the link that the user is hovering over.
        return chooseBoundingBox(target.current, initialMousePosition.current.x, initialMousePosition.current.y);
    };
    var updateTargetPositionOnMouseEnter = (0, react_1.useCallback)(function (e) {
        updateTargetAndMousePosition(e);
        if (react_1.default.isValidElement(children)) {
            var onMouseEnter = children.props.onMouseEnter;
            onMouseEnter === null || onMouseEnter === void 0 ? void 0 : onMouseEnter(e);
        }
    }, [children, updateTargetAndMousePosition]);
    // Skip the tooltip and return the children if the device does not support hovering
    if (!deviceHasHoverSupport) {
        return children;
    }
    // Skip the tooltip and return the children if navigation does not focus.
    if (!isFocused) {
        return children;
    }
    return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <GenericTooltip_1.default {...props}>
            {function (_a) {
            var isVisible = _a.isVisible, showTooltip = _a.showTooltip, hideTooltip = _a.hideTooltip, updateTargetBounds = _a.updateTargetBounds;
            // Checks if valid element so we can wrap the BoundsObserver around it
            // If not, we just return the primitive children
            return react_1.default.isValidElement(children) ? (<bounds_observer_1.BoundsObserver enabled={isVisible} onBoundsChange={function (bounds) {
                    updateTargetBounds(getBounds(bounds));
                }} ref={ref}>
                        <Hoverable_1.default onHoverIn={showTooltip} onHoverOut={hideTooltip} shouldHandleScroll={shouldHandleScroll}>
                            {react_1.default.cloneElement(children, {
                    onMouseEnter: updateTargetPositionOnMouseEnter,
                })}
                        </Hoverable_1.default>
                    </bounds_observer_1.BoundsObserver>) : (children);
        }}
        </GenericTooltip_1.default>);
}
Tooltip.displayName = 'Tooltip';
exports.default = (0, react_1.memo)((0, react_1.forwardRef)(Tooltip));
