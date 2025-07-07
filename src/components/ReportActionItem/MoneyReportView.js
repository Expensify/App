"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_1 = require("react-native");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var SpacerView_1 = require("@components/SpacerView");
var Text_1 = require("@components/Text");
var UnreadActionIndicator_1 = require("@components/UnreadActionIndicator");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportUtils_1 = require("@libs/ReportUtils");
var AnimatedEmptyStateBackground_1 = require("@pages/home/report/AnimatedEmptyStateBackground");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var Report_1 = require("@src/libs/actions/Report");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function MoneyReportView(_a) {
    var _b;
    var report = _a.report, policy = _a.policy, _c = _a.isCombinedReport, isCombinedReport = _c === void 0 ? false : _c, _d = _a.shouldShowTotal, shouldShowTotal = _d === void 0 ? true : _d, shouldHideThreadDividerLine = _a.shouldHideThreadDividerLine, pendingAction = _a.pendingAction;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var isSettled = (0, ReportUtils_1.isSettled)(report === null || report === void 0 ? void 0 : report.reportID);
    var isTotalUpdated = (0, ReportUtils_1.hasUpdatedTotal)(report, policy);
    var _e = (0, ReportUtils_1.getMoneyRequestSpendBreakdown)(report), totalDisplaySpend = _e.totalDisplaySpend, nonReimbursableSpend = _e.nonReimbursableSpend, reimbursableSpend = _e.reimbursableSpend;
    var shouldShowBreakdown = nonReimbursableSpend && reimbursableSpend && shouldShowTotal;
    var formattedTotalAmount = (0, CurrencyUtils_1.convertToDisplayString)(totalDisplaySpend, report === null || report === void 0 ? void 0 : report.currency);
    var formattedOutOfPocketAmount = (0, CurrencyUtils_1.convertToDisplayString)(reimbursableSpend, report === null || report === void 0 ? void 0 : report.currency);
    var formattedCompanySpendAmount = (0, CurrencyUtils_1.convertToDisplayString)(nonReimbursableSpend, report === null || report === void 0 ? void 0 : report.currency);
    var isPartiallyPaid = !!((_b = report === null || report === void 0 ? void 0 : report.pendingFields) === null || _b === void 0 ? void 0 : _b.partial);
    var subAmountTextStyles = [
        styles.taskTitleMenuItem,
        styles.alignSelfCenter,
        StyleUtils.getFontSizeStyle(variables_1.default.fontSizeH1),
        StyleUtils.getColorStyle(theme.textSupporting),
    ];
    var violations = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_VIOLATIONS).concat(report === null || report === void 0 ? void 0 : report.reportID), { canBeMissing: true })[0];
    var sortedPolicyReportFields = (0, react_1.useMemo)(function () {
        var _a;
        var fields = (0, ReportUtils_1.getAvailableReportFields)(report, Object.values((_a = policy === null || policy === void 0 ? void 0 : policy.fieldList) !== null && _a !== void 0 ? _a : {}));
        return fields.filter(function (field) { return field.target === (report === null || report === void 0 ? void 0 : report.type); }).sort(function (_a, _b) {
            var firstOrderWeight = _a.orderWeight;
            var secondOrderWeight = _b.orderWeight;
            return firstOrderWeight - secondOrderWeight;
        });
    }, [policy, report]);
    var enabledReportFields = sortedPolicyReportFields.filter(function (reportField) { return !(0, ReportUtils_1.isReportFieldDisabled)(report, reportField, policy); });
    var isOnlyTitleFieldEnabled = enabledReportFields.length === 1 && (0, ReportUtils_1.isReportFieldOfTypeTitle)(enabledReportFields.at(0));
    var isClosedExpenseReportWithNoExpenses = (0, ReportUtils_1.isClosedExpenseReportWithNoExpenses)(report);
    var isPaidGroupPolicyExpenseReport = (0, ReportUtils_1.isPaidGroupPolicyExpenseReport)(report);
    var isInvoiceReport = (0, ReportUtils_1.isInvoiceReport)(report);
    var shouldHideSingleReportField = function (reportField) {
        var _a;
        var fieldValue = (_a = reportField.value) !== null && _a !== void 0 ? _a : reportField.defaultValue;
        var hasEnableOption = reportField.type !== CONST_1.default.REPORT_FIELD_TYPES.LIST || reportField.disabledOptions.some(function (option) { return !option; });
        return (0, ReportUtils_1.isReportFieldOfTypeTitle)(reportField) || (!fieldValue && !hasEnableOption);
    };
    var shouldShowReportField = !isClosedExpenseReportWithNoExpenses &&
        (isPaidGroupPolicyExpenseReport || isInvoiceReport) &&
        (!isCombinedReport || !isOnlyTitleFieldEnabled) &&
        !sortedPolicyReportFields.every(shouldHideSingleReportField);
    var renderThreadDivider = (0, react_1.useMemo)(function () {
        return shouldHideThreadDividerLine ? (<UnreadActionIndicator_1.default reportActionID={report === null || report === void 0 ? void 0 : report.reportID} shouldHideThreadDividerLine={shouldHideThreadDividerLine}/>) : (<SpacerView_1.default shouldShow style={styles.reportHorizontalRule}/>);
    }, [shouldHideThreadDividerLine, report === null || report === void 0 ? void 0 : report.reportID, styles.reportHorizontalRule]);
    return (<>
            <react_native_1.View style={[styles.pRelative]}>
                <AnimatedEmptyStateBackground_1.default />
                {!isClosedExpenseReportWithNoExpenses && (<>
                        {(isPaidGroupPolicyExpenseReport || isInvoiceReport) &&
                (policy === null || policy === void 0 ? void 0 : policy.areReportFieldsEnabled) &&
                (!isCombinedReport || !isOnlyTitleFieldEnabled) &&
                sortedPolicyReportFields.map(function (reportField) {
                    var _a, _b, _c;
                    if (shouldHideSingleReportField(reportField)) {
                        return null;
                    }
                    var fieldValue = (_a = reportField.value) !== null && _a !== void 0 ? _a : reportField.defaultValue;
                    var isFieldDisabled = (0, ReportUtils_1.isReportFieldDisabled)(report, reportField, policy);
                    var fieldKey = (0, ReportUtils_1.getReportFieldKey)(reportField.fieldID);
                    var violation = (0, ReportUtils_1.getFieldViolation)(violations, reportField);
                    var violationTranslation = (0, ReportUtils_1.getFieldViolationTranslation)(reportField, violation);
                    return (<OfflineWithFeedback_1.default 
                    // Need to return undefined when we have pendingAction to avoid the duplicate pending action
                    pendingAction={pendingAction ? undefined : (_b = report === null || report === void 0 ? void 0 : report.pendingFields) === null || _b === void 0 ? void 0 : _b[fieldKey]} errors={(_c = report === null || report === void 0 ? void 0 : report.errorFields) === null || _c === void 0 ? void 0 : _c[fieldKey]} errorRowStyles={styles.ph5} key={"menuItem-".concat(fieldKey)} onClose={function () { return (0, Report_1.clearReportFieldKeyErrors)(report === null || report === void 0 ? void 0 : report.reportID, fieldKey); }}>
                                        <MenuItemWithTopDescription_1.default description={expensify_common_1.Str.UCFirst(reportField.name)} title={fieldValue} onPress={function () {
                            Navigation_1.default.navigate(ROUTES_1.default.EDIT_REPORT_FIELD_REQUEST.getRoute(report === null || report === void 0 ? void 0 : report.reportID, report === null || report === void 0 ? void 0 : report.policyID, reportField.fieldID, Navigation_1.default.getReportRHPActiveRoute()));
                        }} shouldShowRightIcon={!isFieldDisabled} wrapperStyle={[styles.pv2, styles.taskDescriptionMenuItem]} shouldGreyOutWhenDisabled={false} numberOfLinesTitle={0} interactive={!isFieldDisabled} shouldStackHorizontally={false} onSecondaryInteraction={function () { }} titleWithTooltips={[]} brickRoadIndicator={violation ? 'error' : undefined} errorText={violationTranslation}/>
                                    </OfflineWithFeedback_1.default>);
                })}
                        {shouldShowTotal && (<react_native_1.View style={[styles.flexRow, styles.pointerEventsNone, styles.containerWithSpaceBetween, styles.ph5, styles.pv2]}>
                                <react_native_1.View style={[styles.flex1, styles.justifyContentCenter]}>
                                    <Text_1.default style={[styles.textLabelSupporting]} numberOfLines={1}>
                                        {translate('common.total')}
                                    </Text_1.default>
                                </react_native_1.View>
                                <react_native_1.View style={[styles.flexRow, styles.justifyContentCenter]}>
                                    {isSettled && !isPartiallyPaid && (<react_native_1.View style={[styles.defaultCheckmarkWrapper, styles.mh2]}>
                                            <Icon_1.default src={Expensicons.Checkmark} fill={theme.success}/>
                                        </react_native_1.View>)}
                                    {!isTotalUpdated && !isOffline ? (<react_native_1.ActivityIndicator size="small" style={[styles.moneyRequestLoadingHeight]} color={theme.textSupporting}/>) : (<Text_1.default numberOfLines={1} style={[styles.taskTitleMenuItem, styles.alignSelfCenter, !isTotalUpdated && styles.offlineFeedback.pending]}>
                                            {formattedTotalAmount}
                                        </Text_1.default>)}
                                </react_native_1.View>
                            </react_native_1.View>)}

                        {!!shouldShowBreakdown && (<>
                                <react_native_1.View style={[styles.flexRow, styles.pointerEventsNone, styles.containerWithSpaceBetween, styles.ph5, styles.pv1]}>
                                    <react_native_1.View style={[styles.flex1, styles.justifyContentCenter]}>
                                        <Text_1.default style={[styles.textLabelSupporting]} numberOfLines={1}>
                                            {translate('cardTransactions.outOfPocket')}
                                        </Text_1.default>
                                    </react_native_1.View>
                                    <react_native_1.View style={[styles.flexRow, styles.justifyContentCenter]}>
                                        <Text_1.default numberOfLines={1} style={subAmountTextStyles}>
                                            {formattedOutOfPocketAmount}
                                        </Text_1.default>
                                    </react_native_1.View>
                                </react_native_1.View>
                                <react_native_1.View style={[styles.flexRow, styles.pointerEventsNone, styles.containerWithSpaceBetween, styles.ph5, styles.pv1]}>
                                    <react_native_1.View style={[styles.flex1, styles.justifyContentCenter]}>
                                        <Text_1.default style={[styles.textLabelSupporting]} numberOfLines={1}>
                                            {translate('cardTransactions.companySpend')}
                                        </Text_1.default>
                                    </react_native_1.View>
                                    <react_native_1.View style={[styles.flexRow, styles.justifyContentCenter]}>
                                        <Text_1.default numberOfLines={1} style={subAmountTextStyles}>
                                            {formattedCompanySpendAmount}
                                        </Text_1.default>
                                    </react_native_1.View>
                                </react_native_1.View>
                            </>)}
                    </>)}
            </react_native_1.View>
            {(shouldShowReportField || shouldShowBreakdown || shouldShowTotal) && renderThreadDivider}
        </>);
}
MoneyReportView.displayName = 'MoneyReportView';
exports.default = MoneyReportView;
