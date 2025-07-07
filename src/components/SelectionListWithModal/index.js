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
var Expensicons_1 = require("@components/Icon/Expensicons");
var MenuItem_1 = require("@components/MenuItem");
var Modal_1 = require("@components/Modal");
var SelectionList_1 = require("@components/SelectionList");
var useLocalize_1 = require("@hooks/useLocalize");
var useMobileSelectionMode_1 = require("@hooks/useMobileSelectionMode");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var MobileSelectionMode_1 = require("@libs/actions/MobileSelectionMode");
var CONST_1 = require("@src/CONST");
function SelectionListWithModal(_a, ref) {
    var turnOnSelectionModeOnLongPress = _a.turnOnSelectionModeOnLongPress, onTurnOnSelectionMode = _a.onTurnOnSelectionMode, onLongPressRow = _a.onLongPressRow, _b = _a.isScreenFocused, isScreenFocused = _b === void 0 ? false : _b, sections = _a.sections, isSelected = _a.isSelected, selectedItemsProp = _a.selectedItems, rest = __rest(_a, ["turnOnSelectionModeOnLongPress", "onTurnOnSelectionMode", "onLongPressRow", "isScreenFocused", "sections", "isSelected", "selectedItems"]);
    var _c = (0, react_1.useState)(false), isModalVisible = _c[0], setIsModalVisible = _c[1];
    var _d = (0, react_1.useState)(null), longPressedItem = _d[0], setLongPressedItem = _d[1];
    var translate = (0, useLocalize_1.default)().translate;
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout here because there is a race condition that causes shouldUseNarrowLayout to change indefinitely in this component
    // See https://github.com/Expensify/App/issues/48675 for more details
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var isSmallScreenWidth = (0, useResponsiveLayout_1.default)().isSmallScreenWidth;
    var isFocused = (0, native_1.useIsFocused)();
    var selectionMode = (0, useMobileSelectionMode_1.default)().selectionMode;
    // Check if selection should be on when the modal is opened
    var wasSelectionOnRef = (0, react_1.useRef)(false);
    // Keep track of the number of selected items to determine if we should turn off selection mode
    var selectionRef = (0, react_1.useRef)(0);
    (0, react_1.useEffect)(function () {
        // We can access 0 index safely as we are not displaying multiple sections in table view
        var selectedItems = selectedItemsProp !== null && selectedItemsProp !== void 0 ? selectedItemsProp : sections[0].data.filter(function (item) {
            if (isSelected) {
                return isSelected(item);
            }
            return !!item.isSelected;
        });
        selectionRef.current = selectedItems.length;
        if (!isSmallScreenWidth) {
            if (selectedItems.length === 0) {
                (0, MobileSelectionMode_1.turnOffMobileSelectionMode)();
            }
            return;
        }
        if (!isFocused) {
            return;
        }
        if (!wasSelectionOnRef.current && selectedItems.length > 0) {
            wasSelectionOnRef.current = true;
        }
        if (selectedItems.length > 0 && !(selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled)) {
            (0, MobileSelectionMode_1.turnOnMobileSelectionMode)();
        }
        else if (selectedItems.length === 0 && (selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled) && !wasSelectionOnRef.current) {
            (0, MobileSelectionMode_1.turnOffMobileSelectionMode)();
        }
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [sections, selectedItemsProp, selectionMode, isSmallScreenWidth, isSelected, isFocused]);
    (0, react_1.useEffect)(function () { return function () {
        if (selectionRef.current !== 0) {
            return;
        }
        (0, MobileSelectionMode_1.turnOffMobileSelectionMode)();
    }; }, []);
    var handleLongPressRow = function (item) {
        var _a;
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (!turnOnSelectionModeOnLongPress || !isSmallScreenWidth || (item === null || item === void 0 ? void 0 : item.isDisabled) || (item === null || item === void 0 ? void 0 : item.isDisabledCheckbox) || (!isFocused && !isScreenFocused)) {
            return;
        }
        if (isSmallScreenWidth && (selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled)) {
            (_a = rest === null || rest === void 0 ? void 0 : rest.onCheckboxPress) === null || _a === void 0 ? void 0 : _a.call(rest, item);
            return;
        }
        setLongPressedItem(item);
        setIsModalVisible(true);
        if (onLongPressRow) {
            onLongPressRow(item);
        }
    };
    var turnOnSelectionMode = function () {
        (0, MobileSelectionMode_1.turnOnMobileSelectionMode)();
        setIsModalVisible(false);
        if (onTurnOnSelectionMode) {
            onTurnOnSelectionMode(longPressedItem);
        }
    };
    return (<>
            <SelectionList_1.default ref={ref} sections={sections} selectedItems={selectedItemsProp} onLongPressRow={handleLongPressRow} isScreenFocused={isScreenFocused} isSmallScreenWidth={isSmallScreenWidth} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...rest}/>
            <Modal_1.default isVisible={isModalVisible} type={CONST_1.default.MODAL.MODAL_TYPE.BOTTOM_DOCKED} onClose={function () { return setIsModalVisible(false); }} shouldPreventScrollOnFocus>
                <MenuItem_1.default title={translate('common.select')} icon={Expensicons_1.CheckSquare} onPress={turnOnSelectionMode} pressableTestID={CONST_1.default.SELECTION_LIST_WITH_MODAL_TEST_ID}/>
            </Modal_1.default>
        </>);
}
exports.default = (0, react_1.forwardRef)(SelectionListWithModal);
