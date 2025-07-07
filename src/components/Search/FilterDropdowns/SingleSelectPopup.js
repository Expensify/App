"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var SelectionList_1 = require("@components/SelectionList");
var SingleSelectListItem_1 = require("@components/SelectionList/SingleSelectListItem");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function SingleSelectPopup(_a) {
    var label = _a.label, value = _a.value, items = _a.items, closeOverlay = _a.closeOverlay, onChange = _a.onChange;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var isSmallScreenWidth = (0, useResponsiveLayout_1.default)().isSmallScreenWidth;
    var _b = (0, react_1.useState)(value), selectedItem = _b[0], setSelectedItem = _b[1];
    var listData = (0, react_1.useMemo)(function () {
        return items.map(function (item) { return ({
            text: translate(item.translation),
            keyForList: item.value,
            isSelected: item.value === (selectedItem === null || selectedItem === void 0 ? void 0 : selectedItem.value),
        }); });
    }, [items, translate, selectedItem]);
    var updateSelectedItem = (0, react_1.useCallback)(function (item) {
        var _a;
        var newItem = (_a = items.find(function (i) { return i.value === item.keyForList; })) !== null && _a !== void 0 ? _a : null;
        setSelectedItem(newItem);
    }, [items]);
    var applyChanges = (0, react_1.useCallback)(function () {
        onChange(selectedItem);
        closeOverlay();
    }, [closeOverlay, onChange, selectedItem]);
    var resetChanges = (0, react_1.useCallback)(function () {
        onChange(null);
        closeOverlay();
    }, [closeOverlay, onChange]);
    return (<react_native_1.View style={[!isSmallScreenWidth && styles.pv4, styles.gap2]}>
            {isSmallScreenWidth && <Text_1.default style={[styles.textLabel, styles.textSupporting, styles.ph5, styles.pv1]}>{label}</Text_1.default>}

            <react_native_1.View style={[styles.getSelectionListPopoverHeight(items.length)]}>
                <SelectionList_1.default shouldSingleExecuteRowSelect sections={[{ data: listData }]} ListItem={SingleSelectListItem_1.default} onSelectRow={updateSelectedItem}/>
            </react_native_1.View>
            <react_native_1.View style={[styles.flexRow, styles.gap2, styles.ph5]}>
                <Button_1.default medium style={[styles.flex1]} text={translate('common.reset')} onPress={resetChanges}/>
                <Button_1.default success medium style={[styles.flex1]} text={translate('common.apply')} onPress={applyChanges}/>
            </react_native_1.View>
        </react_native_1.View>);
}
SingleSelectPopup.displayName = 'SingleSelectPopup';
exports.default = SingleSelectPopup;
