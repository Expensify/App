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
var SearchContext_1 = require("@components/Search/SearchContext");
var BaseListItem_1 = require("@components/SelectionList/BaseListItem");
var TransactionItemRow_1 = require("@components/TransactionItemRow");
var useAnimatedHighlightStyle_1 = require("@hooks/useAnimatedHighlightStyle");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Search_1 = require("@libs/actions/Search");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var UserInfoAndActionButtonRow_1 = require("./UserInfoAndActionButtonRow");
function TransactionListItem(_a) {
    var _b;
    var item = _a.item, isFocused = _a.isFocused, showTooltip = _a.showTooltip, isDisabled = _a.isDisabled, canSelectMultiple = _a.canSelectMultiple, onSelectRow = _a.onSelectRow, onCheckboxPress = _a.onCheckboxPress, onFocus = _a.onFocus, onLongPressRow = _a.onLongPressRow, shouldSyncFocus = _a.shouldSyncFocus, isLoading = _a.isLoading;
    var transactionItem = item;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var _c = (0, useResponsiveLayout_1.default)(), isLargeScreenWidth = _c.isLargeScreenWidth, shouldUseNarrowLayout = _c.shouldUseNarrowLayout;
    var currentSearchHash = (0, SearchContext_1.useSearchContext)().currentSearchHash;
    var listItemPressableStyle = [
        styles.selectionListPressableItemWrapper,
        styles.pv0,
        !isLargeScreenWidth && styles.pt3,
        styles.ph0,
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
    var _d = (0, react_1.useMemo)(function () {
        return {
            amountColumnSize: transactionItem.isAmountColumnWide ? CONST_1.default.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST_1.default.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
            taxAmountColumnSize: transactionItem.isTaxAmountColumnWide ? CONST_1.default.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST_1.default.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
            dateColumnSize: transactionItem.shouldShowYear ? CONST_1.default.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST_1.default.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
        };
    }, [transactionItem]), amountColumnSize = _d.amountColumnSize, dateColumnSize = _d.dateColumnSize, taxAmountColumnSize = _d.taxAmountColumnSize;
    var columns = (0, react_1.useMemo)(function () {
        return __spreadArray(__spreadArray(__spreadArray(__spreadArray([
            CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.RECEIPT,
            CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.TYPE,
            CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.DATE,
            CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.MERCHANT,
            CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.FROM,
            CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.TO
        ], ((transactionItem === null || transactionItem === void 0 ? void 0 : transactionItem.shouldShowCategory) ? [CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.CATEGORY] : []), true), ((transactionItem === null || transactionItem === void 0 ? void 0 : transactionItem.shouldShowTag) ? [CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.TAG] : []), true), ((transactionItem === null || transactionItem === void 0 ? void 0 : transactionItem.shouldShowTax) ? [CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.TAX] : []), true), [
            CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.TOTAL_AMOUNT,
            CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.ACTION,
        ], false);
    }, [transactionItem === null || transactionItem === void 0 ? void 0 : transactionItem.shouldShowCategory, transactionItem === null || transactionItem === void 0 ? void 0 : transactionItem.shouldShowTag, transactionItem === null || transactionItem === void 0 ? void 0 : transactionItem.shouldShowTax]);
    return (<BaseListItem_1.default item={item} pressableStyle={listItemPressableStyle} wrapperStyle={listItemWrapperStyle} containerStyle={[styles.mb2]} isFocused={isFocused} isDisabled={isDisabled} showTooltip={showTooltip} canSelectMultiple={canSelectMultiple} onSelectRow={onSelectRow} pendingAction={item.pendingAction} keyForList={item.keyForList} onFocus={onFocus} onLongPressRow={onLongPressRow} shouldSyncFocus={shouldSyncFocus} hoverStyle={item.isSelected && styles.activeComponentBG} pressableWrapperStyle={[styles.mh5, animatedHighlightStyle]}>
            {function (hovered) { return (<>
                    {!isLargeScreenWidth && (<UserInfoAndActionButtonRow_1.default item={transactionItem} handleActionButtonPress={function () {
                    (0, Search_1.handleActionButtonPress)(currentSearchHash, transactionItem, function () { return onSelectRow(item); }, shouldUseNarrowLayout && !!canSelectMultiple);
                }} shouldShowUserInfo={!!(transactionItem === null || transactionItem === void 0 ? void 0 : transactionItem.from)}/>)}
                    <TransactionItemRow_1.default transactionItem={transactionItem} shouldShowTooltip={showTooltip} onButtonPress={function () {
                (0, Search_1.handleActionButtonPress)(currentSearchHash, transactionItem, function () { return onSelectRow(item); }, shouldUseNarrowLayout && !!canSelectMultiple);
            }} onCheckboxPress={function () { return onCheckboxPress === null || onCheckboxPress === void 0 ? void 0 : onCheckboxPress(item); }} shouldUseNarrowLayout={!isLargeScreenWidth} columns={columns} isParentHovered={hovered} isActionLoading={isLoading !== null && isLoading !== void 0 ? isLoading : transactionItem.isActionLoading} isSelected={!!transactionItem.isSelected} dateColumnSize={dateColumnSize} amountColumnSize={amountColumnSize} taxAmountColumnSize={taxAmountColumnSize} shouldShowCheckbox={!!canSelectMultiple}/>
                </>); }}
        </BaseListItem_1.default>);
}
TransactionListItem.displayName = 'TransactionListItem';
exports.default = TransactionListItem;
