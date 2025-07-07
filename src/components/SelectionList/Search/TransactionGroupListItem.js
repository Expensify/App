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
var BaseListItem_1 = require("@components/SelectionList/BaseListItem");
var Text_1 = require("@components/Text");
var TransactionItemRow_1 = require("@components/TransactionItemRow");
var useAnimatedHighlightStyle_1 = require("@hooks/useAnimatedHighlightStyle");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var MoneyRequestReportUtils_1 = require("@libs/MoneyRequestReportUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var variables_1 = require("@styles/variables");
var TransactionThreadNavigation_1 = require("@userActions/TransactionThreadNavigation");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var CardListItemHeader_1 = require("./CardListItemHeader");
var MemberListItemHeader_1 = require("./MemberListItemHeader");
var ReportListItemHeader_1 = require("./ReportListItemHeader");
function TransactionGroupListItem(_a) {
    var _b;
    var item = _a.item, isFocused = _a.isFocused, showTooltip = _a.showTooltip, isDisabled = _a.isDisabled, canSelectMultiple = _a.canSelectMultiple, onCheckboxPress = _a.onCheckboxPress, onSelectRow = _a.onSelectRow, onFocus = _a.onFocus, onLongPressRow = _a.onLongPressRow, shouldSyncFocus = _a.shouldSyncFocus, groupBy = _a.groupBy;
    var groupItem = item;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var policies = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.POLICY, { allowStaleData: true, initialValue: {}, canBeMissing: true })[0];
    var policy = policies === null || policies === void 0 ? void 0 : policies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(groupItem === null || groupItem === void 0 ? void 0 : groupItem.policyID)];
    var isEmpty = groupItem.transactions.length === 0;
    var isDisabledOrEmpty = isEmpty || isDisabled;
    var isLargeScreenWidth = (0, useResponsiveLayout_1.default)().isLargeScreenWidth;
    var _c = (0, react_1.useMemo)(function () {
        var isAmountColumnWide = groupItem.transactions.some(function (transaction) { return transaction.isAmountColumnWide; });
        var isTaxAmountColumnWide = groupItem.transactions.some(function (transaction) { return transaction.isTaxAmountColumnWide; });
        var shouldShowYearForSomeTransaction = groupItem.transactions.some(function (transaction) { return transaction.shouldShowYear; });
        return {
            amountColumnSize: isAmountColumnWide ? CONST_1.default.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST_1.default.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
            taxAmountColumnSize: isTaxAmountColumnWide ? CONST_1.default.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST_1.default.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
            dateColumnSize: shouldShowYearForSomeTransaction ? CONST_1.default.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST_1.default.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
        };
    }, [groupItem.transactions]), amountColumnSize = _c.amountColumnSize, dateColumnSize = _c.dateColumnSize, taxAmountColumnSize = _c.taxAmountColumnSize;
    var animatedHighlightStyle = (0, useAnimatedHighlightStyle_1.default)({
        borderRadius: variables_1.default.componentBorderRadius,
        shouldHighlight: (_b = item === null || item === void 0 ? void 0 : item.shouldAnimateInHighlight) !== null && _b !== void 0 ? _b : false,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: theme.highlightBG,
    });
    var listItemPressableStyle = [
        styles.selectionListPressableItemWrapper,
        styles.pv2,
        styles.ph0,
        styles.overflowHidden,
        // Removing background style because they are added to the parent OpacityView via animatedHighlightStyle
        styles.bgTransparent,
        item.isSelected && styles.activeComponentBG,
        styles.mh0,
    ];
    var openReportInRHP = function (transactionItem) {
        var backTo = Navigation_1.default.getActiveRoute();
        var reportID = (0, MoneyRequestReportUtils_1.getReportIDForTransaction)(transactionItem);
        var siblingTransactionThreadIDs = groupItem.transactions.map(MoneyRequestReportUtils_1.getReportIDForTransaction);
        // When opening the transaction thread in RHP we need to find every other ID for the rest of transactions
        // to display prev/next arrows in RHP for navigation
        (0, TransactionThreadNavigation_1.setActiveTransactionThreadIDs)(siblingTransactionThreadIDs).then(function () {
            Navigation_1.default.navigate(ROUTES_1.default.SEARCH_REPORT.getRoute({ reportID: reportID, backTo: backTo }));
        });
    };
    var sampleTransaction = groupItem.transactions.at(0);
    var COLUMNS = CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS;
    var columns = __spreadArray(__spreadArray(__spreadArray(__spreadArray([
        COLUMNS.RECEIPT,
        COLUMNS.TYPE,
        COLUMNS.DATE,
        COLUMNS.MERCHANT,
        COLUMNS.FROM,
        COLUMNS.TO
    ], ((sampleTransaction === null || sampleTransaction === void 0 ? void 0 : sampleTransaction.shouldShowCategory) ? [COLUMNS.CATEGORY] : []), true), ((sampleTransaction === null || sampleTransaction === void 0 ? void 0 : sampleTransaction.shouldShowTag) ? [COLUMNS.TAG] : []), true), ((sampleTransaction === null || sampleTransaction === void 0 ? void 0 : sampleTransaction.shouldShowTax) ? [COLUMNS.TAX] : []), true), [
        COLUMNS.TOTAL_AMOUNT,
        COLUMNS.ACTION,
    ], false);
    var getHeader = function (isHovered) {
        var _a;
        var headers = (_a = {},
            _a[CONST_1.default.SEARCH.GROUP_BY.REPORTS] = (<ReportListItemHeader_1.default report={groupItem} policy={policy} onSelectRow={onSelectRow} onCheckboxPress={onCheckboxPress} isDisabled={isDisabledOrEmpty} isHovered={isHovered} isFocused={isFocused} canSelectMultiple={canSelectMultiple}/>),
            _a[CONST_1.default.SEARCH.GROUP_BY.MEMBERS] = (<MemberListItemHeader_1.default member={groupItem} onCheckboxPress={onCheckboxPress} isDisabled={isDisabledOrEmpty} canSelectMultiple={canSelectMultiple}/>),
            _a[CONST_1.default.SEARCH.GROUP_BY.CARDS] = (<CardListItemHeader_1.default card={groupItem} onCheckboxPress={onCheckboxPress} isDisabled={isDisabledOrEmpty} isHovered={isHovered} isFocused={isFocused} canSelectMultiple={canSelectMultiple}/>),
            _a);
        if (!groupBy) {
            return null;
        }
        return headers[groupBy];
    };
    return (<BaseListItem_1.default item={item} pressableStyle={listItemPressableStyle} wrapperStyle={[styles.flexRow, styles.flex1, styles.justifyContentBetween, styles.userSelectNone, styles.alignItemsCenter]} containerStyle={[styles.mb2]} isFocused={isFocused} isDisabled={isDisabled} showTooltip={showTooltip} canSelectMultiple={canSelectMultiple} onSelectRow={onSelectRow} onLongPressRow={onLongPressRow} pendingAction={item.pendingAction} keyForList={item.keyForList} onFocus={onFocus} shouldShowBlueBorderOnFocus shouldSyncFocus={shouldSyncFocus} hoverStyle={item.isSelected && styles.activeComponentBG} pressableWrapperStyle={[styles.mh5, animatedHighlightStyle]}>
            {function (hovered) { return (<react_native_1.View style={[styles.flex1]}>
                    {getHeader(hovered)}
                    {isEmpty ? (<react_native_1.View style={[styles.alignItemsCenter, styles.justifyContentCenter, styles.mnh13]}>
                            <Text_1.default style={[styles.textLabelSupporting]} numberOfLines={1}>
                                {translate('search.moneyRequestReport.emptyStateTitle')}
                            </Text_1.default>
                        </react_native_1.View>) : (groupItem.transactions.map(function (transaction) { return (<react_native_1.View key={transaction.transactionID}>
                                <TransactionItemRow_1.default transactionItem={transaction} isSelected={!!transaction.isSelected} dateColumnSize={dateColumnSize} amountColumnSize={amountColumnSize} taxAmountColumnSize={taxAmountColumnSize} shouldShowTooltip={showTooltip} shouldUseNarrowLayout={!isLargeScreenWidth} shouldShowCheckbox={!!canSelectMultiple} onCheckboxPress={function () { return onCheckboxPress === null || onCheckboxPress === void 0 ? void 0 : onCheckboxPress(transaction); }} columns={columns} onButtonPress={function () {
                    openReportInRHP(transaction);
                }} isParentHovered={hovered} columnWrapperStyles={[styles.ph3, styles.pv1Half]} isReportItemChild isInSingleTransactionReport={groupItem.transactions.length === 1}/>
                            </react_native_1.View>); }))}
                </react_native_1.View>); }}
        </BaseListItem_1.default>);
}
TransactionGroupListItem.displayName = 'TransactionGroupListItem';
exports.default = TransactionGroupListItem;
