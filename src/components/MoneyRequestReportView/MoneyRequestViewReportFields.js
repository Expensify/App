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
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Report_1 = require("@libs/actions/Report");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportUtils_1 = require("@libs/ReportUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function ReportFieldView(reportField, report, styles, pendingAction) {
    var _a;
    return (<OfflineWithFeedback_1.default 
    // Need to return undefined when we have pendingAction to avoid the duplicate pending action
    pendingAction={pendingAction ? undefined : (_a = report === null || report === void 0 ? void 0 : report.pendingFields) === null || _a === void 0 ? void 0 : _a[reportField.fieldKey]} errorRowStyles={styles.ph5} key={"menuItem-".concat(reportField.fieldKey)} onClose={function () { return (0, Report_1.clearReportFieldKeyErrors)(report === null || report === void 0 ? void 0 : report.reportID, reportField.fieldKey); }}>
            <MenuItemWithTopDescription_1.default description={expensify_common_1.Str.UCFirst(reportField.name)} title={reportField.fieldValue} onPress={function () {
            Navigation_1.default.navigate(ROUTES_1.default.EDIT_REPORT_FIELD_REQUEST.getRoute(report === null || report === void 0 ? void 0 : report.reportID, report === null || report === void 0 ? void 0 : report.policyID, reportField.fieldID, Navigation_1.default.getActiveRoute()));
        }} shouldShowRightIcon={!reportField.isFieldDisabled} wrapperStyle={[styles.pv2, styles.taskDescriptionMenuItem]} shouldGreyOutWhenDisabled={false} numberOfLinesTitle={0} interactive={!reportField.isFieldDisabled} shouldStackHorizontally={false} onSecondaryInteraction={function () { }} titleWithTooltips={[]} brickRoadIndicator={reportField.violation ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined} errorText={reportField.violationTranslation}/>
        </OfflineWithFeedback_1.default>);
}
function MoneyRequestViewReportFields(_a) {
    var report = _a.report, policy = _a.policy, _b = _a.isCombinedReport, isCombinedReport = _b === void 0 ? false : _b, pendingAction = _a.pendingAction;
    var styles = (0, useThemeStyles_1.default)();
    var violations = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_VIOLATIONS).concat(report === null || report === void 0 ? void 0 : report.reportID), { canBeMissing: true })[0];
    var shouldHideSingleReportField = function (reportField) {
        var _a;
        var fieldValue = (_a = reportField.value) !== null && _a !== void 0 ? _a : reportField.defaultValue;
        var hasEnableOption = reportField.type !== CONST_1.default.REPORT_FIELD_TYPES.LIST || reportField.disabledOptions.some(function (option) { return !option; });
        return (0, ReportUtils_1.isReportFieldOfTypeTitle)(reportField) || (!fieldValue && !hasEnableOption);
    };
    var sortedPolicyReportFields = (0, react_1.useMemo)(function () {
        var _a;
        var fields = (0, ReportUtils_1.getAvailableReportFields)(report, Object.values((_a = policy === null || policy === void 0 ? void 0 : policy.fieldList) !== null && _a !== void 0 ? _a : {}));
        return fields
            .filter(function (field) { return field.target === (report === null || report === void 0 ? void 0 : report.type); })
            .filter(function (reportField) { return !shouldHideSingleReportField(reportField); })
            .sort(function (_a, _b) {
            var firstOrderWeight = _a.orderWeight;
            var secondOrderWeight = _b.orderWeight;
            return firstOrderWeight - secondOrderWeight;
        })
            .map(function (field) {
            var _a;
            var fieldValue = (_a = field.value) !== null && _a !== void 0 ? _a : field.defaultValue;
            var isFieldDisabled = (0, ReportUtils_1.isReportFieldDisabled)(report, field, policy);
            var fieldKey = (0, ReportUtils_1.getReportFieldKey)(field.fieldID);
            var violation = (0, ReportUtils_1.getFieldViolation)(violations, field);
            var violationTranslation = (0, ReportUtils_1.getFieldViolationTranslation)(field, violation);
            return __assign(__assign({}, field), { fieldValue: fieldValue, isFieldDisabled: isFieldDisabled, fieldKey: fieldKey, violation: violation, violationTranslation: violationTranslation });
        });
    }, [policy, report, violations]);
    var enabledReportFields = sortedPolicyReportFields.filter(function (reportField) { return !(0, ReportUtils_1.isReportFieldDisabled)(report, reportField, policy); });
    var isOnlyTitleFieldEnabled = enabledReportFields.length === 1 && (0, ReportUtils_1.isReportFieldOfTypeTitle)(enabledReportFields.at(0));
    var isPaidGroupPolicyExpenseReport = (0, ReportUtils_1.isPaidGroupPolicyExpenseReport)(report);
    var isInvoiceReport = (0, ReportUtils_1.isInvoiceReport)(report);
    var shouldDisplayReportFields = (isPaidGroupPolicyExpenseReport || isInvoiceReport) && (policy === null || policy === void 0 ? void 0 : policy.areReportFieldsEnabled) && (!isOnlyTitleFieldEnabled || !isCombinedReport);
    return (shouldDisplayReportFields &&
        sortedPolicyReportFields.map(function (reportField) {
            return ReportFieldView(reportField, report, styles, pendingAction);
        }));
}
MoneyRequestViewReportFields.displayName = 'MoneyRequestViewReportFields';
exports.default = MoneyRequestViewReportFields;
