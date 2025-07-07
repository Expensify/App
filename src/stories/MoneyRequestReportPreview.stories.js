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
exports.OneTransaction = exports.HasErrors = exports.ManyTransactions = exports.DarkTheme = exports.Default = void 0;
var react_1 = require("react");
var react_native_1 = require("react-native");
var MoneyRequestReportPreviewContent_1 = require("@components/ReportActionItem/MoneyRequestReportPreview/MoneyRequestReportPreviewContent");
var TransactionPreviewContent_1 = require("@components/ReportActionItem/TransactionPreview/TransactionPreviewContent");
var ThemeProvider_1 = require("@components/ThemeProvider");
var ThemeStylesProvider_1 = require("@components/ThemeStylesProvider");
// eslint-disable-next-line no-restricted-imports
var getMoneyRequestReportPreviewStyle_1 = require("@styles/utils/getMoneyRequestReportPreviewStyle");
// eslint-disable-next-line no-restricted-imports
var sizing_1 = require("@styles/utils/sizing");
var CONST_1 = require("@src/CONST");
var SCREENS_1 = require("@src/SCREENS");
var actions_1 = require("../../__mocks__/reportData/actions");
var personalDetails_1 = require("../../__mocks__/reportData/personalDetails");
var reports_1 = require("../../__mocks__/reportData/reports");
var transactions_1 = require("../../__mocks__/reportData/transactions");
var violations_1 = require("../../__mocks__/reportData/violations");
/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
var mockTransactionsMedium = Array.from({ length: 2 }).map(function (item, index) {
    return __assign(__assign({}, transactions_1.transactionR14932), { transactionID: "".concat(transactions_1.transactionR14932.transactionID).concat(index) });
});
var mockTransactionsBig = Array.from({ length: 12 }).map(function (item, index) {
    return __assign(__assign({}, transactions_1.transactionR14932), { transactionID: "".concat(transactions_1.transactionR14932.transactionID).concat(index) });
});
var mockRenderItem = function (_a) {
    var item = _a.item;
    return (<TransactionPreviewContent_1.default action={actions_1.actionR14932} isWhisper={false} isHovered={false} chatReport={reports_1.chatReportR14932} personalDetails={personalDetails_1.default} report={reports_1.iouReportR14932} transaction={item} transactionRawAmount={item.amount} violations={item.errors ? violations_1.violationsR14932 : []} offlineWithFeedbackOnClose={function () { return undefined; }} navigateToReviewFields={function () { return undefined; }} isBillSplit={false} areThereDuplicates={false} sessionAccountID={11111111} walletTermsErrors={undefined} routeName={SCREENS_1.default.TRANSACTION_DUPLICATE.REVIEW} shouldHideOnDelete={false} transactionPreviewWidth={303} containerStyles={[sizing_1.default.h100]}/>);
};
exports.default = {
    title: 'Components/MoneyRequestReportPreviewContent',
    component: MoneyRequestReportPreviewContent_1.default,
    argTypes: {
        /** The associated chatReport */
        chatReportID: {
            options: ['chatReportID', undefined],
            control: { type: 'radio' },
        },
        /** The active IOUReport, used for Onyx subscription */
        iouReportID: {
            options: ['iouReportID', undefined],
            control: { type: 'radio' },
        },
        /** The report's policyID, used for Onyx subscription */
        policyID: {
            options: ['policyID', undefined],
            control: { type: 'radio' },
        },
        /** Extra styles to pass to View wrapper */
        containerStyles: {
            options: [{ marginTop: 8 }],
            control: { type: 'radio' },
        },
        /** Popover context menu anchor, used for showing context menu */
        contextMenuAnchor: {
            options: [null],
            control: { type: 'radio' },
        },
        /** Callback for updating context menu active state, used for showing context menu */
        checkIfContextMenuActive: {
            options: [undefined, function () { }],
            control: { type: 'radio' },
        },
        /** Callback when the payment options popover is shown */
        onPaymentOptionsShow: {
            options: [undefined, function () { }],
            control: { type: 'radio' },
        },
        /** Callback when the payment options popover is closed */
        onPaymentOptionsHide: {
            options: [undefined, function () { }],
            control: { type: 'radio' },
        },
        /** Whether a message is a whisper */
        isWhisper: {
            options: [true, false, undefined],
            control: { type: 'radio' },
        },
        /** Whether the corresponding report action item is hovered */
        isHovered: {
            control: { type: 'boolean' },
        },
    },
    args: {
        action: actions_1.actionR14932,
        chatReport: reports_1.chatReportR14932,
        policy: undefined,
        iouReport: reports_1.iouReportR14932,
        transactions: mockTransactionsMedium,
        violations: violations_1.violationsR14932,
        invoiceReceiverPersonalDetail: undefined,
        invoiceReceiverPolicy: undefined,
        renderTransactionItem: mockRenderItem,
    },
    parameters: {
        useLightTheme: true,
    },
};
function Template(props, _a) {
    var parameters = _a.parameters;
    var theme = parameters.useLightTheme ? CONST_1.default.THEME.LIGHT : CONST_1.default.THEME.DARK;
    var transactions = parameters.transactionsBig ? mockTransactionsBig : props.transactions;
    var reportPreviewStyle = (0, getMoneyRequestReportPreviewStyle_1.default)(false, transactions.length, 400, 400);
    return (<ThemeProvider_1.default theme={theme}>
            <ThemeStylesProvider_1.default>
                <react_native_1.View style={{ maxWidth: '100%' }}>
                    <MoneyRequestReportPreviewContent_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} reportPreviewStyles={reportPreviewStyle} containerStyles={[reportPreviewStyle.componentStyle, props.containerStyles]} transactions={transactions}/>
                </react_native_1.View>
            </ThemeStylesProvider_1.default>
        </ThemeProvider_1.default>);
}
// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
var Default = Template.bind({});
exports.Default = Default;
var DarkTheme = Template.bind({});
exports.DarkTheme = DarkTheme;
var OneTransaction = Template.bind({});
exports.OneTransaction = OneTransaction;
var ManyTransactions = Template.bind({});
exports.ManyTransactions = ManyTransactions;
var HasErrors = Template.bind({});
exports.HasErrors = HasErrors;
DarkTheme.parameters = {
    useLightTheme: false,
};
OneTransaction.args = {
    transactions: [transactions_1.transactionR14932],
};
ManyTransactions.parameters = {
    transactionsBig: true,
};
HasErrors.args = {
    transactions: mockTransactionsMedium.map(function (t) { return (__assign(__assign({}, t), { errors: violations_1.receiptErrorsR14932 })); }),
};
