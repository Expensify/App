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
var react_native_reanimated_1 = require("react-native-reanimated");
var Checkbox_1 = require("@components/Checkbox");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var ActionCell_1 = require("@components/SelectionList/Search/ActionCell");
var DateCell_1 = require("@components/SelectionList/Search/DateCell");
var UserInfoCell_1 = require("@components/SelectionList/Search/UserInfoCell");
var Text_1 = require("@components/Text");
var useAnimatedHighlightStyle_1 = require("@hooks/useAnimatedHighlightStyle");
var useHover_1 = require("@hooks/useHover");
var useLocalize_1 = require("@hooks/useLocalize");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CategoryUtils_1 = require("@libs/CategoryUtils");
var Parser_1 = require("@libs/Parser");
var StringUtils_1 = require("@libs/StringUtils");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var CategoryCell_1 = require("./DataCells/CategoryCell");
var ChatBubbleCell_1 = require("./DataCells/ChatBubbleCell");
var MerchantCell_1 = require("./DataCells/MerchantCell");
var ReceiptCell_1 = require("./DataCells/ReceiptCell");
var TagCell_1 = require("./DataCells/TagCell");
var TaxCell_1 = require("./DataCells/TaxCell");
var TotalCell_1 = require("./DataCells/TotalCell");
var TypeCell_1 = require("./DataCells/TypeCell");
var TransactionItemRowRBRWithOnyx_1 = require("./TransactionItemRowRBRWithOnyx");
/** If merchant name is empty or (none), then it falls back to description if screen is narrow */
function getMerchantNameWithFallback(transactionItem, translate, shouldUseNarrowLayout) {
    var _a, _b;
    var shouldShowMerchant = (_a = transactionItem.shouldShowMerchant) !== null && _a !== void 0 ? _a : true;
    var description = (0, TransactionUtils_1.getDescription)(transactionItem);
    var merchantOrDescriptionToDisplay = (_b = transactionItem === null || transactionItem === void 0 ? void 0 : transactionItem.formattedMerchant) !== null && _b !== void 0 ? _b : (0, TransactionUtils_1.getMerchant)(transactionItem);
    var merchantNameEmpty = !merchantOrDescriptionToDisplay || merchantOrDescriptionToDisplay === CONST_1.default.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT;
    if (merchantNameEmpty && shouldUseNarrowLayout) {
        merchantOrDescriptionToDisplay = Parser_1.default.htmlToText(description);
    }
    var merchant = shouldShowMerchant ? merchantOrDescriptionToDisplay : Parser_1.default.htmlToText(description);
    if ((0, TransactionUtils_1.isScanning)(transactionItem) && shouldShowMerchant) {
        merchant = translate('iou.receiptStatusTitle');
    }
    var merchantName = StringUtils_1.default.getFirstLine(merchant);
    return merchant !== CONST_1.default.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT ? merchantName : '';
}
function TransactionItemRow(_a) {
    var _b;
    var transactionItem = _a.transactionItem, shouldUseNarrowLayout = _a.shouldUseNarrowLayout, isSelected = _a.isSelected, shouldShowTooltip = _a.shouldShowTooltip, dateColumnSize = _a.dateColumnSize, amountColumnSize = _a.amountColumnSize, taxAmountColumnSize = _a.taxAmountColumnSize, onCheckboxPress = _a.onCheckboxPress, _c = _a.shouldShowCheckbox, shouldShowCheckbox = _c === void 0 ? false : _c, columns = _a.columns, _d = _a.onButtonPress, onButtonPress = _d === void 0 ? function () { } : _d, isParentHovered = _a.isParentHovered, columnWrapperStyles = _a.columnWrapperStyles, scrollToNewTransaction = _a.scrollToNewTransaction, _e = _a.isReportItemChild, isReportItemChild = _e === void 0 ? false : _e, isActionLoading = _a.isActionLoading, _f = _a.isInReportTableView, isInReportTableView = _f === void 0 ? false : _f, _g = _a.isInSingleTransactionReport, isInSingleTransactionReport = _g === void 0 ? false : _g;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var StyleUtils = (0, useStyleUtils_1.default)();
    var theme = (0, useTheme_1.default)();
    var pendingAction = (0, TransactionUtils_1.getTransactionPendingAction)(transactionItem);
    var isPendingDelete = (0, TransactionUtils_1.isTransactionPendingDelete)(transactionItem);
    var viewRef = (0, react_1.useRef)(null);
    var hasCategoryOrTag = !(0, CategoryUtils_1.isCategoryMissing)(transactionItem === null || transactionItem === void 0 ? void 0 : transactionItem.category) || !!transactionItem.tag;
    var createdAt = (0, TransactionUtils_1.getCreated)(transactionItem);
    var isDateColumnWide = dateColumnSize === CONST_1.default.SEARCH.TABLE_COLUMN_SIZES.WIDE;
    var isAmountColumnWide = amountColumnSize === CONST_1.default.SEARCH.TABLE_COLUMN_SIZES.WIDE;
    var isTaxAmountColumnWide = taxAmountColumnSize === CONST_1.default.SEARCH.TABLE_COLUMN_SIZES.WIDE;
    var animatedHighlightStyle = (0, useAnimatedHighlightStyle_1.default)({
        shouldHighlight: (_b = transactionItem.shouldBeHighlighted) !== null && _b !== void 0 ? _b : false,
        borderRadius: variables_1.default.componentBorderRadius,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: theme.highlightBG,
    });
    var _h = (0, useHover_1.default)(), hovered = _h.hovered, bindHover = _h.bind;
    var bgActiveStyles = (0, react_1.useMemo)(function () {
        if (isSelected) {
            return styles.activeComponentBG;
        }
        if (hovered || isParentHovered) {
            return styles.hoveredComponentBG;
        }
    }, [hovered, isParentHovered, isSelected, styles.activeComponentBG, styles.hoveredComponentBG]);
    var merchantOrDescriptionName = (0, react_1.useMemo)(function () { return getMerchantNameWithFallback(transactionItem, translate, shouldUseNarrowLayout); }, [shouldUseNarrowLayout, transactionItem, translate]);
    var missingFieldError = (0, react_1.useMemo)(function () {
        var hasFieldErrors = (0, TransactionUtils_1.hasMissingSmartscanFields)(transactionItem);
        if (hasFieldErrors) {
            var amountMissing = (0, TransactionUtils_1.isAmountMissing)(transactionItem);
            var merchantMissing = (0, TransactionUtils_1.isMerchantMissing)(transactionItem);
            var error = '';
            if (amountMissing && merchantMissing) {
                error = translate('violations.reviewRequired');
            }
            else if (amountMissing) {
                error = translate('iou.missingAmount');
            }
            else if (merchantMissing) {
                error = translate('iou.missingMerchant');
            }
            return error;
        }
    }, [transactionItem, translate]);
    (0, react_1.useEffect)(function () {
        var _a;
        if (!transactionItem.shouldBeHighlighted || !scrollToNewTransaction) {
            return;
        }
        (_a = viewRef === null || viewRef === void 0 ? void 0 : viewRef.current) === null || _a === void 0 ? void 0 : _a.measure(function (x, y, width, height, pageX, pageY) {
            scrollToNewTransaction === null || scrollToNewTransaction === void 0 ? void 0 : scrollToNewTransaction(pageY);
        });
    }, [scrollToNewTransaction, transactionItem.shouldBeHighlighted]);
    var columnComponent = (0, react_1.useMemo)(function () {
        var _a;
        var _b, _c, _d, _e;
        return (_a = {},
            _a[CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.TYPE] = (<react_native_1.View key={CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.TYPE} style={[StyleUtils.getReportTableColumnStyles(CONST_1.default.SEARCH.TABLE_COLUMNS.TYPE)]}>
                    <TypeCell_1.default transactionItem={transactionItem} shouldShowTooltip={shouldShowTooltip} shouldUseNarrowLayout={shouldUseNarrowLayout}/>
                </react_native_1.View>),
            _a[CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.RECEIPT] = (<react_native_1.View key={CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.RECEIPT} style={[StyleUtils.getReportTableColumnStyles(CONST_1.default.SEARCH.TABLE_COLUMNS.RECEIPT)]}>
                    <ReceiptCell_1.default transactionItem={transactionItem} isSelected={isSelected}/>
                </react_native_1.View>),
            _a[CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.TAG] = (<react_native_1.View key={CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.TAG} style={[StyleUtils.getReportTableColumnStyles(CONST_1.default.SEARCH.TABLE_COLUMNS.TAG)]}>
                    <TagCell_1.default transactionItem={transactionItem} shouldShowTooltip={shouldShowTooltip} shouldUseNarrowLayout={shouldUseNarrowLayout}/>
                </react_native_1.View>),
            _a[CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.DATE] = (<react_native_1.View key={CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.DATE} style={[StyleUtils.getReportTableColumnStyles(CONST_1.default.SEARCH.TABLE_COLUMNS.DATE, isDateColumnWide)]}>
                    <DateCell_1.default created={createdAt} showTooltip={shouldShowTooltip} isLargeScreenWidth={!shouldUseNarrowLayout}/>
                </react_native_1.View>),
            _a[CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.CATEGORY] = (<react_native_1.View key={CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.CATEGORY} style={[StyleUtils.getReportTableColumnStyles(CONST_1.default.SEARCH.TABLE_COLUMNS.CATEGORY)]}>
                    <CategoryCell_1.default transactionItem={transactionItem} shouldShowTooltip={shouldShowTooltip} shouldUseNarrowLayout={shouldUseNarrowLayout}/>
                </react_native_1.View>),
            _a[CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.ACTION] = (<react_native_1.View key={CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.ACTION} style={[StyleUtils.getReportTableColumnStyles(CONST_1.default.SEARCH.TABLE_COLUMNS.ACTION)]}>
                    {!!transactionItem.action && (<ActionCell_1.default action={transactionItem.action} isSelected={isSelected} isChildListItem={isReportItemChild} parentAction={transactionItem.parentTransactionID} goToItem={onButtonPress} isLoading={isActionLoading}/>)}
                </react_native_1.View>),
            _a[CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.MERCHANT] = (<react_native_1.View key={CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.MERCHANT} style={[StyleUtils.getReportTableColumnStyles(CONST_1.default.SEARCH.TABLE_COLUMNS.MERCHANT)]}>
                    {!!merchantOrDescriptionName && (<MerchantCell_1.default merchantOrDescription={merchantOrDescriptionName} shouldShowTooltip={shouldShowTooltip} shouldUseNarrowLayout={false}/>)}
                </react_native_1.View>),
            _a[CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.TO] = (<react_native_1.View key={CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.TO} style={[StyleUtils.getReportTableColumnStyles(CONST_1.default.SEARCH.TABLE_COLUMNS.FROM)]}>
                    {!!transactionItem.to && (<UserInfoCell_1.default accountID={transactionItem.to.accountID} avatar={transactionItem.to.avatar} displayName={(_c = (_b = transactionItem.formattedTo) !== null && _b !== void 0 ? _b : transactionItem.to.displayName) !== null && _c !== void 0 ? _c : ''}/>)}
                </react_native_1.View>),
            _a[CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.FROM] = (<react_native_1.View key={CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.FROM} style={[StyleUtils.getReportTableColumnStyles(CONST_1.default.SEARCH.TABLE_COLUMNS.FROM)]}>
                    {!!transactionItem.from && (<UserInfoCell_1.default accountID={transactionItem.from.accountID} avatar={transactionItem.from.avatar} displayName={(_e = (_d = transactionItem.formattedFrom) !== null && _d !== void 0 ? _d : transactionItem.from.displayName) !== null && _e !== void 0 ? _e : ''}/>)}
                </react_native_1.View>),
            _a[CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.COMMENTS] = (<react_native_1.View key={CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.COMMENTS} style={[StyleUtils.getReportTableColumnStyles(CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.COMMENTS)]}>
                    <ChatBubbleCell_1.default transaction={transactionItem} isInSingleTransactionReport={isInSingleTransactionReport}/>
                </react_native_1.View>),
            _a[CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.TOTAL_AMOUNT] = (<react_native_1.View key={CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.TOTAL_AMOUNT} style={[StyleUtils.getReportTableColumnStyles(CONST_1.default.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT, undefined, isAmountColumnWide)]}>
                    <TotalCell_1.default transactionItem={transactionItem} shouldShowTooltip={shouldShowTooltip} shouldUseNarrowLayout={shouldUseNarrowLayout}/>
                </react_native_1.View>),
            _a[CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.TAX] = (<react_native_1.View key={CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.TAX} style={[StyleUtils.getReportTableColumnStyles(CONST_1.default.SEARCH.TABLE_COLUMNS.TAX_AMOUNT, undefined, undefined, isTaxAmountColumnWide)]}>
                    <TaxCell_1.default transactionItem={transactionItem} shouldShowTooltip={shouldShowTooltip}/>
                </react_native_1.View>),
            _a);
    }, [
        StyleUtils,
        createdAt,
        isActionLoading,
        isReportItemChild,
        isDateColumnWide,
        isAmountColumnWide,
        isTaxAmountColumnWide,
        isInSingleTransactionReport,
        isSelected,
        merchantOrDescriptionName,
        onButtonPress,
        shouldShowTooltip,
        shouldUseNarrowLayout,
        transactionItem,
    ]);
    var safeColumnWrapperStyle = columnWrapperStyles !== null && columnWrapperStyles !== void 0 ? columnWrapperStyles : [styles.p3, styles.expenseWidgetRadius];
    return (<react_native_1.View style={[styles.flex1]} onMouseLeave={bindHover.onMouseLeave} onMouseEnter={bindHover.onMouseEnter} ref={viewRef}>
            <OfflineWithFeedback_1.default pendingAction={pendingAction}>
                {shouldUseNarrowLayout ? (<react_native_reanimated_1.default.View style={[isInReportTableView ? animatedHighlightStyle : {}]}>
                        <react_native_1.View style={[styles.expenseWidgetRadius, styles.justifyContentEvenly, styles.p3, styles.pt2, bgActiveStyles]}>
                            <react_native_1.View style={[styles.flexRow]}>
                                {shouldShowCheckbox && (<react_native_1.View style={[styles.mr3, styles.justifyContentCenter]}>
                                        <Checkbox_1.default disabled={isPendingDelete} onPress={function () {
                    onCheckboxPress(transactionItem.transactionID);
                }} accessibilityLabel={CONST_1.default.ROLE.CHECKBOX} isChecked={isSelected}/>
                                    </react_native_1.View>)}
                                <react_native_1.View style={[styles.mr3]}>
                                    <ReceiptCell_1.default transactionItem={transactionItem} isSelected={isSelected}/>
                                </react_native_1.View>
                                <react_native_1.View style={[styles.flex2, styles.flexColumn, styles.justifyContentEvenly]}>
                                    <react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.minHeight5, styles.maxHeight5]}>
                                        <DateCell_1.default created={createdAt} showTooltip={shouldShowTooltip} isLargeScreenWidth={!shouldUseNarrowLayout}/>
                                        <Text_1.default style={[styles.textMicroSupporting]}> • </Text_1.default>
                                        <TypeCell_1.default transactionItem={transactionItem} shouldShowTooltip={shouldShowTooltip} shouldUseNarrowLayout={shouldUseNarrowLayout}/>
                                        {!merchantOrDescriptionName && (<react_native_1.View style={[styles.mlAuto]}>
                                                <TotalCell_1.default transactionItem={transactionItem} shouldShowTooltip={shouldShowTooltip} shouldUseNarrowLayout={shouldUseNarrowLayout}/>
                                            </react_native_1.View>)}
                                    </react_native_1.View>
                                    {!!merchantOrDescriptionName && (<react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.gap2]}>
                                            <MerchantCell_1.default merchantOrDescription={merchantOrDescriptionName} shouldShowTooltip={shouldShowTooltip} shouldUseNarrowLayout={shouldUseNarrowLayout}/>
                                            <TotalCell_1.default transactionItem={transactionItem} shouldShowTooltip={shouldShowTooltip} shouldUseNarrowLayout={shouldUseNarrowLayout}/>
                                        </react_native_1.View>)}
                                </react_native_1.View>
                            </react_native_1.View>
                            <react_native_1.View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsStart]}>
                                <react_native_1.View style={[styles.flexColumn, styles.flex1]}>
                                    {hasCategoryOrTag && (<react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2, styles.mt2, styles.minHeight4]}>
                                            <CategoryCell_1.default transactionItem={transactionItem} shouldShowTooltip={shouldShowTooltip} shouldUseNarrowLayout={shouldUseNarrowLayout}/>
                                            <TagCell_1.default transactionItem={transactionItem} shouldShowTooltip={shouldShowTooltip} shouldUseNarrowLayout={shouldUseNarrowLayout}/>
                                        </react_native_1.View>)}
                                    <TransactionItemRowRBRWithOnyx_1.default transaction={transactionItem} containerStyles={[styles.mt2, styles.minHeight4]} missingFieldError={missingFieldError}/>
                                </react_native_1.View>
                                <ChatBubbleCell_1.default transaction={transactionItem} containerStyles={[styles.mt2]} isInSingleTransactionReport={isInSingleTransactionReport}/>
                            </react_native_1.View>
                        </react_native_1.View>
                    </react_native_reanimated_1.default.View>) : (<react_native_reanimated_1.default.View style={[isInReportTableView ? animatedHighlightStyle : {}]}>
                        <react_native_1.View style={__spreadArray(__spreadArray([], safeColumnWrapperStyle, true), [styles.gap2, bgActiveStyles, styles.mw100], false)}>
                            <react_native_1.View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
                                <react_native_1.View style={[styles.mr1]}>
                                    <Checkbox_1.default disabled={isPendingDelete} onPress={function () {
                onCheckboxPress(transactionItem.transactionID);
            }} accessibilityLabel={CONST_1.default.ROLE.CHECKBOX} isChecked={isSelected}/>
                                </react_native_1.View>
                                {columns === null || columns === void 0 ? void 0 : columns.map(function (column) { return columnComponent[column]; })}
                            </react_native_1.View>
                            <TransactionItemRowRBRWithOnyx_1.default transaction={transactionItem} missingFieldError={missingFieldError}/>
                        </react_native_1.View>
                    </react_native_reanimated_1.default.View>)}
            </OfflineWithFeedback_1.default>
        </react_native_1.View>);
}
TransactionItemRow.displayName = 'TransactionItemRow';
exports.default = TransactionItemRow;
