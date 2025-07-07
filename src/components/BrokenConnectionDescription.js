"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useTransactionViolations_1 = require("@hooks/useTransactionViolations");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var Navigation_1 = require("@navigation/Navigation");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
var TextLink_1 = require("./TextLink");
function BrokenConnectionDescription(_a) {
    var transactionID = _a.transactionID, policy = _a.policy, report = _a.report;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var transactionViolations = (0, useTransactionViolations_1.default)(transactionID);
    var brokenConnection530Error = transactionViolations === null || transactionViolations === void 0 ? void 0 : transactionViolations.find(function (violation) { var _a; return ((_a = violation.data) === null || _a === void 0 ? void 0 : _a.rterType) === CONST_1.default.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530; });
    var brokenConnectionError = transactionViolations === null || transactionViolations === void 0 ? void 0 : transactionViolations.find(function (violation) { var _a; return ((_a = violation.data) === null || _a === void 0 ? void 0 : _a.rterType) === CONST_1.default.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION; });
    var isPolicyAdmin = (0, PolicyUtils_1.isPolicyAdmin)(policy);
    if (!brokenConnection530Error && !brokenConnectionError) {
        return '';
    }
    if (brokenConnection530Error) {
        return translate('violations.brokenConnection530Error');
    }
    if (isPolicyAdmin && !(0, ReportUtils_1.isCurrentUserSubmitter)(report === null || report === void 0 ? void 0 : report.reportID)) {
        return (<>
                {"".concat(translate('violations.adminBrokenConnectionError'))}
                <TextLink_1.default style={[styles.textLabelSupporting, styles.link]} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_COMPANY_CARDS.getRoute(policy === null || policy === void 0 ? void 0 : policy.id)); }}>{"".concat(translate('workspace.common.companyCards'))}</TextLink_1.default>
                .
            </>);
    }
    if ((0, ReportUtils_1.isReportApproved)({ report: report }) || (0, ReportUtils_1.isReportManuallyReimbursed)(report)) {
        return translate('violations.memberBrokenConnectionError');
    }
    return "".concat(translate('violations.memberBrokenConnectionError'), " ").concat(translate('violations.markAsCashToIgnore'));
}
BrokenConnectionDescription.displayName = 'BrokenConnectionDescription';
exports.default = BrokenConnectionDescription;
