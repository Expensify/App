"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable react-compiler/react-compiler */
var react_1 = require("react");
var react_native_1 = require("react-native");
var FocusTrapForModal_1 = require("@components/FocusTrap/FocusTrapForModal");
var PopoverWithMeasuredContent_1 = require("@components/PopoverWithMeasuredContent");
var withViewportOffsetTop_1 = require("@components/withViewportOffsetTop");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useWindowDimensions_1 = require("@hooks/useWindowDimensions");
var Browser_1 = require("@libs/Browser");
var calculateAnchorPosition_1 = require("@libs/calculateAnchorPosition");
var Modal_1 = require("@userActions/Modal");
var CONST_1 = require("@src/CONST");
var EmojiPickerMenu_1 = require("./EmojiPickerMenu");
var DEFAULT_ANCHOR_ORIGIN = {
    horizontal: CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
    vertical: CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
};
function EmojiPicker(_a, ref) {
    var viewportOffsetTop = _a.viewportOffsetTop;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var _b = (0, react_1.useState)(false), isEmojiPickerVisible = _b[0], setIsEmojiPickerVisible = _b[1];
    var _c = (0, react_1.useState)({
        horizontal: 0,
        vertical: 0,
    }), emojiPopoverAnchorPosition = _c[0], setEmojiPopoverAnchorPosition = _c[1];
    var _d = (0, react_1.useState)(DEFAULT_ANCHOR_ORIGIN), emojiPopoverAnchorOrigin = _d[0], setEmojiPopoverAnchorOrigin = _d[1];
    var _e = (0, react_1.useState)(true), isWithoutOverlay = _e[0], setIsWithoutOverlay = _e[1];
    var _f = (0, react_1.useState)(), activeID = _f[0], setActiveID = _f[1];
    var emojiPopoverAnchorRef = (0, react_1.useRef)(null);
    var emojiAnchorDimension = (0, react_1.useRef)({
        width: 0,
        height: 0,
    });
    var onModalHide = (0, react_1.useRef)(function () { });
    var onEmojiSelected = (0, react_1.useRef)(function () { });
    var activeEmoji = (0, react_1.useRef)(undefined);
    var emojiSearchInput = (0, react_1.useRef)(null);
    var windowHeight = (0, useWindowDimensions_1.default)().windowHeight;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    /**
     * Get the popover anchor ref
     *
     * emojiPopoverAnchorRef contains either null or the ref object of the anchor element.
     * { current: { current: anchorElement } }
     *
     * Don't directly get the ref from emojiPopoverAnchorRef, instead use getEmojiPopoverAnchor()
     */
    var getEmojiPopoverAnchor = (0, react_1.useCallback)(function () { var _a; return (_a = emojiPopoverAnchorRef.current) !== null && _a !== void 0 ? _a : emojiPopoverAnchorRef; }, []);
    /**
     * Show the emoji picker menu.
     *
     * @param [onModalHideValue=() => {}] - Run a callback when Modal hides.
     * @param [onEmojiSelectedValue=() => {}] - Run a callback when Emoji selected.
     * @param emojiPopoverAnchorValue - Element to which Popover is anchored
     * @param [anchorOrigin=DEFAULT_ANCHOR_ORIGIN] - Anchor origin for Popover
     * @param [onWillShow] - Run a callback when Popover will show
     * @param id - Unique id for EmojiPicker
     * @param activeEmojiValue - Selected emoji to be highlighted
     */
    var showEmojiPicker = function (onModalHideValue, onEmojiSelectedValue, emojiPopoverAnchorValue, anchorOrigin, onWillShow, id, activeEmojiValue, withoutOverlay) {
        var _a;
        if (withoutOverlay === void 0) { withoutOverlay = true; }
        onModalHide.current = onModalHideValue;
        onEmojiSelected.current = onEmojiSelectedValue;
        activeEmoji.current = activeEmojiValue;
        setIsWithoutOverlay(withoutOverlay);
        emojiPopoverAnchorRef.current = emojiPopoverAnchorValue;
        var emojiPopoverAnchor = getEmojiPopoverAnchor();
        // Drop focus to avoid blue focus ring.
        (_a = emojiPopoverAnchor === null || emojiPopoverAnchor === void 0 ? void 0 : emojiPopoverAnchor.current) === null || _a === void 0 ? void 0 : _a.blur();
        var anchorOriginValue = anchorOrigin !== null && anchorOrigin !== void 0 ? anchorOrigin : DEFAULT_ANCHOR_ORIGIN;
        // It's possible that the anchor is inside an active modal (e.g., add emoji reaction in report context menu).
        // So, we need to get the anchor position first before closing the active modal which will also destroy the anchor.
        (0, calculateAnchorPosition_1.default)(emojiPopoverAnchor === null || emojiPopoverAnchor === void 0 ? void 0 : emojiPopoverAnchor.current, anchorOriginValue).then(function (value) {
            (0, Modal_1.close)(function () {
                onWillShow === null || onWillShow === void 0 ? void 0 : onWillShow();
                setIsEmojiPickerVisible(true);
                setEmojiPopoverAnchorPosition({
                    horizontal: value.horizontal,
                    vertical: value.vertical,
                });
                emojiAnchorDimension.current = {
                    width: value.width,
                    height: value.height,
                };
                setEmojiPopoverAnchorOrigin(anchorOriginValue);
                setActiveID(id);
            });
        });
    };
    /**
     * Hide the emoji picker menu.
     */
    var hideEmojiPicker = function (isNavigating) {
        var currOnModalHide = onModalHide.current;
        onModalHide.current = function () {
            if (currOnModalHide) {
                currOnModalHide(!!isNavigating);
            }
            emojiPopoverAnchorRef.current = null;
        };
        setIsEmojiPickerVisible(false);
    };
    /**
     * Focus the search input in the emoji picker.
     */
    var focusEmojiSearchInput = function () {
        if (!emojiSearchInput.current) {
            return;
        }
        emojiSearchInput.current.focus();
    };
    /**
     * Callback for the emoji picker to add whatever emoji is chosen into the main input
     */
    var selectEmoji = function (emoji, emojiObject) {
        // Prevent fast click / multiple emoji selection;
        // The first click will hide the emoji picker by calling the hideEmojiPicker() function
        if (!isEmojiPickerVisible) {
            return;
        }
        hideEmojiPicker(false);
        if (typeof onEmojiSelected.current === 'function') {
            onEmojiSelected.current(emoji, emojiObject);
        }
    };
    /**
     * Whether emoji picker is active for the given id.
     */
    var isActive = function (id) { return !!id && id === activeID; };
    var clearActive = function () { return setActiveID(null); };
    var resetEmojiPopoverAnchor = function () { return (emojiPopoverAnchorRef.current = null); };
    (0, react_1.useImperativeHandle)(ref, function () { return ({ showEmojiPicker: showEmojiPicker, isActive: isActive, clearActive: clearActive, hideEmojiPicker: hideEmojiPicker, isEmojiPickerVisible: isEmojiPickerVisible, resetEmojiPopoverAnchor: resetEmojiPopoverAnchor }); });
    (0, react_1.useEffect)(function () {
        var emojiPopoverDimensionListener = react_native_1.Dimensions.addEventListener('change', function () {
            var emojiPopoverAnchor = getEmojiPopoverAnchor();
            if (!(emojiPopoverAnchor === null || emojiPopoverAnchor === void 0 ? void 0 : emojiPopoverAnchor.current)) {
                // In small screen width, the window size change might be due to keyboard open/hide, we should avoid hide EmojiPicker in those cases
                if (isEmojiPickerVisible && !shouldUseNarrowLayout) {
                    hideEmojiPicker();
                }
                return;
            }
            (0, calculateAnchorPosition_1.default)(emojiPopoverAnchor === null || emojiPopoverAnchor === void 0 ? void 0 : emojiPopoverAnchor.current, emojiPopoverAnchorOrigin).then(function (value) {
                setEmojiPopoverAnchorPosition({
                    horizontal: value.horizontal,
                    vertical: value.vertical,
                });
                emojiAnchorDimension.current = {
                    width: value.width,
                    height: value.height,
                };
            });
        });
        return function () {
            if (!emojiPopoverDimensionListener) {
                return;
            }
            emojiPopoverDimensionListener.remove();
        };
    }, [isEmojiPickerVisible, shouldUseNarrowLayout, emojiPopoverAnchorOrigin, getEmojiPopoverAnchor]);
    return (<PopoverWithMeasuredContent_1.default shouldHandleNavigationBack={(0, Browser_1.isMobileChrome)()} isVisible={isEmojiPickerVisible} onClose={hideEmojiPicker} onModalShow={focusEmojiSearchInput} onModalHide={onModalHide.current} shouldSetModalVisibility={false} anchorPosition={{
            vertical: emojiPopoverAnchorPosition.vertical,
            horizontal: emojiPopoverAnchorPosition.horizontal,
        }} anchorRef={getEmojiPopoverAnchor()} withoutOverlay={isWithoutOverlay} popoverDimensions={{
            width: CONST_1.default.EMOJI_PICKER_SIZE.WIDTH,
            height: CONST_1.default.EMOJI_PICKER_SIZE.HEIGHT,
        }} anchorAlignment={emojiPopoverAnchorOrigin} outerStyle={StyleUtils.getOuterModalStyle(windowHeight, viewportOffsetTop)} innerContainerStyle={styles.popoverInnerContainer} anchorDimensions={emojiAnchorDimension.current} avoidKeyboard shouldSwitchPositionIfOverflow shouldEnableNewFocusManagement restoreFocusType={CONST_1.default.MODAL.RESTORE_FOCUS_TYPE.DELETE} shouldSkipRemeasurement>
            <FocusTrapForModal_1.default active={isEmojiPickerVisible}>
                <react_native_1.View>
                    <EmojiPickerMenu_1.default onEmojiSelected={selectEmoji} activeEmoji={activeEmoji.current} ref={function (el) {
            emojiSearchInput.current = el;
        }}/>
                </react_native_1.View>
            </FocusTrapForModal_1.default>
        </PopoverWithMeasuredContent_1.default>);
}
EmojiPicker.displayName = 'EmojiPicker';
exports.default = (0, withViewportOffsetTop_1.default)((0, react_1.forwardRef)(EmojiPicker));
