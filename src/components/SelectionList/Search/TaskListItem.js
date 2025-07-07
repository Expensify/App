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
var BaseListItem_1 = require("@components/SelectionList/BaseListItem");
var useAnimatedHighlightStyle_1 = require("@hooks/useAnimatedHighlightStyle");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
var TaskListItemRow_1 = require("./TaskListItemRow");
function TaskListItem(_a) {
    var _b;
    var item = _a.item, isFocused = _a.isFocused, showTooltip = _a.showTooltip, isDisabled = _a.isDisabled, canSelectMultiple = _a.canSelectMultiple, onSelectRow = _a.onSelectRow, onFocus = _a.onFocus, onLongPressRow = _a.onLongPressRow, shouldSyncFocus = _a.shouldSyncFocus;
    var taskItem = item;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var isLargeScreenWidth = (0, useResponsiveLayout_1.default)().isLargeScreenWidth;
    var listItemPressableStyle = [
        styles.selectionListPressableItemWrapper,
        styles.pv3,
        styles.ph3,
        // Removing background style because they are added to the parent OpacityView via animatedHighlightStyle
        styles.bgTransparent,
        item.isSelected && styles.activeComponentBG,
        styles.mh0,
    ];
    var listItemWrapperStyle = [
        styles.flex1,
        styles.userSelectNone,
        isLargeScreenWidth ? __assign(__assign(__assign({}, styles.flexRow), styles.justifyContentBetween), styles.alignItemsCenter) : __assign(__assign({}, styles.flexColumn), styles.alignItemsStretch),
    ];
    var animatedHighlightStyle = (0, useAnimatedHighlightStyle_1.default)({
        borderRadius: variables_1.default.componentBorderRadius,
        shouldHighlight: (_b = item === null || item === void 0 ? void 0 : item.shouldAnimateInHighlight) !== null && _b !== void 0 ? _b : false,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: theme.highlightBG,
    });
    return (<BaseListItem_1.default item={item} pressableStyle={listItemPressableStyle} wrapperStyle={listItemWrapperStyle} containerStyle={[styles.mb2]} isFocused={isFocused} isDisabled={isDisabled} showTooltip={showTooltip} canSelectMultiple={canSelectMultiple} onSelectRow={onSelectRow} pendingAction={item.pendingAction} keyForList={item.keyForList} onFocus={onFocus} onLongPressRow={onLongPressRow} shouldSyncFocus={shouldSyncFocus} hoverStyle={item.isSelected && styles.activeComponentBG} pressableWrapperStyle={[styles.mh5, animatedHighlightStyle]}>
            <TaskListItemRow_1.default item={taskItem} showTooltip={showTooltip}/>
        </BaseListItem_1.default>);
}
TaskListItem.displayName = 'TaskListItem';
exports.default = TaskListItem;
