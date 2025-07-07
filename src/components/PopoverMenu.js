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
/* eslint-disable react/jsx-props-no-spreading */
var fast_equals_1 = require("fast-equals");
var react_1 = require("react");
var react_native_1 = require("react-native");
var useArrowKeyFocusManager_1 = require("@hooks/useArrowKeyFocusManager");
var useKeyboardShortcut_1 = require("@hooks/useKeyboardShortcut");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useWindowDimensions_1 = require("@hooks/useWindowDimensions");
var Browser_1 = require("@libs/Browser");
var getPlatform_1 = require("@libs/getPlatform");
var Modal_1 = require("@userActions/Modal");
var CONST_1 = require("@src/CONST");
var FocusableMenuItem_1 = require("./FocusableMenuItem");
var FocusTrapForModal_1 = require("./FocusTrap/FocusTrapForModal");
var Expensicons = require("./Icon/Expensicons");
var MenuItem_1 = require("./MenuItem");
var OfflineWithFeedback_1 = require("./OfflineWithFeedback");
var PopoverWithMeasuredContent_1 = require("./PopoverWithMeasuredContent");
var ScrollView_1 = require("./ScrollView");
var Text_1 = require("./Text");
var renderWithConditionalWrapper = function (shouldUseScrollView, contentContainerStyle, children) {
    if (shouldUseScrollView) {
        return <ScrollView_1.default contentContainerStyle={contentContainerStyle}>{children}</ScrollView_1.default>;
    }
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};
function getSelectedItemIndex(menuItems) {
    return menuItems.findIndex(function (option) { return option.isSelected; });
}
function PopoverMenu(_a) {
    var menuItems = _a.menuItems, onItemSelected = _a.onItemSelected, isVisible = _a.isVisible, anchorPosition = _a.anchorPosition, anchorRef = _a.anchorRef, onClose = _a.onClose, onLayout = _a.onLayout, onModalShow = _a.onModalShow, onModalHide = _a.onModalHide, headerText = _a.headerText, fromSidebarMediumScreen = _a.fromSidebarMediumScreen, _b = _a.anchorAlignment, anchorAlignment = _b === void 0 ? {
        horizontal: CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
        vertical: CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
    } : _b, _c = _a.animationIn, animationIn = _c === void 0 ? 'fadeIn' : _c, animationInDelay = _a.animationInDelay, _d = _a.animationOut, animationOut = _d === void 0 ? 'fadeOut' : _d, _e = _a.animationInTiming, animationInTiming = _e === void 0 ? CONST_1.default.ANIMATED_TRANSITION : _e, animationOutTiming = _a.animationOutTiming, _f = _a.disableAnimation, disableAnimation = _f === void 0 ? true : _f, _g = _a.withoutOverlay, withoutOverlay = _g === void 0 ? false : _g, _h = _a.shouldSetModalVisibility, shouldSetModalVisibility = _h === void 0 ? true : _h, shouldEnableNewFocusManagement = _a.shouldEnableNewFocusManagement, restoreFocusType = _a.restoreFocusType, _j = _a.shouldShowSelectedItemCheck, shouldShowSelectedItemCheck = _j === void 0 ? false : _j, containerStyles = _a.containerStyles, headerStyles = _a.headerStyles, innerContainerStyle = _a.innerContainerStyle, scrollContainerStyle = _a.scrollContainerStyle, _k = _a.shouldUseScrollView, shouldUseScrollView = _k === void 0 ? false : _k, _l = _a.shouldEnableMaxHeight, shouldEnableMaxHeight = _l === void 0 ? true : _l, _m = _a.shouldUpdateFocusedIndex, shouldUpdateFocusedIndex = _m === void 0 ? true : _m, shouldUseModalPaddingStyle = _a.shouldUseModalPaddingStyle, _o = _a.shouldAvoidSafariException, shouldAvoidSafariException = _o === void 0 ? false : _o, testID = _a.testID;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to apply correct popover styles
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var isSmallScreenWidth = (0, useResponsiveLayout_1.default)().isSmallScreenWidth;
    var _p = (0, react_1.useState)(menuItems), currentMenuItems = _p[0], setCurrentMenuItems = _p[1];
    var currentMenuItemsFocusedIndex = getSelectedItemIndex(currentMenuItems);
    var _q = (0, react_1.useState)(CONST_1.default.EMPTY_ARRAY), enteredSubMenuIndexes = _q[0], setEnteredSubMenuIndexes = _q[1];
    var windowHeight = (0, useWindowDimensions_1.default)().windowHeight;
    var platform = (0, getPlatform_1.default)();
    var isWebOrDesktop = platform === CONST_1.default.PLATFORM.WEB || platform === CONST_1.default.PLATFORM.DESKTOP;
    var _r = (0, useArrowKeyFocusManager_1.default)({ initialFocusedIndex: currentMenuItemsFocusedIndex, maxIndex: currentMenuItems.length - 1, isActive: isVisible }), focusedIndex = _r[0], setFocusedIndex = _r[1];
    var selectItem = function (index, event) {
        var _a;
        var selectedItem = currentMenuItems.at(index);
        if (!selectedItem) {
            return;
        }
        if (selectedItem === null || selectedItem === void 0 ? void 0 : selectedItem.subMenuItems) {
            setCurrentMenuItems(__spreadArray([], selectedItem.subMenuItems, true));
            setEnteredSubMenuIndexes(__spreadArray(__spreadArray([], enteredSubMenuIndexes, true), [index], false));
            var selectedSubMenuItemIndex = selectedItem === null || selectedItem === void 0 ? void 0 : selectedItem.subMenuItems.findIndex(function (option) { return option.isSelected; });
            setFocusedIndex(selectedSubMenuItemIndex);
        }
        else if (selectedItem.shouldCallAfterModalHide && (!(0, Browser_1.isSafari)() || shouldAvoidSafariException)) {
            onItemSelected === null || onItemSelected === void 0 ? void 0 : onItemSelected(selectedItem, index, event);
            (0, Modal_1.close)(function () {
                var _a;
                (_a = selectedItem.onSelected) === null || _a === void 0 ? void 0 : _a.call(selectedItem);
            }, undefined, selectedItem.shouldCloseAllModals);
        }
        else {
            onItemSelected === null || onItemSelected === void 0 ? void 0 : onItemSelected(selectedItem, index, event);
            (_a = selectedItem.onSelected) === null || _a === void 0 ? void 0 : _a.call(selectedItem);
        }
    };
    var getPreviousSubMenu = function () {
        var currentItems = menuItems;
        for (var i = 0; i < enteredSubMenuIndexes.length - 1; i++) {
            var nextItems = currentItems[enteredSubMenuIndexes[i]].subMenuItems;
            if (!nextItems) {
                return currentItems;
            }
            currentItems = nextItems;
        }
        return currentItems;
    };
    var renderBackButtonItem = function () {
        var previousMenuItems = getPreviousSubMenu();
        var previouslySelectedItem = previousMenuItems[enteredSubMenuIndexes[enteredSubMenuIndexes.length - 1]];
        var hasBackButtonText = !!previouslySelectedItem.backButtonText;
        return (<MenuItem_1.default key={previouslySelectedItem.text} icon={Expensicons.BackArrow} iconFill={theme.icon} style={hasBackButtonText ? styles.pv0 : undefined} title={hasBackButtonText ? previouslySelectedItem.backButtonText : previouslySelectedItem.text} titleStyle={hasBackButtonText ? styles.createMenuHeaderText : undefined} shouldShowBasicTitle={hasBackButtonText} shouldCheckActionAllowedOnPress={false} description={previouslySelectedItem.description} onPress={function () {
                setCurrentMenuItems(previousMenuItems);
                setFocusedIndex(-1);
                setEnteredSubMenuIndexes(function (prevState) { return prevState.slice(0, -1); });
            }}/>);
    };
    var renderedMenuItems = currentMenuItems.map(function (item, menuIndex) {
        var _a;
        var text = item.text, onSelected = item.onSelected, subMenuItems = item.subMenuItems, shouldCallAfterModalHide = item.shouldCallAfterModalHide, key = item.key, menuItemTestID = item.testID, menuItemProps = __rest(item, ["text", "onSelected", "subMenuItems", "shouldCallAfterModalHide", "key", "testID"]);
        return (<OfflineWithFeedback_1.default 
        // eslint-disable-next-line react/no-array-index-key
        key={key !== null && key !== void 0 ? key : "".concat(item.text, "_").concat(menuIndex)} pendingAction={item.pendingAction}>
                <FocusableMenuItem_1.default 
        // eslint-disable-next-line react/no-array-index-key
        key={key !== null && key !== void 0 ? key : "".concat(item.text, "_").concat(menuIndex)} pressableTestID={menuItemTestID !== null && menuItemTestID !== void 0 ? menuItemTestID : "PopoverMenuItem-".concat(item.text)} title={text} onPress={function (event) { return selectItem(menuIndex, event); }} focused={focusedIndex === menuIndex} shouldShowSelectedItemCheck={shouldShowSelectedItemCheck} shouldCheckActionAllowedOnPress={false} iconRight={item.rightIcon} shouldShowRightIcon={!!item.rightIcon} onFocus={function () {
                if (!shouldUpdateFocusedIndex) {
                    return;
                }
                setFocusedIndex(menuIndex);
            }} wrapperStyle={StyleUtils.getItemBackgroundColorStyle(!!item.isSelected, focusedIndex === menuIndex, (_a = item.disabled) !== null && _a !== void 0 ? _a : false, theme.activeComponentBG, theme.hoverComponentBG)} shouldRemoveHoverBackground={item.isSelected} titleStyle={react_native_1.StyleSheet.flatten([styles.flex1, item.titleStyle])} 
        // Spread other props dynamically
        {...menuItemProps}/>
            </OfflineWithFeedback_1.default>);
    });
    var renderHeaderText = function () {
        if (!headerText || enteredSubMenuIndexes.length !== 0) {
            return;
        }
        return <Text_1.default style={[styles.createMenuHeaderText, styles.ph5, styles.pv3, headerStyles]}>{headerText}</Text_1.default>;
    };
    (0, useKeyboardShortcut_1.default)(CONST_1.default.KEYBOARD_SHORTCUTS.ENTER, function () {
        if (focusedIndex === -1) {
            return;
        }
        selectItem(focusedIndex);
        setFocusedIndex(-1); // Reset the focusedIndex on selecting any menu
    }, { isActive: isVisible });
    var keyboardShortcutSpaceCallback = (0, react_1.useCallback)(function (e) {
        if (shouldUseScrollView) {
            return;
        }
        e === null || e === void 0 ? void 0 : e.preventDefault();
    }, [shouldUseScrollView]);
    // On web and desktop, pressing the space bar after interacting with the parent view
    // can cause the parent view to scroll when the space bar is pressed.
    (0, useKeyboardShortcut_1.default)(CONST_1.default.KEYBOARD_SHORTCUTS.SPACE, keyboardShortcutSpaceCallback, { isActive: isWebOrDesktop && isVisible, shouldPreventDefault: false });
    var handleModalHide = function () {
        onModalHide === null || onModalHide === void 0 ? void 0 : onModalHide();
        setFocusedIndex(currentMenuItemsFocusedIndex);
    };
    // When the menu items are changed, we want to reset the sub-menu to make sure
    // we are not accessing the wrong sub-menu parent or possibly undefined when rendering the back button.
    // We use useLayoutEffect so the reset happens before the repaint
    (0, react_1.useLayoutEffect)(function () {
        if (menuItems.length === 0) {
            return;
        }
        setEnteredSubMenuIndexes(CONST_1.default.EMPTY_ARRAY);
        setCurrentMenuItems(menuItems);
        // Update the focused item to match the selected item, but only when the popover is not visible.
        // This ensures that if the popover is visible, highlight from the keyboard navigation is not overridden
        // by external updates.
        if (isVisible) {
            return;
        }
        setFocusedIndex(getSelectedItemIndex(menuItems));
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [menuItems, setFocusedIndex]);
    var menuContainerStyle = (0, react_1.useMemo)(function () {
        if (isSmallScreenWidth) {
            return shouldEnableMaxHeight ? { maxHeight: windowHeight - 250 } : {};
        }
        return styles.createMenuContainer;
    }, [isSmallScreenWidth, shouldEnableMaxHeight, windowHeight, styles.createMenuContainer]);
    return (<PopoverWithMeasuredContent_1.default anchorPosition={anchorPosition} anchorRef={anchorRef} anchorAlignment={anchorAlignment} onClose={function () {
            setCurrentMenuItems(menuItems);
            setEnteredSubMenuIndexes(CONST_1.default.EMPTY_ARRAY);
            onClose();
        }} isVisible={isVisible} onModalHide={handleModalHide} onModalShow={onModalShow} animationIn={animationIn} animationOut={animationOut} animationInDelay={animationInDelay} animationInTiming={animationInTiming} animationOutTiming={animationOutTiming} disableAnimation={disableAnimation} fromSidebarMediumScreen={fromSidebarMediumScreen} withoutOverlay={withoutOverlay} shouldSetModalVisibility={shouldSetModalVisibility} shouldEnableNewFocusManagement={shouldEnableNewFocusManagement} useNativeDriver restoreFocusType={restoreFocusType} innerContainerStyle={innerContainerStyle} shouldUseModalPaddingStyle={shouldUseModalPaddingStyle} testID={testID}>
            <FocusTrapForModal_1.default active={isVisible}>
                <react_native_1.View onLayout={onLayout} style={[menuContainerStyle, containerStyles]}>
                    {renderHeaderText()}
                    {enteredSubMenuIndexes.length > 0 && renderBackButtonItem()}
                    {renderWithConditionalWrapper(shouldUseScrollView, scrollContainerStyle, renderedMenuItems)}
                </react_native_1.View>
            </FocusTrapForModal_1.default>
        </PopoverWithMeasuredContent_1.default>);
}
PopoverMenu.displayName = 'PopoverMenu';
exports.default = react_1.default.memo(PopoverMenu, function (prevProps, nextProps) {
    return (0, fast_equals_1.deepEqual)(prevProps.menuItems, nextProps.menuItems) &&
        prevProps.isVisible === nextProps.isVisible &&
        (0, fast_equals_1.deepEqual)(prevProps.anchorPosition, nextProps.anchorPosition) &&
        prevProps.anchorRef === nextProps.anchorRef &&
        prevProps.headerText === nextProps.headerText &&
        prevProps.fromSidebarMediumScreen === nextProps.fromSidebarMediumScreen &&
        (0, fast_equals_1.deepEqual)(prevProps.anchorAlignment, nextProps.anchorAlignment) &&
        prevProps.animationIn === nextProps.animationIn &&
        prevProps.animationOut === nextProps.animationOut &&
        prevProps.animationInTiming === nextProps.animationInTiming &&
        prevProps.disableAnimation === nextProps.disableAnimation &&
        prevProps.withoutOverlay === nextProps.withoutOverlay &&
        prevProps.shouldSetModalVisibility === nextProps.shouldSetModalVisibility;
});
