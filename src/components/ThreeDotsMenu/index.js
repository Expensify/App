"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var utils_1 = require("@components/Button/utils");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var PopoverMenu_1 = require("@components/PopoverMenu");
var PressableWithoutFeedback_1 = require("@components/Pressable/PressableWithoutFeedback");
var EducationalTooltip_1 = require("@components/Tooltip/EducationalTooltip");
var PopoverAnchorTooltip_1 = require("@components/Tooltip/PopoverAnchorTooltip");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Browser_1 = require("@libs/Browser");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function ThreeDotsMenu(_a) {
    var _b;
    var _c = _a.iconTooltip, iconTooltip = _c === void 0 ? 'common.more' : _c, _d = _a.icon, icon = _d === void 0 ? Expensicons.ThreeDots : _d, iconFill = _a.iconFill, iconStyles = _a.iconStyles, _e = _a.onIconPress, onIconPress = _e === void 0 ? function () { } : _e, menuItems = _a.menuItems, anchorPosition = _a.anchorPosition, _f = _a.anchorAlignment, anchorAlignment = _f === void 0 ? {
        horizontal: CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
        vertical: CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP, // we assume that popover menu opens below the button, anchor is at TOP
    } : _f, getAnchorPosition = _a.getAnchorPosition, _g = _a.shouldOverlay, shouldOverlay = _g === void 0 ? false : _g, _h = _a.shouldSetModalVisibility, shouldSetModalVisibility = _h === void 0 ? true : _h, _j = _a.disabled, disabled = _j === void 0 ? false : _j, hideProductTrainingTooltip = _a.hideProductTrainingTooltip, renderProductTrainingTooltipContent = _a.renderProductTrainingTooltipContent, _k = _a.shouldShowProductTrainingTooltip, shouldShowProductTrainingTooltip = _k === void 0 ? false : _k, _l = _a.isNested, isNested = _l === void 0 ? false : _l, threeDotsMenuRef = _a.threeDotsMenuRef;
    var modal = (0, useOnyx_1.default)(ONYXKEYS_1.default.MODAL, { canBeMissing: true })[0];
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var _m = (0, react_1.useState)(false), isPopupMenuVisible = _m[0], setPopupMenuVisible = _m[1];
    var _o = (0, react_1.useState)(), restoreFocusType = _o[0], setRestoreFocusType = _o[1];
    var _p = (0, react_1.useState)(), position = _p[0], setPosition = _p[1];
    var buttonRef = (0, react_1.useRef)(null);
    var translate = (0, useLocalize_1.default)().translate;
    var isBehindModal = (modal === null || modal === void 0 ? void 0 : modal.willAlertModalBecomeVisible) && !(modal === null || modal === void 0 ? void 0 : modal.isPopover) && !shouldOverlay;
    var showPopoverMenu = function () {
        setPopupMenuVisible(true);
    };
    var hidePopoverMenu = (0, react_1.useCallback)(function (selectedItem) {
        if (selectedItem && selectedItem.shouldKeepModalOpen) {
            return;
        }
        setPopupMenuVisible(false);
    }, []);
    (0, react_1.useImperativeHandle)(threeDotsMenuRef, function () { return ({
        isPopupMenuVisible: isPopupMenuVisible,
        hidePopoverMenu: hidePopoverMenu,
    }); });
    (0, react_1.useEffect)(function () {
        if (!isBehindModal || !isPopupMenuVisible) {
            return;
        }
        hidePopoverMenu();
    }, [hidePopoverMenu, isBehindModal, isPopupMenuVisible]);
    var onThreeDotsPress = function () {
        var _a;
        if (isPopupMenuVisible) {
            hidePopoverMenu();
            return;
        }
        hideProductTrainingTooltip === null || hideProductTrainingTooltip === void 0 ? void 0 : hideProductTrainingTooltip();
        (_a = buttonRef.current) === null || _a === void 0 ? void 0 : _a.blur();
        if (getAnchorPosition) {
            getAnchorPosition().then(function (value) {
                setPosition(value);
                showPopoverMenu();
            });
        }
        else {
            showPopoverMenu();
        }
        onIconPress === null || onIconPress === void 0 ? void 0 : onIconPress();
    };
    var TooltipToRender = shouldShowProductTrainingTooltip ? EducationalTooltip_1.default : PopoverAnchorTooltip_1.default;
    var tooltipProps = shouldShowProductTrainingTooltip
        ? {
            renderTooltipContent: renderProductTrainingTooltipContent,
            shouldRender: shouldShowProductTrainingTooltip,
            anchorAlignment: {
                horizontal: CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                vertical: CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
            },
            shiftHorizontal: variables_1.default.savedSearchShiftHorizontal,
            shiftVertical: variables_1.default.savedSearchShiftVertical,
            wrapperStyle: [styles.mh4, styles.pv2, styles.productTrainingTooltipWrapper],
            onTooltipPress: onThreeDotsPress,
        }
        : { text: translate(iconTooltip), shouldRender: true };
    return (<>
            <react_native_1.View>
                {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                <TooltipToRender {...tooltipProps}>
                    <PressableWithoutFeedback_1.default onPress={onThreeDotsPress} disabled={disabled} onMouseDown={function (e) {
            /* Keep the focus state on mWeb like we did on the native apps. */
            if (!(0, Browser_1.isMobile)()) {
                return;
            }
            e.preventDefault();
        }} ref={buttonRef} style={[styles.touchableButtonImage, iconStyles]} role={(0, utils_1.getButtonRole)(isNested)} isNested={isNested} accessibilityLabel={translate(iconTooltip)}>
                        <Icon_1.default src={icon} fill={(iconFill !== null && iconFill !== void 0 ? iconFill : isPopupMenuVisible) ? theme.success : theme.icon}/>
                    </PressableWithoutFeedback_1.default>
                </TooltipToRender>
            </react_native_1.View>
            <PopoverMenu_1.default onClose={hidePopoverMenu} onModalHide={function () { return setRestoreFocusType(undefined); }} isVisible={isPopupMenuVisible && !isBehindModal} anchorPosition={(_b = position !== null && position !== void 0 ? position : anchorPosition) !== null && _b !== void 0 ? _b : { horizontal: 0, vertical: 0 }} anchorAlignment={anchorAlignment} onItemSelected={function (item) {
            setRestoreFocusType(CONST_1.default.MODAL.RESTORE_FOCUS_TYPE.PRESERVE);
            hidePopoverMenu(item);
        }} menuItems={menuItems} withoutOverlay={!shouldOverlay} shouldSetModalVisibility={shouldSetModalVisibility} anchorRef={buttonRef} shouldEnableNewFocusManagement restoreFocusType={restoreFocusType}/>
        </>);
}
ThreeDotsMenu.displayName = 'ThreeDotsMenu';
exports.default = ThreeDotsMenu;
