"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var BaseListItem_1 = require("@components/SelectionList/BaseListItem");
var TransactionItemRow_1 = require("@components/TransactionItemRow");
var useAnimatedHighlightStyle_1 = require("@hooks/useAnimatedHighlightStyle");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
function UnreportedExpenseListItem(_a) {
    var _b;
    var item = _a.item, isFocused = _a.isFocused, showTooltip = _a.showTooltip, isDisabled = _a.isDisabled, canSelectMultiple = _a.canSelectMultiple, onFocus = _a.onFocus, shouldSyncFocus = _a.shouldSyncFocus, onSelectRow = _a.onSelectRow;
    var styles = (0, useThemeStyles_1.default)();
    var transactionItem = item;
    var _c = (0, react_1.useState)(false), isSelected = _c[0], setIsSelected = _c[1];
    var theme = (0, useTheme_1.default)();
    var backgroundColor = isSelected ? styles.buttonDefaultBG : styles.highlightBG;
    var hoveredTransactionStyles = (0, useAnimatedHighlightStyle_1.default)({
        borderRadius: variables_1.default.componentBorderRadius,
        shouldHighlight: (_b = item === null || item === void 0 ? void 0 : item.shouldAnimateInHighlight) !== null && _b !== void 0 ? _b : false,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: theme.highlightBG,
    });
    return (<BaseListItem_1.default item={item} isFocused={isFocused} isDisabled={isDisabled} showTooltip={showTooltip} canSelectMultiple={canSelectMultiple} pendingAction={item.pendingAction} keyForList={item.keyForList} onFocus={onFocus} shouldSyncFocus={shouldSyncFocus} pressableWrapperStyle={[hoveredTransactionStyles, backgroundColor]} onSelectRow={function () {
            onSelectRow(item);
            setIsSelected(function (val) { return !val; });
        }} containerStyle={[styles.p3, styles.mbn4, styles.expenseWidgetRadius]} hoverStyle={[styles.borderRadiusComponentNormal]}>
            <react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]}>
                <TransactionItemRow_1.default transactionItem={transactionItem} shouldUseNarrowLayout isSelected={isSelected} shouldShowTooltip={false} dateColumnSize={CONST_1.default.SEARCH.TABLE_COLUMN_SIZES.NORMAL} amountColumnSize={CONST_1.default.SEARCH.TABLE_COLUMN_SIZES.NORMAL} taxAmountColumnSize={CONST_1.default.SEARCH.TABLE_COLUMN_SIZES.NORMAL} onCheckboxPress={function () {
            onSelectRow(item);
            setIsSelected(function (val) { return !val; });
        }} shouldShowCheckbox/>
            </react_native_1.View>
        </BaseListItem_1.default>);
}
UnreportedExpenseListItem.displayName = 'UnreportedExpenseListItem';
exports.default = UnreportedExpenseListItem;
