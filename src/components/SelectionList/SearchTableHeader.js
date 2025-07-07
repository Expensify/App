"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var SearchUIUtils_1 = require("@libs/SearchUIUtils");
var CONST_1 = require("@src/CONST");
var SortableTableHeader_1 = require("./SortableTableHeader");
var shouldShowColumnConfig = (_a = {},
    _a[CONST_1.default.SEARCH.TABLE_COLUMNS.RECEIPT] = function () { return true; },
    _a[CONST_1.default.SEARCH.TABLE_COLUMNS.TYPE] = function () { return true; },
    _a[CONST_1.default.SEARCH.TABLE_COLUMNS.DATE] = function () { return true; },
    _a[CONST_1.default.SEARCH.TABLE_COLUMNS.MERCHANT] = function (data) { return (0, SearchUIUtils_1.getShouldShowMerchant)(data); },
    _a[CONST_1.default.SEARCH.TABLE_COLUMNS.DESCRIPTION] = function (data) { return !(0, SearchUIUtils_1.getShouldShowMerchant)(data); },
    _a[CONST_1.default.SEARCH.TABLE_COLUMNS.FROM] = function () { return true; },
    _a[CONST_1.default.SEARCH.TABLE_COLUMNS.TO] = function () { return true; },
    _a[CONST_1.default.SEARCH.TABLE_COLUMNS.CATEGORY] = function (data, metadata) { var _a, _b; return (_b = (_a = metadata === null || metadata === void 0 ? void 0 : metadata.columnsToShow) === null || _a === void 0 ? void 0 : _a.shouldShowCategoryColumn) !== null && _b !== void 0 ? _b : false; },
    _a[CONST_1.default.SEARCH.TABLE_COLUMNS.TAG] = function (data, metadata) { var _a, _b; return (_b = (_a = metadata === null || metadata === void 0 ? void 0 : metadata.columnsToShow) === null || _a === void 0 ? void 0 : _a.shouldShowTagColumn) !== null && _b !== void 0 ? _b : false; },
    _a[CONST_1.default.SEARCH.TABLE_COLUMNS.TAX_AMOUNT] = function (data, metadata) { var _a, _b; return (_b = (_a = metadata === null || metadata === void 0 ? void 0 : metadata.columnsToShow) === null || _a === void 0 ? void 0 : _a.shouldShowTaxColumn) !== null && _b !== void 0 ? _b : false; },
    _a[CONST_1.default.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT] = function () { return true; },
    _a[CONST_1.default.SEARCH.TABLE_COLUMNS.ACTION] = function () { return true; },
    _a[CONST_1.default.SEARCH.TABLE_COLUMNS.TITLE] = function () { return true; },
    _a[CONST_1.default.SEARCH.TABLE_COLUMNS.ASSIGNEE] = function () { return true; },
    _a[CONST_1.default.SEARCH.TABLE_COLUMNS.IN] = function () { return true; },
    // This column is never displayed on Search
    _a[CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.COMMENTS] = function () { return false; },
    _a);
var expenseHeaders = [
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
        columnName: CONST_1.default.SEARCH.TABLE_COLUMNS.DESCRIPTION,
        translationKey: 'common.description',
    },
    {
        columnName: CONST_1.default.SEARCH.TABLE_COLUMNS.FROM,
        translationKey: 'common.from',
    },
    {
        columnName: CONST_1.default.SEARCH.TABLE_COLUMNS.TO,
        translationKey: 'common.to',
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
        columnName: CONST_1.default.SEARCH.TABLE_COLUMNS.TAX_AMOUNT,
        translationKey: 'common.tax',
        isColumnSortable: false,
    },
    {
        columnName: CONST_1.default.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT,
        translationKey: 'common.total',
    },
    {
        columnName: CONST_1.default.SEARCH.TABLE_COLUMNS.ACTION,
        translationKey: 'common.action',
        isColumnSortable: false,
    },
];
var taskHeaders = [
    {
        columnName: CONST_1.default.SEARCH.TABLE_COLUMNS.DATE,
        translationKey: 'common.date',
    },
    {
        columnName: CONST_1.default.SEARCH.TABLE_COLUMNS.TITLE,
        translationKey: 'common.title',
    },
    {
        columnName: CONST_1.default.SEARCH.TABLE_COLUMNS.DESCRIPTION,
        translationKey: 'common.description',
    },
    {
        columnName: CONST_1.default.SEARCH.TABLE_COLUMNS.FROM,
        translationKey: 'common.from',
    },
    {
        columnName: CONST_1.default.SEARCH.TABLE_COLUMNS.IN,
        translationKey: 'common.sharedIn',
        isColumnSortable: false,
    },
    {
        columnName: CONST_1.default.SEARCH.TABLE_COLUMNS.ASSIGNEE,
        translationKey: 'common.assignee',
    },
    {
        columnName: CONST_1.default.SEARCH.TABLE_COLUMNS.ACTION,
        translationKey: 'common.action',
        isColumnSortable: false,
    },
];
var SearchColumns = (_b = {},
    _b[CONST_1.default.SEARCH.DATA_TYPES.EXPENSE] = expenseHeaders,
    _b[CONST_1.default.SEARCH.DATA_TYPES.INVOICE] = expenseHeaders,
    _b[CONST_1.default.SEARCH.DATA_TYPES.TRIP] = expenseHeaders,
    _b[CONST_1.default.SEARCH.DATA_TYPES.TASK] = taskHeaders,
    _b[CONST_1.default.SEARCH.DATA_TYPES.CHAT] = null,
    _b);
function SearchTableHeader(_a) {
    var data = _a.data, metadata = _a.metadata, sortBy = _a.sortBy, sortOrder = _a.sortOrder, onSortPress = _a.onSortPress, shouldShowYear = _a.shouldShowYear, shouldShowSorting = _a.shouldShowSorting, canSelectMultiple = _a.canSelectMultiple, isAmountColumnWide = _a.isAmountColumnWide, isTaxAmountColumnWide = _a.isTaxAmountColumnWide;
    var styles = (0, useThemeStyles_1.default)();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var _b = (0, useResponsiveLayout_1.default)(), isSmallScreenWidth = _b.isSmallScreenWidth, isMediumScreenWidth = _b.isMediumScreenWidth;
    var displayNarrowVersion = isMediumScreenWidth || isSmallScreenWidth;
    var shouldShowColumn = (0, react_1.useCallback)(function (columnName) {
        var shouldShowFun = shouldShowColumnConfig[columnName];
        return shouldShowFun(data, metadata);
    }, [data, metadata]);
    if (displayNarrowVersion) {
        return;
    }
    var columnConfig = SearchColumns[metadata.type];
    if (!columnConfig) {
        return;
    }
    return (<SortableTableHeader_1.default columns={columnConfig} shouldShowColumn={shouldShowColumn} dateColumnSize={shouldShowYear ? CONST_1.default.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST_1.default.SEARCH.TABLE_COLUMN_SIZES.NORMAL} amountColumnSize={isAmountColumnWide ? CONST_1.default.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST_1.default.SEARCH.TABLE_COLUMN_SIZES.NORMAL} taxAmountColumnSize={isTaxAmountColumnWide ? CONST_1.default.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST_1.default.SEARCH.TABLE_COLUMN_SIZES.NORMAL} shouldShowSorting={shouldShowSorting} sortBy={sortBy} sortOrder={sortOrder} 
    // Don't butt up against the 'select all' checkbox if present
    containerStyles={canSelectMultiple && [styles.pl4]} onSortPress={function (columnName, order) {
            if (columnName === CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.COMMENTS) {
                return;
            }
            onSortPress(columnName, order);
        }}/>);
}
SearchTableHeader.displayName = 'SearchTableHeader';
exports.default = SearchTableHeader;
