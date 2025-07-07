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
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var PopoverMenu_1 = require("@components/PopoverMenu");
var useKeyboardShortcut_1 = require("@hooks/useKeyboardShortcut");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useWindowDimensions_1 = require("@hooks/useWindowDimensions");
var mergeRefs_1 = require("@libs/mergeRefs");
var CONST_1 = require("@src/CONST");
function ButtonWithDropdownMenu(_a) {
    var _b, _c, _d;
    var _e = _a.success, success = _e === void 0 ? true : _e, _f = _a.isSplitButton, isSplitButton = _f === void 0 ? true : _f, _g = _a.isLoading, isLoading = _g === void 0 ? false : _g, _h = _a.isDisabled, isDisabled = _h === void 0 ? false : _h, _j = _a.pressOnEnter, pressOnEnter = _j === void 0 ? false : _j, _k = _a.shouldAlwaysShowDropdownMenu, shouldAlwaysShowDropdownMenu = _k === void 0 ? false : _k, _l = _a.menuHeaderText, menuHeaderText = _l === void 0 ? '' : _l, customText = _a.customText, style = _a.style, disabledStyle = _a.disabledStyle, _m = _a.buttonSize, buttonSize = _m === void 0 ? CONST_1.default.DROPDOWN_BUTTON_SIZE.MEDIUM : _m, _o = _a.anchorAlignment, anchorAlignment = _o === void 0 ? {
        horizontal: CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
        vertical: CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP, // we assume that popover menu opens below the button, anchor is at TOP
    } : _o, popoverHorizontalOffsetType = _a.popoverHorizontalOffsetType, buttonRef = _a.buttonRef, onPress = _a.onPress, options = _a.options, onOptionSelected = _a.onOptionSelected, onSubItemSelected = _a.onSubItemSelected, onOptionsMenuShow = _a.onOptionsMenuShow, onOptionsMenuHide = _a.onOptionsMenuHide, _p = _a.enterKeyEventListenerPriority, enterKeyEventListenerPriority = _p === void 0 ? 0 : _p, wrapperStyle = _a.wrapperStyle, _q = _a.useKeyboardShortcuts, useKeyboardShortcuts = _q === void 0 ? false : _q, _r = _a.shouldUseStyleUtilityForAnchorPosition, shouldUseStyleUtilityForAnchorPosition = _r === void 0 ? false : _r, _s = _a.defaultSelectedIndex, defaultSelectedIndex = _s === void 0 ? 0 : _s, _t = _a.shouldShowSelectedItemCheck, shouldShowSelectedItemCheck = _t === void 0 ? false : _t, testID = _a.testID, _u = _a.secondLineText, secondLineText = _u === void 0 ? '' : _u, icon = _a.icon, _v = _a.shouldUseModalPaddingStyle, shouldUseModalPaddingStyle = _v === void 0 ? true : _v;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var _w = (0, react_1.useState)(defaultSelectedIndex), selectedItemIndex = _w[0], setSelectedItemIndex = _w[1];
    var _x = (0, react_1.useState)(false), isMenuVisible = _x[0], setIsMenuVisible = _x[1];
    // In tests, skip the popover anchor position calculation. The default values are needed for popover menu to be rendered in tests.
    var defaultPopoverAnchorPosition = process.env.NODE_ENV === 'test' ? { horizontal: 100, vertical: 100 } : null;
    var _y = (0, react_1.useState)(defaultPopoverAnchorPosition), popoverAnchorPosition = _y[0], setPopoverAnchorPosition = _y[1];
    var _z = (0, useWindowDimensions_1.default)(), windowWidth = _z.windowWidth, windowHeight = _z.windowHeight;
    var dropdownAnchor = (0, react_1.useRef)(null);
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to apply correct popover styles
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var isSmallScreenWidth = (0, useResponsiveLayout_1.default)().isSmallScreenWidth;
    // eslint-disable-next-line react-compiler/react-compiler
    var dropdownButtonRef = isSplitButton ? buttonRef : (0, mergeRefs_1.default)(buttonRef, dropdownAnchor);
    var selectedItem = (_b = options.at(selectedItemIndex)) !== null && _b !== void 0 ? _b : options.at(0);
    var areAllOptionsDisabled = options.every(function (option) { return option.disabled; });
    var innerStyleDropButton = StyleUtils.getDropDownButtonHeight(buttonSize);
    var isButtonSizeLarge = buttonSize === CONST_1.default.DROPDOWN_BUTTON_SIZE.LARGE;
    var nullCheckRef = function (ref) { return ref !== null && ref !== void 0 ? ref : null; };
    (0, react_1.useEffect)(function () {
        if (!dropdownAnchor.current) {
            return;
        }
        if (!isMenuVisible) {
            return;
        }
        if ('measureInWindow' in dropdownAnchor.current) {
            dropdownAnchor.current.measureInWindow(function (x, y, w, h) {
                var horizontalPosition = x + w;
                if (popoverHorizontalOffsetType === 'left') {
                    horizontalPosition = x;
                }
                else if (popoverHorizontalOffsetType === 'center') {
                    horizontalPosition = x + w / 2;
                }
                setPopoverAnchorPosition({
                    horizontal: horizontalPosition,
                    vertical: anchorAlignment.vertical === CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP
                        ? y + h + CONST_1.default.MODAL.POPOVER_MENU_PADDING // if vertical anchorAlignment is TOP, menu will open below the button and we need to add the height of button and padding
                        : y - CONST_1.default.MODAL.POPOVER_MENU_PADDING, // if it is BOTTOM, menu will open above the button so NO need to add height but DO subtract padding
                });
            });
        }
    }, [windowWidth, windowHeight, isMenuVisible, anchorAlignment.vertical, popoverHorizontalOffsetType]);
    (0, useKeyboardShortcut_1.default)(CONST_1.default.KEYBOARD_SHORTCUTS.CTRL_ENTER, function (e) {
        if (shouldAlwaysShowDropdownMenu || options.length) {
            if (!isSplitButton) {
                setIsMenuVisible(!isMenuVisible);
                return;
            }
            if (selectedItem === null || selectedItem === void 0 ? void 0 : selectedItem.value) {
                onPress(e, selectedItem.value);
            }
        }
        else {
            var option = options.at(0);
            if (option === null || option === void 0 ? void 0 : option.value) {
                onPress(e, option.value);
            }
        }
    }, {
        captureOnInputs: true,
        shouldBubble: false,
        isActive: useKeyboardShortcuts,
    });
    var splitButtonWrapperStyle = isSplitButton ? [styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter] : {};
    var handlePress = (0, react_1.useCallback)(function (event) {
        if (!isSplitButton) {
            setIsMenuVisible(!isMenuVisible);
        }
        else if (selectedItem === null || selectedItem === void 0 ? void 0 : selectedItem.value) {
            onPress(event, selectedItem.value);
        }
    }, [isMenuVisible, isSplitButton, onPress, selectedItem === null || selectedItem === void 0 ? void 0 : selectedItem.value]);
    return (<react_native_1.View style={wrapperStyle}>
            {shouldAlwaysShowDropdownMenu || options.length > 1 ? (<react_native_1.View style={[splitButtonWrapperStyle, style]}>
                    <Button_1.default success={success} pressOnEnter={pressOnEnter} ref={dropdownButtonRef} onPress={handlePress} text={(_c = customText !== null && customText !== void 0 ? customText : selectedItem === null || selectedItem === void 0 ? void 0 : selectedItem.text) !== null && _c !== void 0 ? _c : ''} isDisabled={isDisabled || areAllOptionsDisabled} isLoading={isLoading} shouldRemoveRightBorderRadius style={isSplitButton ? [styles.flex1, styles.pr0] : {}} large={buttonSize === CONST_1.default.DROPDOWN_BUTTON_SIZE.LARGE} medium={buttonSize === CONST_1.default.DROPDOWN_BUTTON_SIZE.MEDIUM} small={buttonSize === CONST_1.default.DROPDOWN_BUTTON_SIZE.SMALL} innerStyles={[innerStyleDropButton, !isSplitButton && styles.dropDownButtonCartIconView]} enterKeyEventListenerPriority={enterKeyEventListenerPriority} iconRight={Expensicons.DownArrow} shouldShowRightIcon={!isSplitButton} isSplitButton={isSplitButton} testID={testID} secondLineText={secondLineText} icon={icon}/>

                    {isSplitButton && (<Button_1.default ref={dropdownAnchor} success={success} isDisabled={isDisabled} style={[styles.pl0]} onPress={function () { return setIsMenuVisible(!isMenuVisible); }} shouldRemoveLeftBorderRadius large={buttonSize === CONST_1.default.DROPDOWN_BUTTON_SIZE.LARGE} medium={buttonSize === CONST_1.default.DROPDOWN_BUTTON_SIZE.MEDIUM} small={buttonSize === CONST_1.default.DROPDOWN_BUTTON_SIZE.SMALL} innerStyles={[styles.dropDownButtonCartIconContainerPadding, innerStyleDropButton]} enterKeyEventListenerPriority={enterKeyEventListenerPriority}>
                            <react_native_1.View style={[styles.dropDownButtonCartIconView, innerStyleDropButton]}>
                                <react_native_1.View style={[success ? styles.buttonSuccessDivider : styles.buttonDivider]}/>
                                <react_native_1.View style={[isButtonSizeLarge ? styles.dropDownLargeButtonArrowContain : styles.dropDownMediumButtonArrowContain]}>
                                    <Icon_1.default medium={isButtonSizeLarge} small={!isButtonSizeLarge} src={Expensicons.DownArrow} fill={success ? theme.buttonSuccessText : theme.icon}/>
                                </react_native_1.View>
                            </react_native_1.View>
                        </Button_1.default>)}
                </react_native_1.View>) : (<Button_1.default success={success} ref={buttonRef} pressOnEnter={pressOnEnter} isDisabled={isDisabled || !!((_d = options.at(0)) === null || _d === void 0 ? void 0 : _d.disabled)} style={[styles.w100, style]} disabledStyle={disabledStyle} isLoading={isLoading} text={selectedItem === null || selectedItem === void 0 ? void 0 : selectedItem.text} onPress={function (event) {
                var option = options.at(0);
                return option ? onPress(event, option.value) : undefined;
            }} large={buttonSize === CONST_1.default.DROPDOWN_BUTTON_SIZE.LARGE} medium={buttonSize === CONST_1.default.DROPDOWN_BUTTON_SIZE.MEDIUM} small={buttonSize === CONST_1.default.DROPDOWN_BUTTON_SIZE.SMALL} innerStyles={[innerStyleDropButton]} enterKeyEventListenerPriority={enterKeyEventListenerPriority} secondLineText={secondLineText} icon={icon}/>)}
            {(shouldAlwaysShowDropdownMenu || options.length > 1) && !!popoverAnchorPosition && (<PopoverMenu_1.default isVisible={isMenuVisible} onClose={function () {
                setIsMenuVisible(false);
                onOptionsMenuHide === null || onOptionsMenuHide === void 0 ? void 0 : onOptionsMenuHide();
            }} onModalShow={onOptionsMenuShow} onItemSelected={function (selectedSubitem, index, event) {
                onSubItemSelected === null || onSubItemSelected === void 0 ? void 0 : onSubItemSelected(selectedSubitem, index, event);
                setIsMenuVisible(false);
            }} anchorPosition={shouldUseStyleUtilityForAnchorPosition ? styles.popoverButtonDropdownMenuOffset(windowWidth) : popoverAnchorPosition} shouldShowSelectedItemCheck={shouldShowSelectedItemCheck} 
        // eslint-disable-next-line react-compiler/react-compiler
        anchorRef={nullCheckRef(dropdownAnchor)} withoutOverlay shouldUseScrollView scrollContainerStyle={!shouldUseModalPaddingStyle && isSmallScreenWidth && styles.pv4} shouldUseModalPaddingStyle={shouldUseModalPaddingStyle} anchorAlignment={anchorAlignment} headerText={menuHeaderText} menuItems={options.map(function (item, index) { return (__assign(__assign({}, item), { onSelected: item.onSelected
                    ? function () { var _a; return (_a = item.onSelected) === null || _a === void 0 ? void 0 : _a.call(item); }
                    : function () {
                        onOptionSelected === null || onOptionSelected === void 0 ? void 0 : onOptionSelected(item);
                        setSelectedItemIndex(index);
                    }, shouldCallAfterModalHide: true })); })}/>)}
        </react_native_1.View>);
}
ButtonWithDropdownMenu.displayName = 'ButtonWithDropdownMenu';
exports.default = ButtonWithDropdownMenu;
