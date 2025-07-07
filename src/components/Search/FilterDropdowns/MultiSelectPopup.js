"use strict";
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
var Button_1 = require("@components/Button");
var SelectionList_1 = require("@components/SelectionList");
var MultiSelectListItem_1 = require("@components/SelectionList/MultiSelectListItem");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function MultiSelectPopup(_a) {
    var label = _a.label, value = _a.value, items = _a.items, closeOverlay = _a.closeOverlay, onChange = _a.onChange;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var isSmallScreenWidth = (0, useResponsiveLayout_1.default)().isSmallScreenWidth;
    var _b = (0, react_1.useState)(value), selectedItems = _b[0], setSelectedItems = _b[1];
    var listData = (0, react_1.useMemo)(function () {
        return items.map(function (item) { return ({
            text: translate(item.translation),
            keyForList: item.value,
            isSelected: !!selectedItems.find(function (i) { return i.value === item.value; }),
        }); });
    }, [items, selectedItems, translate]);
    var updateSelectedItems = (0, react_1.useCallback)(function (item) {
        if (item.isSelected) {
            setSelectedItems(selectedItems.filter(function (i) { return i.value !== item.keyForList; }));
            return;
        }
        var newItem = items.find(function (i) { return i.value === item.keyForList; });
        if (newItem) {
            setSelectedItems(__spreadArray(__spreadArray([], selectedItems, true), [newItem], false));
        }
    }, [items, selectedItems]);
    var applyChanges = (0, react_1.useCallback)(function () {
        onChange(selectedItems);
        closeOverlay();
    }, [closeOverlay, onChange, selectedItems]);
    var resetChanges = (0, react_1.useCallback)(function () {
        onChange([]);
        closeOverlay();
    }, [closeOverlay, onChange]);
    return (<react_native_1.View style={[!isSmallScreenWidth && styles.pv4, styles.gap2]}>
            {isSmallScreenWidth && <Text_1.default style={[styles.textLabel, styles.textSupporting, styles.ph5, styles.pv1]}>{label}</Text_1.default>}

            <react_native_1.View style={[styles.getSelectionListPopoverHeight(items.length)]}>
                <SelectionList_1.default shouldSingleExecuteRowSelect sections={[{ data: listData }]} ListItem={MultiSelectListItem_1.default} onSelectRow={updateSelectedItems}/>
            </react_native_1.View>

            <react_native_1.View style={[styles.flexRow, styles.gap2, styles.ph5]}>
                <Button_1.default medium style={[styles.flex1]} text={translate('common.reset')} onPress={resetChanges}/>
                <Button_1.default success medium style={[styles.flex1]} text={translate('common.apply')} onPress={applyChanges}/>
            </react_native_1.View>
        </react_native_1.View>);
}
MultiSelectPopup.displayName = 'MultiSelectPopup';
exports.default = MultiSelectPopup;
