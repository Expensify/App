"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DarkTheme = exports.LightTheme = void 0;
var react_1 = require("react");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ThemeProvider_1 = require("@components/ThemeProvider");
var ThemeStylesProvider_1 = require("@components/ThemeStylesProvider");
var TransactionItemRow_1 = require("@components/TransactionItemRow");
var CONST_1 = require("@src/CONST");
var Transaction_1 = require("./objects/Transaction");
var allAvailableColumns = [
    CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.RECEIPT,
    CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.TYPE,
    CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.DATE,
    CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.MERCHANT,
    CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.FROM,
    CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.TO,
    CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.MERCHANT,
    CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.CATEGORY,
    CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.TAG,
    CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.TOTAL_AMOUNT,
    CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.ACTION,
];
var story = {
    title: 'Components/TransactionItemRow',
    component: TransactionItemRow_1.default,
    args: {
        transactionItem: Transaction_1.transactionWithOptionalSearchFields,
        shouldUseNarrowLayout: false,
        isSelected: false,
        shouldShowTooltip: true,
        shouldShowCheckbox: true,
        columns: allAvailableColumns,
    },
    argTypes: {
        transactionItem: {
            control: 'object',
        },
        shouldUseNarrowLayout: {
            control: 'boolean',
        },
        isSelected: {
            control: 'boolean',
        },
        shouldShowTooltip: {
            control: 'boolean',
        },
        shouldShowCheckbox: {
            control: 'boolean',
        },
        isParentHovered: {
            control: 'boolean',
        },
        columns: {
            control: {
                type: 'check',
            },
            options: allAvailableColumns,
        },
    },
    parameters: {
        useLightTheme: true,
    },
};
function Template(_a, _b) {
    var transactionItem = _a.transactionItem, shouldUseNarrowLayout = _a.shouldUseNarrowLayout, isSelected = _a.isSelected, shouldShowTooltip = _a.shouldShowTooltip, shouldShowCheckbox = _a.shouldShowCheckbox, columns = _a.columns, isParentHovered = _a.isParentHovered;
    var parameters = _b.parameters;
    var theme = parameters.useLightTheme ? CONST_1.default.THEME.LIGHT : CONST_1.default.THEME.DARK;
    return (<ThemeProvider_1.default theme={theme}>
            <ScreenWrapper_1.default testID="testID">
                <ThemeStylesProvider_1.default>
                    <TransactionItemRow_1.default transactionItem={transactionItem} shouldUseNarrowLayout={shouldUseNarrowLayout} isSelected={isSelected} shouldShowTooltip={shouldShowTooltip} dateColumnSize={CONST_1.default.SEARCH.TABLE_COLUMN_SIZES.NORMAL} amountColumnSize={CONST_1.default.SEARCH.TABLE_COLUMN_SIZES.NORMAL} taxAmountColumnSize={CONST_1.default.SEARCH.TABLE_COLUMN_SIZES.NORMAL} onCheckboxPress={function () { }} shouldShowCheckbox={shouldShowCheckbox} columns={columns} isParentHovered={isParentHovered} onButtonPress={function () { }}/>
                </ThemeStylesProvider_1.default>
            </ScreenWrapper_1.default>
        </ThemeProvider_1.default>);
}
var LightTheme = Template.bind({});
exports.LightTheme = LightTheme;
var DarkTheme = Template.bind({});
exports.DarkTheme = DarkTheme;
LightTheme.parameters = {
    useLightTheme: true,
};
DarkTheme.parameters = {
    useLightTheme: false,
};
exports.default = story;
