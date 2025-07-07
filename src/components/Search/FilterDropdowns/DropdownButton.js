"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Button_1 = require("@components/Button");
var CaretWrapper_1 = require("@components/CaretWrapper");
var PopoverWithMeasuredContent_1 = require("@components/PopoverWithMeasuredContent");
var Text_1 = require("@components/Text");
var withViewportOffsetTop_1 = require("@components/withViewportOffsetTop");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useWindowDimensions_1 = require("@hooks/useWindowDimensions");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var PADDING_MODAL = 8;
var ANCHOR_ORIGIN = {
    horizontal: CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};
function DropdownButton(_a) {
    var label = _a.label, value = _a.value, viewportOffsetTop = _a.viewportOffsetTop, PopoverComponent = _a.PopoverComponent;
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to distinguish RHL and narrow layout
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var isSmallScreenWidth = (0, useResponsiveLayout_1.default)().isSmallScreenWidth;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var windowHeight = (0, useWindowDimensions_1.default)().windowHeight;
    var triggerRef = (0, react_1.useRef)(null);
    var _b = (0, react_1.useState)(false), isOverlayVisible = _b[0], setIsOverlayVisible = _b[1];
    var _c = (0, react_1.useState)({
        horizontal: 0,
        vertical: 0,
    }), popoverTriggerPosition = _c[0], setPopoverTriggerPosition = _c[1];
    var willAlertModalBecomeVisible = (0, useOnyx_1.default)(ONYXKEYS_1.default.MODAL, { selector: function (modal) { return modal === null || modal === void 0 ? void 0 : modal.willAlertModalBecomeVisible; }, canBeMissing: true })[0];
    var onTriggerLayout = function () {
        var _a;
        (_a = triggerRef.current) === null || _a === void 0 ? void 0 : _a.measureInWindow(function (x, y, _, height) {
            setPopoverTriggerPosition({
                horizontal: x,
                vertical: y + height + PADDING_MODAL,
            });
        });
    };
    /**
     * Toggle the overlay between open & closed, and re-calculate the
     * position of the trigger
     */
    var toggleOverlay = (0, react_1.useCallback)(function () {
        setIsOverlayVisible(function (previousValue) {
            if (!previousValue && willAlertModalBecomeVisible) {
                return false;
            }
            return !previousValue;
        });
    }, [willAlertModalBecomeVisible]);
    /**
     * When no items are selected, render the label, otherwise, render the
     * list of selected items as well
     */
    var buttonText = (0, react_1.useMemo)(function () {
        if (!(value === null || value === void 0 ? void 0 : value.length)) {
            return label;
        }
        var selectedItems = Array.isArray(value) ? value.join(', ') : value;
        return "".concat(label, ": ").concat(selectedItems);
    }, [label, value]);
    var containerStyles = (0, react_1.useMemo)(function () {
        if (isSmallScreenWidth) {
            return styles.w100;
        }
        return { width: CONST_1.default.POPOVER_DROPDOWN_WIDTH };
    }, [isSmallScreenWidth, styles]);
    var popoverContent = (0, react_1.useMemo)(function () {
        if (!isOverlayVisible) {
            return null;
        }
        return PopoverComponent({ closeOverlay: toggleOverlay });
        // PopoverComponent is stable so we don't need it here as a dep.
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [isOverlayVisible, toggleOverlay]);
    return (<>
            {/* Dropdown Trigger */}
            <Button_1.default small ref={triggerRef} innerStyles={[isOverlayVisible && styles.buttonHoveredBG, { maxWidth: 256 }]} onPress={toggleOverlay} onLayout={onTriggerLayout}>
                <CaretWrapper_1.default style={[styles.flex1, styles.mw100]}>
                    <Text_1.default numberOfLines={1} style={[styles.textMicroBold, styles.flexShrink1]}>
                        {buttonText}
                    </Text_1.default>
                </CaretWrapper_1.default>
            </Button_1.default>

            {/* Dropdown overlay */}
            <PopoverWithMeasuredContent_1.default anchorRef={triggerRef} avoidKeyboard isVisible={isOverlayVisible} onClose={toggleOverlay} anchorPosition={popoverTriggerPosition} anchorAlignment={ANCHOR_ORIGIN} restoreFocusType={CONST_1.default.MODAL.RESTORE_FOCUS_TYPE.DELETE} shouldEnableNewFocusManagement shouldMeasureAnchorPositionFromTop={false} outerStyle={__assign(__assign({}, StyleUtils.getOuterModalStyle(windowHeight, viewportOffsetTop)), containerStyles)} 
    // This must be false because we dont want the modal to close if we open the RHP for selections
    // such as date years
    shouldCloseWhenBrowserNavigationChanged={false} innerContainerStyle={containerStyles} popoverDimensions={{
            width: CONST_1.default.POPOVER_DROPDOWN_WIDTH,
            height: CONST_1.default.POPOVER_DROPDOWN_MIN_HEIGHT,
        }} shouldSkipRemeasurement>
                {popoverContent}
            </PopoverWithMeasuredContent_1.default>
        </>);
}
DropdownButton.displayName = 'DropdownButton';
exports.default = (0, withViewportOffsetTop_1.default)(DropdownButton);
