"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SortableHeaderText;
var react_1 = require("react");
var react_native_1 = require("react-native");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var PressableWithFeedback_1 = require("@components/Pressable/PressableWithFeedback");
var Text_1 = require("@components/Text");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
function SortableHeaderText(_a) {
    var text = _a.text, sortOrder = _a.sortOrder, isActive = _a.isActive, textStyle = _a.textStyle, containerStyle = _a.containerStyle, _b = _a.isSortable, isSortable = _b === void 0 ? true : _b, onPress = _a.onPress;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    if (!isSortable) {
        return (<react_native_1.View style={containerStyle}>
                <react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}>
                    <Text_1.default numberOfLines={1} style={[styles.textMicroSupporting, textStyle]}>
                        {text}
                    </Text_1.default>
                </react_native_1.View>
            </react_native_1.View>);
    }
    var icon = sortOrder === CONST_1.default.SEARCH.SORT_ORDER.ASC ? Expensicons.ArrowUpLong : Expensicons.ArrowDownLong;
    var displayIcon = isActive;
    var activeColumnStyle = isSortable && isActive && styles.searchTableHeaderActive;
    var nextSortOrder = isActive && sortOrder === CONST_1.default.SEARCH.SORT_ORDER.DESC ? CONST_1.default.SEARCH.SORT_ORDER.ASC : CONST_1.default.SEARCH.SORT_ORDER.DESC;
    return (<react_native_1.View style={containerStyle}>
            <PressableWithFeedback_1.default onPress={function () { return onPress(nextSortOrder); }} role={CONST_1.default.ROLE.BUTTON} accessibilityLabel={CONST_1.default.ROLE.BUTTON} accessible disabled={!isSortable}>
                <react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}>
                    <Text_1.default numberOfLines={1} style={[styles.textMicroSupporting, activeColumnStyle, textStyle]}>
                        {text}
                    </Text_1.default>
                    {displayIcon && (<Icon_1.default src={icon} fill={theme.icon} height={12} width={12}/>)}
                </react_native_1.View>
            </PressableWithFeedback_1.default>
        </react_native_1.View>);
}
