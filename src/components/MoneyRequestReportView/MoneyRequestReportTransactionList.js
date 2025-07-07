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
var native_1 = require("@react-navigation/native");
var isEmpty_1 = require("lodash/isEmpty");
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_reanimated_1 = require("react-native-reanimated");
var utils_1 = require("@components/Button/utils");
var Checkbox_1 = require("@components/Checkbox");
var Expensicons = require("@components/Icon/Expensicons");
var MenuItem_1 = require("@components/MenuItem");
var Modal_1 = require("@components/Modal");
var PressableWithFeedback_1 = require("@components/Pressable/PressableWithFeedback");
var SearchContext_1 = require("@components/Search/SearchContext");
var Text_1 = require("@components/Text");
var TransactionItemRow_1 = require("@components/TransactionItemRow");
var useCopySelectionHelper_1 = require("@hooks/useCopySelectionHelper");
var useHover_1 = require("@hooks/useHover");
var useLocalize_1 = require("@hooks/useLocalize");
var useMobileSelectionMode_1 = require("@hooks/useMobileSelectionMode");
var useMouseContext_1 = require("@hooks/useMouseContext");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var MobileSelectionMode_1 = require("@libs/actions/MobileSelectionMode");
var TransactionThreadNavigation_1 = require("@libs/actions/TransactionThreadNavigation");
var ControlSelection_1 = require("@libs/ControlSelection");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var MoneyRequestReportUtils_1 = require("@libs/MoneyRequestReportUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var SearchUIUtils_1 = require("@libs/SearchUIUtils");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var shouldShowTransactionYear_1 = require("@libs/TransactionUtils/shouldShowTransactionYear");
var Navigation_2 = require("@navigation/Navigation");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var NAVIGATORS_1 = require("@src/NAVIGATORS");
var ROUTES_1 = require("@src/ROUTES");
var MoneyRequestReportTableHeader_1 = require("./MoneyRequestReportTableHeader");
var SearchMoneyRequestReportEmptyState_1 = require("./SearchMoneyRequestReportEmptyState");
var sortableColumnNames = [
    CONST_1.default.SEARCH.TABLE_COLUMNS.DATE,
    CONST_1.default.SEARCH.TABLE_COLUMNS.MERCHANT,
    CONST_1.default.SEARCH.TABLE_COLUMNS.CATEGORY,
    CONST_1.default.SEARCH.TABLE_COLUMNS.TAG,
    CONST_1.default.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT,
];
var allReportColumns = [
    CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.RECEIPT,
    CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.TYPE,
    CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.DATE,
    CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.MERCHANT,
    CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.CATEGORY,
    CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.TAG,
    CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.COMMENTS,
    CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.TOTAL_AMOUNT,
];
var isSortableColumnName = function (key) { return !!sortableColumnNames.find(function (val) { return val === key; }); };
var getTransactionKey = function (transaction, key) {
    var dateKey = transaction.modifiedCreated ? 'modifiedCreated' : 'created';
    return key === CONST_1.default.SEARCH.TABLE_COLUMNS.DATE ? dateKey : key;
};
function MoneyRequestReportTransactionList(_a) {
    var report = _a.report, transactions = _a.transactions, newTransactions = _a.newTransactions, reportActions = _a.reportActions, hasComments = _a.hasComments, isLoadingReportActions = _a.isLoadingInitialReportActions, scrollToNewTransaction = _a.scrollToNewTransaction;
    (0, useCopySelectionHelper_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var _b = (0, useResponsiveLayout_1.default)(), shouldUseNarrowLayout = _b.shouldUseNarrowLayout, isSmallScreenWidth = _b.isSmallScreenWidth, isMediumScreenWidth = _b.isMediumScreenWidth;
    var _c = (0, react_1.useState)(false), isModalVisible = _c[0], setIsModalVisible = _c[1];
    var _d = (0, react_1.useState)(''), selectedTransactionID = _d[0], setSelectedTransactionID = _d[1];
    var _e = (0, ReportUtils_1.getMoneyRequestSpendBreakdown)(report), totalDisplaySpend = _e.totalDisplaySpend, nonReimbursableSpend = _e.nonReimbursableSpend, reimbursableSpend = _e.reimbursableSpend;
    var formattedOutOfPocketAmount = (0, CurrencyUtils_1.convertToDisplayString)(reimbursableSpend, report === null || report === void 0 ? void 0 : report.currency);
    var formattedCompanySpendAmount = (0, CurrencyUtils_1.convertToDisplayString)(nonReimbursableSpend, report === null || report === void 0 ? void 0 : report.currency);
    var shouldShowBreakdown = !!nonReimbursableSpend && !!reimbursableSpend;
    var transactionsWithoutPendingDelete = (0, react_1.useMemo)(function () { return transactions.filter(function (t) { return !(0, TransactionUtils_1.isTransactionPendingDelete)(t); }); }, [transactions]);
    var pendingActionsOpacity = (0, react_1.useMemo)(function () {
        var pendingAction = transactions.some(TransactionUtils_1.getTransactionPendingAction);
        return pendingAction && styles.opacitySemiTransparent;
    }, [styles.opacitySemiTransparent, transactions]);
    var bind = (0, useHover_1.default)().bind;
    var _f = (0, useMouseContext_1.useMouseContext)(), isMouseDownOnInput = _f.isMouseDownOnInput, setMouseUp = _f.setMouseUp;
    var _g = (0, SearchContext_1.useSearchContext)(), selectedTransactionIDs = _g.selectedTransactionIDs, setSelectedTransactions = _g.setSelectedTransactions, clearSelectedTransactions = _g.clearSelectedTransactions;
    var selectionMode = (0, useMobileSelectionMode_1.default)().selectionMode;
    var toggleTransaction = (0, react_1.useCallback)(function (transactionID) {
        var newSelectedTransactionIDs = selectedTransactionIDs;
        if (selectedTransactionIDs.includes(transactionID)) {
            newSelectedTransactionIDs = selectedTransactionIDs.filter(function (t) { return t !== transactionID; });
        }
        else {
            newSelectedTransactionIDs = __spreadArray(__spreadArray([], selectedTransactionIDs, true), [transactionID], false);
        }
        setSelectedTransactions(newSelectedTransactionIDs);
    }, [setSelectedTransactions, selectedTransactionIDs]);
    var isTransactionSelected = (0, react_1.useCallback)(function (transactionID) { return selectedTransactionIDs.includes(transactionID); }, [selectedTransactionIDs]);
    (0, native_1.useFocusEffect)((0, react_1.useCallback)(function () {
        return function () {
            var _a, _b;
            if (((_b = (_a = Navigation_1.navigationRef === null || Navigation_1.navigationRef === void 0 ? void 0 : Navigation_1.navigationRef.getRootState()) === null || _a === void 0 ? void 0 : _a.routes.at(-1)) === null || _b === void 0 ? void 0 : _b.name) === NAVIGATORS_1.default.RIGHT_MODAL_NAVIGATOR) {
                return;
            }
            clearSelectedTransactions(true);
        };
    }, [clearSelectedTransactions]));
    var handleMouseLeave = function (e) {
        bind.onMouseLeave();
        e.stopPropagation();
        setMouseUp();
    };
    var _h = (0, react_1.useState)({
        sortBy: CONST_1.default.SEARCH.TABLE_COLUMNS.DATE,
        sortOrder: CONST_1.default.SEARCH.SORT_ORDER.ASC,
    }), sortConfig = _h[0], setSortConfig = _h[1];
    var sortBy = sortConfig.sortBy, sortOrder = sortConfig.sortOrder;
    var sortedTransactions = (0, react_1.useMemo)(function () {
        return __spreadArray([], transactions, true).sort(function (a, b) { return (0, SearchUIUtils_1.compareValues)(a[getTransactionKey(a, sortBy)], b[getTransactionKey(b, sortBy)], sortOrder, sortBy); })
            .map(function (transaction) { return (__assign(__assign({}, transaction), { shouldBeHighlighted: newTransactions === null || newTransactions === void 0 ? void 0 : newTransactions.includes(transaction) })); });
    }, [newTransactions, sortBy, sortOrder, transactions]);
    var navigateToTransaction = (0, react_1.useCallback)(function (activeTransaction) {
        var iouAction = (0, ReportActionsUtils_1.getIOUActionForTransactionID)(reportActions, activeTransaction.transactionID);
        var reportIDToNavigate = iouAction === null || iouAction === void 0 ? void 0 : iouAction.childReportID;
        if (!reportIDToNavigate) {
            return;
        }
        var backTo = Navigation_2.default.getActiveRoute();
        // Single transaction report will open in RHP, and we need to find every other report ID for the rest of transactions
        // to display prev/next arrows in RHP for navigation
        var sortedSiblingTransactionReportIDs = (0, MoneyRequestReportUtils_1.getThreadReportIDsForTransactions)(reportActions, sortedTransactions);
        (0, TransactionThreadNavigation_1.setActiveTransactionThreadIDs)(sortedSiblingTransactionReportIDs).then(function () {
            Navigation_2.default.navigate(ROUTES_1.default.SEARCH_REPORT.getRoute({ reportID: reportIDToNavigate, backTo: backTo }));
        });
    }, [reportActions, sortedTransactions]);
    var _j = (0, react_1.useMemo)(function () {
        var isAmountColumnWide = transactions.some(function (transaction) { return (0, SearchUIUtils_1.isTransactionAmountTooLong)(transaction); });
        var isTaxAmountColumnWide = transactions.some(function (transaction) { return (0, SearchUIUtils_1.isTransactionTaxAmountTooLong)(transaction); });
        var shouldShowYearForSomeTransaction = transactions.some(function (transaction) { return (0, shouldShowTransactionYear_1.default)(transaction); });
        return {
            amountColumnSize: isAmountColumnWide ? CONST_1.default.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST_1.default.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
            taxAmountColumnSize: isTaxAmountColumnWide ? CONST_1.default.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST_1.default.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
            dateColumnSize: shouldShowYearForSomeTransaction ? CONST_1.default.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST_1.default.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
        };
    }, [transactions]), amountColumnSize = _j.amountColumnSize, dateColumnSize = _j.dateColumnSize, taxAmountColumnSize = _j.taxAmountColumnSize;
    var pressableStyle = [styles.overflowHidden];
    var isEmptyTransactions = (0, isEmpty_1.default)(transactions);
    var listHorizontalPadding = styles.ph5;
    return (<>
            {!isEmptyTransactions ? (<>
                    {!shouldUseNarrowLayout && (<react_native_1.View style={[styles.dFlex, styles.flexRow, styles.pl5, styles.pr8, styles.alignItemsCenter]}>
                            <react_native_1.View style={[styles.dFlex, styles.flexRow, styles.pv2, styles.pr4, StyleUtils.getPaddingLeft(variables_1.default.w12)]}>
                                <Checkbox_1.default onPress={function () {
                    if (selectedTransactionIDs.length !== 0) {
                        clearSelectedTransactions(true);
                    }
                    else {
                        setSelectedTransactions(transactionsWithoutPendingDelete.map(function (t) { return t.transactionID; }));
                    }
                }} accessibilityLabel={CONST_1.default.ROLE.CHECKBOX} isIndeterminate={selectedTransactionIDs.length > 0 && selectedTransactionIDs.length !== transactionsWithoutPendingDelete.length} isChecked={selectedTransactionIDs.length > 0 && selectedTransactionIDs.length === transactionsWithoutPendingDelete.length}/>
                                {isMediumScreenWidth && <Text_1.default style={[styles.textStrong, styles.ph3]}>{translate('workspace.people.selectAll')}</Text_1.default>}
                            </react_native_1.View>
                            {!isMediumScreenWidth && (<MoneyRequestReportTableHeader_1.default shouldShowSorting sortBy={sortBy} sortOrder={sortOrder} dateColumnSize={dateColumnSize} amountColumnSize={amountColumnSize} taxAmountColumnSize={taxAmountColumnSize} onSortPress={function (selectedSortBy, selectedSortOrder) {
                        if (!isSortableColumnName(selectedSortBy)) {
                            return;
                        }
                        setSortConfig(function (prevState) { return (__assign(__assign({}, prevState), { sortBy: selectedSortBy, sortOrder: selectedSortOrder })); });
                    }} isIOUReport={(0, ReportUtils_1.isIOUReport)(report)}/>)}
                        </react_native_1.View>)}
                    <react_native_1.View style={[listHorizontalPadding, styles.gap2, styles.pb4]}>
                        {sortedTransactions.map(function (transaction) {
                var _a;
                var _b;
                return (<PressableWithFeedback_1.default key={transaction.transactionID} onPress={function (e) {
                        if (isMouseDownOnInput) {
                            e === null || e === void 0 ? void 0 : e.stopPropagation();
                            return;
                        }
                        if (selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled) {
                            toggleTransaction(transaction.transactionID);
                            return;
                        }
                        navigateToTransaction(transaction);
                    }} accessibilityLabel={translate('iou.viewDetails')} role={(0, utils_1.getButtonRole)(true)} isNested hoverDimmingValue={1} onMouseDown={function (e) { return e.preventDefault(); }} id={transaction.transactionID} style={[pressableStyle, styles.userSelectNone]} dataSet={_a = {}, _a[CONST_1.default.SELECTION_SCRAPER_HIDDEN_ELEMENT] = true, _a} onMouseLeave={handleMouseLeave} onPressIn={function () { return (0, DeviceCapabilities_1.canUseTouchScreen)() && ControlSelection_1.default.block(); }} onPressOut={function () { return ControlSelection_1.default.unblock(); }} onLongPress={function () {
                        if (!isSmallScreenWidth) {
                            return;
                        }
                        if (selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled) {
                            toggleTransaction(transaction.transactionID);
                            return;
                        }
                        setSelectedTransactionID(transaction.transactionID);
                        setIsModalVisible(true);
                    }} disabled={(0, TransactionUtils_1.isTransactionPendingDelete)(transaction)}>
                                    <TransactionItemRow_1.default transactionItem={transaction} isSelected={isTransactionSelected(transaction.transactionID)} dateColumnSize={dateColumnSize} amountColumnSize={amountColumnSize} taxAmountColumnSize={taxAmountColumnSize} shouldShowTooltip shouldUseNarrowLayout={shouldUseNarrowLayout || isMediumScreenWidth} shouldShowCheckbox={!!(selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled) || !isSmallScreenWidth} onCheckboxPress={toggleTransaction} columns={allReportColumns} scrollToNewTransaction={transaction.transactionID === ((_b = newTransactions === null || newTransactions === void 0 ? void 0 : newTransactions.at(0)) === null || _b === void 0 ? void 0 : _b.transactionID) ? scrollToNewTransaction : undefined} isInReportTableView/>
                                </PressableWithFeedback_1.default>);
            })}
                    </react_native_1.View>
                    {shouldShowBreakdown && (<react_native_1.View style={[styles.dFlex, styles.alignItemsEnd, listHorizontalPadding, styles.gap2, styles.mb2]}>
                            {[
                    { text: translate('cardTransactions.outOfPocket'), value: formattedOutOfPocketAmount },
                    { text: translate('cardTransactions.companySpend'), value: formattedCompanySpendAmount },
                ].map(function (_a) {
                    var text = _a.text, value = _a.value;
                    return (<react_native_1.View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.pr3]}>
                                    <Text_1.default style={[styles.textLabelSupporting, styles.mr3]} numberOfLines={1}>
                                        {text}
                                    </Text_1.default>
                                    <Text_1.default numberOfLines={1} style={[styles.textLabelSupporting, styles.textNormal, shouldUseNarrowLayout ? styles.mnw64p : styles.mnw100p, styles.textAlignRight]}>
                                        {value}
                                    </Text_1.default>
                                </react_native_1.View>);
                })}
                        </react_native_1.View>)}
                    <Modal_1.default isVisible={isModalVisible} type={CONST_1.default.MODAL.MODAL_TYPE.BOTTOM_DOCKED} onClose={function () { return setIsModalVisible(false); }} shouldPreventScrollOnFocus>
                        <MenuItem_1.default title={translate('common.select')} icon={Expensicons.CheckSquare} onPress={function () {
                if (!(selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled)) {
                    (0, MobileSelectionMode_1.turnOnMobileSelectionMode)();
                }
                toggleTransaction(selectedTransactionID);
                setIsModalVisible(false);
            }}/>
                    </Modal_1.default>
                </>) : (<SearchMoneyRequestReportEmptyState_1.default />)}
            <react_native_1.View style={[styles.dFlex, styles.flexRow, listHorizontalPadding, styles.justifyContentBetween, styles.mb2]}>
                <react_native_reanimated_1.default.Text style={[styles.textLabelSupporting]} entering={hasComments ? undefined : react_native_reanimated_1.FadeIn} exiting={react_native_reanimated_1.FadeOut}>
                    {hasComments || isLoadingReportActions ? translate('common.comments') : ''}
                </react_native_reanimated_1.default.Text>
                {!isEmptyTransactions && (<react_native_1.View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.pr3]}>
                        <Text_1.default style={[styles.mr3, styles.textLabelSupporting]}>{translate('common.total')}</Text_1.default>
                        <Text_1.default style={[shouldUseNarrowLayout ? styles.mnw64p : styles.mnw100p, styles.textAlignRight, styles.textBold, pendingActionsOpacity]}>
                            {(0, CurrencyUtils_1.convertToDisplayString)(totalDisplaySpend, report === null || report === void 0 ? void 0 : report.currency)}
                        </Text_1.default>
                    </react_native_1.View>)}
            </react_native_1.View>
        </>);
}
MoneyRequestReportTransactionList.displayName = 'MoneyRequestReportTransactionList';
exports.default = (0, react_1.memo)(MoneyRequestReportTransactionList);
