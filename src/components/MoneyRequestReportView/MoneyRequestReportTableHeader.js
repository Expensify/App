"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var SortableTableHeader_1 = require("@components/SelectionList/SortableTableHeader");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
var shouldShowColumnConfig = (_a = {},
    _a[CONST_1.default.SEARCH.TABLE_COLUMNS.RECEIPT] = function () { return true; },
    _a[CONST_1.default.SEARCH.TABLE_COLUMNS.TYPE] = function () { return true; },
    _a[CONST_1.default.SEARCH.TABLE_COLUMNS.DATE] = function () { return true; },
    _a[CONST_1.default.SEARCH.TABLE_COLUMNS.MERCHANT] = function () { return true; },
    _a[CONST_1.default.SEARCH.TABLE_COLUMNS.CATEGORY] = function (isIOUReport) { return !isIOUReport; },
    _a[CONST_1.default.SEARCH.TABLE_COLUMNS.TAG] = function (isIOUReport) { return !isIOUReport; },
    _a[CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.COMMENTS] = function () { return true; },
    _a[CONST_1.default.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT] = function () { return true; },
    _a[CONST_1.default.SEARCH.TABLE_COLUMNS.IN] = function () { return false; },
    _a[CONST_1.default.SEARCH.TABLE_COLUMNS.FROM] = function () { return false; },
    _a[CONST_1.default.SEARCH.TABLE_COLUMNS.TO] = function () { return false; },
    _a[CONST_1.default.SEARCH.TABLE_COLUMNS.DESCRIPTION] = function () { return false; },
    _a[CONST_1.default.SEARCH.TABLE_COLUMNS.TAX_AMOUNT] = function () { return false; },
    _a[CONST_1.default.SEARCH.TABLE_COLUMNS.ACTION] = function () { return false; },
    _a[CONST_1.default.SEARCH.TABLE_COLUMNS.TITLE] = function () { return false; },
    _a[CONST_1.default.SEARCH.TABLE_COLUMNS.ASSIGNEE] = function () { return false; },
    _a);
var columnConfig = [
    {
        columnName: CONST_1.default.SEARCH.TABLE_COLUMNS.RECEIPT,
        translationKey: 'common.receipt',
        isColumnSortable: false,
    },
    {
        columnName: CONST_1.default.SEARCH.TABLE_COLUMNS.TYPE,
        translationKey: 'common.type',
        isColumnSortable: false,
    },
    {
        columnName: CONST_1.default.SEARCH.TABLE_COLUMNS.DATE,
        translationKey: 'common.date',
    },
    {
        columnName: CONST_1.default.SEARCH.TABLE_COLUMNS.MERCHANT,
        translationKey: 'common.merchant',
    },
    {
        columnName: CONST_1.default.SEARCH.TABLE_COLUMNS.CATEGORY,
        translationKey: 'common.category',
    },
    {
        columnName: CONST_1.default.SEARCH.TABLE_COLUMNS.TAG,
        translationKey: 'common.tag',
    },
    {
        columnName: CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.COMMENTS,
        translationKey: undefined, // comments have no title displayed
        isColumnSortable: false,
    },
    {
        columnName: CONST_1.default.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT,
        translationKey: 'common.total',
    },
];
function MoneyRequestReportTableHeader(_a) {
    var sortBy = _a.sortBy, sortOrder = _a.sortOrder, onSortPress = _a.onSortPress, dateColumnSize = _a.dateColumnSize, shouldShowSorting = _a.shouldShowSorting, isIOUReport = _a.isIOUReport, amountColumnSize = _a.amountColumnSize, taxAmountColumnSize = _a.taxAmountColumnSize;
    var styles = (0, useThemeStyles_1.default)();
    var shouldShowColumn = (0, react_1.useCallback)(function (columnName) {
        var shouldShowFun = shouldShowColumnConfig[columnName];
        if (!shouldShowFun) {
            return false;
        }
        return shouldShowFun(isIOUReport);
    }, [isIOUReport]);
    return (<react_native_1.View style={[styles.dFlex, styles.flex5]}>
            <SortableTableHeader_1.default columns={columnConfig} shouldShowColumn={shouldShowColumn} dateColumnSize={dateColumnSize} amountColumnSize={amountColumnSize} taxAmountColumnSize={taxAmountColumnSize} shouldShowSorting={shouldShowSorting} sortBy={sortBy} sortOrder={sortOrder} onSortPress={onSortPress}/>
        </react_native_1.View>);
}
MoneyRequestReportTableHeader.displayName = 'MoneyRequestReportTableHeader';
exports.default = MoneyRequestReportTableHeader;
