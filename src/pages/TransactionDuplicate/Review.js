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
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
var Button_1 = require("@components/Button");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var useCurrentUserPersonalDetails_1 = require("@hooks/useCurrentUserPersonalDetails");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useTransactionViolations_1 = require("@hooks/useTransactionViolations");
var Transaction_1 = require("@libs/actions/Transaction");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var DuplicateTransactionsList_1 = require("./DuplicateTransactionsList");
function TransactionDuplicateReview() {
    var _a;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var route = (0, native_1.useRoute)();
    var currentPersonalDetails = (0, useCurrentUserPersonalDetails_1.default)();
    var report = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(route.params.threadReportID), { canBeMissing: true })[0];
    var reportAction = (0, ReportActionsUtils_1.getReportAction)(report === null || report === void 0 ? void 0 : report.parentReportID, report === null || report === void 0 ? void 0 : report.parentReportActionID);
    var transactionID = (_a = (0, ReportActionsUtils_1.getLinkedTransactionID)(reportAction, report === null || report === void 0 ? void 0 : report.reportID)) !== null && _a !== void 0 ? _a : undefined;
    var transactionViolations = (0, useTransactionViolations_1.default)(transactionID);
    var duplicateTransactionIDs = (0, react_1.useMemo)(function () { var _a, _b, _c; return (_c = (_b = (_a = transactionViolations === null || transactionViolations === void 0 ? void 0 : transactionViolations.find(function (violation) { return violation.name === CONST_1.default.VIOLATIONS.DUPLICATED_TRANSACTION; })) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.duplicates) !== null && _c !== void 0 ? _c : []; }, [transactionViolations]);
    var transactionIDs = transactionID ? __spreadArray([transactionID], duplicateTransactionIDs, true) : duplicateTransactionIDs;
    var transactions = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION), {
        selector: function (allTransactions) {
            return transactionIDs
                .map(function (id) { return allTransactions === null || allTransactions === void 0 ? void 0 : allTransactions["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(id)]; })
                .sort(function (a, b) { var _a, _b; return new Date((_a = a === null || a === void 0 ? void 0 : a.created) !== null && _a !== void 0 ? _a : '').getTime() - new Date((_b = b === null || b === void 0 ? void 0 : b.created) !== null && _b !== void 0 ? _b : '').getTime(); });
        },
        canBeMissing: true,
    })[0];
    var keepAll = function () {
        (0, Transaction_1.dismissDuplicateTransactionViolation)(transactionIDs, currentPersonalDetails);
        Navigation_1.default.goBack();
    };
    var hasSettledOrApprovedTransaction = transactions === null || transactions === void 0 ? void 0 : transactions.some(function (transaction) { return (0, ReportUtils_1.isSettled)(transaction === null || transaction === void 0 ? void 0 : transaction.reportID) || (0, ReportUtils_1.isReportIDApproved)(transaction === null || transaction === void 0 ? void 0 : transaction.reportID); });
    return (<ScreenWrapper_1.default testID={TransactionDuplicateReview.displayName}>
            <FullPageNotFoundView_1.default shouldShow={!transactionID}>
                <HeaderWithBackButton_1.default title={translate('iou.reviewDuplicates')} onBackButtonPress={function () { return Navigation_1.default.goBack(route.params.backTo); }}/>
                <react_native_1.View style={[styles.justifyContentCenter, styles.ph5, styles.pb3, styles.borderBottom]}>
                    <Button_1.default text={translate('iou.keepAll')} onPress={keepAll}/>
                    {!!hasSettledOrApprovedTransaction && <Text_1.default style={[styles.textNormal, styles.colorMuted, styles.mt3]}>{translate('iou.someDuplicatesArePaid')}</Text_1.default>}
                </react_native_1.View>
                <DuplicateTransactionsList_1.default transactions={transactions !== null && transactions !== void 0 ? transactions : []}/>
            </FullPageNotFoundView_1.default>
        </ScreenWrapper_1.default>);
}
TransactionDuplicateReview.displayName = 'TransactionDuplicateReview';
exports.default = TransactionDuplicateReview;
