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
exports.DeletedKeepButtonSplitRBRCategoriesAndTag = exports.KeepButtonSplitRBRCategoriesAndTag = exports.KeepButtonIOURbrCategoriesAndTag = exports.KeepButtonRBRCategoriesAndTag = exports.KeepButtonCategoriesAndTag = exports.CategoriesAndTag = exports.NoMerchant = exports.Default = void 0;
var react_1 = require("react");
var react_native_1 = require("react-native");
var TransactionPreviewContent_1 = require("@components/ReportActionItem/TransactionPreview/TransactionPreviewContent");
var ThemeProvider_1 = require("@components/ThemeProvider");
var ThemeStylesProvider_1 = require("@components/ThemeStylesProvider");
var CONST_1 = require("@src/CONST");
var SCREENS_1 = require("@src/SCREENS");
var actions_1 = require("../../__mocks__/reportData/actions");
var personalDetails_1 = require("../../__mocks__/reportData/personalDetails");
var reports_1 = require("../../__mocks__/reportData/reports");
var transactions_1 = require("../../__mocks__/reportData/transactions");
var violations_1 = require("../../__mocks__/reportData/violations");
var veryLongString = 'W'.repeat(1000);
var veryBigNumber = Number('9'.repeat(12));
var modifiedTransaction = function (_a) {
    var category = _a.category, tag = _a.tag, _b = _a.merchant, merchant = _b === void 0 ? '' : _b, _c = _a.amount, amount = _c === void 0 ? 1000 : _c, _d = _a.hold, hold = _d === void 0 ? false : _d;
    return (__assign(__assign({}, transactions_1.transactionR14932), { category: category, tag: tag, merchant: merchant, amount: amount, comment: {
            hold: hold ? 'true' : undefined,
        } }));
};
var iouReportWithModifiedType = function (type) { return (__assign(__assign({}, reports_1.iouReportR14932), { type: type })); };
var actionWithModifiedPendingAction = function (pendingAction) { return (__assign(__assign({}, actions_1.actionR14932), { pendingAction: pendingAction })); };
var disabledProperties = [
    'onPreviewPressed',
    'navigateToReviewFields',
    'offlineWithFeedbackOnClose',
    'containerStyles',
    'showContextMenu',
    'routeName',
    'sessionAccountID',
    'isHovered',
    'isWhisper',
    'walletTermsErrors',
    'personalDetails',
    'chatReport',
].reduce(function (disabledArgTypes, property) {
    // eslint-disable-next-line no-param-reassign
    disabledArgTypes[property] = {
        table: {
            disable: true,
        },
    };
    return disabledArgTypes;
}, {});
var generateArgTypes = function (mapping) { return ({
    control: 'select',
    options: Object.keys(mapping),
    mapping: mapping,
}); };
/* eslint-disable @typescript-eslint/naming-convention */
var transactionsMap = {
    'No Merchant': modifiedTransaction({}),
    Food: modifiedTransaction({ category: 'Food', tag: 'Yum', merchant: 'Burgers' }),
    Grocery: modifiedTransaction({ category: 'Shopping', tag: 'Tesco', merchant: 'Supermarket' }),
    Cars: modifiedTransaction({ category: 'Porsche', tag: 'Car shop', merchant: 'Merchant' }),
    'Too Long': modifiedTransaction({ category: veryLongString, tag: veryLongString, merchant: veryLongString, amount: veryBigNumber }),
};
var violationsMap = {
    None: [],
    Duplicate: [violations_1.violationsR14932.at(0)],
    'Missing Category': [violations_1.violationsR14932.at(1)],
    'Field Required': [violations_1.violationsR14932.at(2)],
};
var actionMap = {
    'Pending delete': actionWithModifiedPendingAction(CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE),
    'No pending action': actions_1.actionR14932,
};
var iouReportMap = {
    IOU: iouReportWithModifiedType(CONST_1.default.REPORT.TYPE.IOU),
    'Normal report': reports_1.iouReportR14932,
};
var story = {
    title: 'Components/TransactionPreview',
    component: TransactionPreviewContent_1.default,
    args: {
        action: actions_1.actionR14932,
        isWhisper: false,
        isHovered: false,
        chatReport: reports_1.chatReportR14932,
        personalDetails: personalDetails_1.default,
        report: reports_1.iouReportR14932,
        transaction: transactions_1.transactionR14932,
        violations: [],
        offlineWithFeedbackOnClose: function () { },
        navigateToReviewFields: function () { return undefined; },
        containerStyles: [],
        isBillSplit: false,
        areThereDuplicates: false,
        sessionAccountID: 11111111,
        walletTermsErrors: undefined,
        routeName: SCREENS_1.default.TRANSACTION_DUPLICATE.REVIEW,
        shouldHideOnDelete: false,
        transactionPreviewWidth: 303,
    },
    argTypes: __assign(__assign({}, disabledProperties), { report: generateArgTypes(iouReportMap), transaction: generateArgTypes(transactionsMap), violations: generateArgTypes(violationsMap), action: generateArgTypes(actionMap) }),
};
function Template(props) {
    return (<ThemeProvider_1.default theme={CONST_1.default.THEME.LIGHT}>
            <ThemeStylesProvider_1.default>
                <react_native_1.View style={{ flexDirection: 'row' }}>
                    {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                    <TransactionPreviewContent_1.default {...props}/>
                </react_native_1.View>
            </ThemeStylesProvider_1.default>
        </ThemeProvider_1.default>);
}
// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
var Default = Template.bind({});
exports.Default = Default;
var NoMerchant = Template.bind({});
exports.NoMerchant = NoMerchant;
var CategoriesAndTag = Template.bind({});
exports.CategoriesAndTag = CategoriesAndTag;
var KeepButtonCategoriesAndTag = Template.bind({});
exports.KeepButtonCategoriesAndTag = KeepButtonCategoriesAndTag;
var KeepButtonRBRCategoriesAndTag = Template.bind({});
exports.KeepButtonRBRCategoriesAndTag = KeepButtonRBRCategoriesAndTag;
var KeepButtonSplitRBRCategoriesAndTag = Template.bind({});
exports.KeepButtonSplitRBRCategoriesAndTag = KeepButtonSplitRBRCategoriesAndTag;
var DeletedKeepButtonSplitRBRCategoriesAndTag = Template.bind({});
exports.DeletedKeepButtonSplitRBRCategoriesAndTag = DeletedKeepButtonSplitRBRCategoriesAndTag;
var KeepButtonIOURbrCategoriesAndTag = Template.bind({});
exports.KeepButtonIOURbrCategoriesAndTag = KeepButtonIOURbrCategoriesAndTag;
var storiesTransactionData = { category: 'Grocery stores', tag: 'Food', merchant: 'Acme' };
NoMerchant.args = __assign(__assign({}, Default.args), { transaction: modifiedTransaction({}) });
CategoriesAndTag.args = __assign(__assign({}, Default.args), { transaction: modifiedTransaction(storiesTransactionData) });
KeepButtonCategoriesAndTag.args = __assign(__assign({}, CategoriesAndTag.args), { areThereDuplicates: true });
KeepButtonRBRCategoriesAndTag.args = __assign(__assign({}, KeepButtonCategoriesAndTag.args), { violations: violations_1.violationsR14932, transaction: modifiedTransaction(__assign(__assign({}, storiesTransactionData), { hold: true })) });
KeepButtonSplitRBRCategoriesAndTag.args = __assign(__assign({}, KeepButtonRBRCategoriesAndTag.args), { isBillSplit: true });
KeepButtonIOURbrCategoriesAndTag.args = __assign(__assign({}, KeepButtonRBRCategoriesAndTag.args), { report: iouReportWithModifiedType(CONST_1.default.REPORT.TYPE.IOU) });
DeletedKeepButtonSplitRBRCategoriesAndTag.args = __assign(__assign({}, KeepButtonSplitRBRCategoriesAndTag.args), { action: actionWithModifiedPendingAction(CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE) });
exports.default = story;
