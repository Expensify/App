"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useLocalize_1 = require("@hooks/useLocalize");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
var SortableHeaderText_1 = require("./SortableHeaderText");
function SortableTableHeader(_a) {
    var columns = _a.columns, sortBy = _a.sortBy, sortOrder = _a.sortOrder, shouldShowColumn = _a.shouldShowColumn, dateColumnSize = _a.dateColumnSize, containerStyles = _a.containerStyles, shouldShowSorting = _a.shouldShowSorting, onSortPress = _a.onSortPress, amountColumnSize = _a.amountColumnSize, taxAmountColumnSize = _a.taxAmountColumnSize;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    return (<react_native_1.View style={[styles.flex1]}>
            <react_native_1.View style={[styles.flex1, styles.flexRow, styles.gap3, containerStyles]}>
                {columns.map(function (_a) {
            var columnName = _a.columnName, translationKey = _a.translationKey, isColumnSortable = _a.isColumnSortable;
            if (!shouldShowColumn(columnName)) {
                return null;
            }
            var isSortable = shouldShowSorting && isColumnSortable;
            var isActive = sortBy === columnName;
            var textStyle = columnName === CONST_1.default.SEARCH.TABLE_COLUMNS.RECEIPT ? StyleUtils.getTextOverflowStyle('clip') : null;
            return (<SortableHeaderText_1.default key={columnName} text={translationKey ? translate(translationKey) : ''} textStyle={textStyle} sortOrder={sortOrder !== null && sortOrder !== void 0 ? sortOrder : CONST_1.default.SEARCH.SORT_ORDER.ASC} isActive={isActive} containerStyle={[
                    StyleUtils.getReportTableColumnStyles(columnName, dateColumnSize === CONST_1.default.SEARCH.TABLE_COLUMN_SIZES.WIDE, amountColumnSize === CONST_1.default.SEARCH.TABLE_COLUMN_SIZES.WIDE, taxAmountColumnSize === CONST_1.default.SEARCH.TABLE_COLUMN_SIZES.WIDE),
                ]} isSortable={isSortable} onPress={function (order) { return onSortPress(columnName, order); }}/>);
        })}
            </react_native_1.View>
        </react_native_1.View>);
}
SortableTableHeader.displayName = 'SortableTableHeader';
exports.default = SortableTableHeader;
