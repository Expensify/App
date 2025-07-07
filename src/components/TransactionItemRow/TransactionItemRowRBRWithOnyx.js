"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Icon_1 = require("@components/Icon");
var Expensicons_1 = require("@components/Icon/Expensicons");
var RenderHTML_1 = require("@components/RenderHTML");
var useLocalize_1 = require("@hooks/useLocalize");
var usePaginatedReportActions_1 = require("@hooks/usePaginatedReportActions");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useTransactionViolations_1 = require("@hooks/useTransactionViolations");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var ViolationsUtils_1 = require("@libs/Violations/ViolationsUtils");
var variables_1 = require("@styles/variables");
function TransactionItemRowRBRWithOnyx(_a) {
    var _b;
    var transaction = _a.transaction, containerStyles = _a.containerStyles, missingFieldError = _a.missingFieldError;
    var styles = (0, useThemeStyles_1.default)();
    var transactionViolations = (0, useTransactionViolations_1.default)(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID);
    var translate = (0, useLocalize_1.default)().translate;
    var theme = (0, useTheme_1.default)();
    var transactionActions = (0, usePaginatedReportActions_1.default)(transaction.reportID).sortedAllReportActions;
    var transactionThreadId = transactionActions ? (_b = (0, ReportActionsUtils_1.getIOUActionForTransactionID)(transactionActions, transaction.transactionID)) === null || _b === void 0 ? void 0 : _b.childReportID : undefined;
    var transactionThreadActions = (0, usePaginatedReportActions_1.default)(transactionThreadId).sortedAllReportActions;
    var RBRMessages = ViolationsUtils_1.default.getRBRMessages(transaction, transactionViolations, translate, missingFieldError, transactionThreadActions);
    return (RBRMessages.length > 0 && (<react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1, containerStyles]} testID="TransactionItemRowRBRWithOnyx">
                <Icon_1.default src={Expensicons_1.DotIndicator} fill={theme.danger} height={variables_1.default.iconSizeExtraSmall} width={variables_1.default.iconSizeExtraSmall}/>
                <react_native_1.View style={[styles.pre, styles.flexShrink1, { color: theme.danger }]}>
                    <RenderHTML_1.default html={"<rbr shouldShowEllipsis=\"1\" issmall >".concat(RBRMessages, "</rbr>")}/>
                </react_native_1.View>
            </react_native_1.View>));
}
TransactionItemRowRBRWithOnyx.displayName = 'TransactionItemRowRBRWithOnyx';
exports.default = TransactionItemRowRBRWithOnyx;
