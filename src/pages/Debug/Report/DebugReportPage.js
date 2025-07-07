"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons = require("@components/Icon/Expensicons");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useReportIsArchived_1 = require("@hooks/useReportIsArchived");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Report_1 = require("@libs/actions/Report");
var DebugUtils_1 = require("@libs/DebugUtils");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var DebugTabNavigator_1 = require("@libs/Navigation/DebugTabNavigator");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportUtils_1 = require("@libs/ReportUtils");
var DebugDetails_1 = require("@pages/Debug/DebugDetails");
var DebugJSON_1 = require("@pages/Debug/DebugJSON");
var NotFoundPage_1 = require("@pages/ErrorPage/NotFoundPage");
var Debug_1 = require("@userActions/Debug");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var DebugReportActions_1 = require("./DebugReportActions");
function DebugReportPage(_a) {
    var reportID = _a.route.params.reportID;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var theme = (0, useTheme_1.default)();
    var report = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID), { canBeMissing: true })[0];
    var chatReport = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report === null || report === void 0 ? void 0 : report.chatReportID), { canBeMissing: true })[0];
    var reportActions = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID), { canBeMissing: true })[0];
    var transactions = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.TRANSACTION, { canBeMissing: true })[0];
    var transactionViolations = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS, { canBeMissing: true })[0];
    var reportAttributes = (0, useOnyx_1.default)(ONYXKEYS_1.default.DERIVED.REPORT_ATTRIBUTES, {
        selector: function (attributes) { var _a; return (_a = attributes === null || attributes === void 0 ? void 0 : attributes.reports) === null || _a === void 0 ? void 0 : _a[reportID]; },
        canBeMissing: true,
    })[0];
    var transactionID = DebugUtils_1.default.getTransactionID(report, reportActions);
    var isReportArchived = (0, useReportIsArchived_1.default)(reportID);
    var metadata = (0, react_1.useMemo)(function () {
        var _a, _b, _c;
        if (!report) {
            return [];
        }
        var shouldDisplayViolations = (0, ReportUtils_1.shouldDisplayViolationsRBRInLHN)(report, transactionViolations);
        var shouldDisplayReportViolations = (0, ReportUtils_1.isReportOwner)(report) && (0, ReportUtils_1.hasReportViolations)(reportID);
        var hasViolations = !!shouldDisplayViolations || shouldDisplayReportViolations;
        var _d = (_a = DebugUtils_1.default.getReasonAndReportActionForGBRInLHNRow(report, isReportArchived)) !== null && _a !== void 0 ? _a : {}, reasonGBR = _d.reason, reportActionGBR = _d.reportAction;
        var _e = (_c = DebugUtils_1.default.getReasonAndReportActionForRBRInLHNRow(report, chatReport, reportActions, transactions, hasViolations, (_b = reportAttributes === null || reportAttributes === void 0 ? void 0 : reportAttributes.reportErrors) !== null && _b !== void 0 ? _b : {}, isReportArchived)) !== null && _c !== void 0 ? _c : {}, reasonRBR = _e.reason, reportActionRBR = _e.reportAction;
        var hasRBR = !!reasonRBR;
        var hasGBR = !hasRBR && !!reasonGBR;
        var reasonLHN = DebugUtils_1.default.getReasonForShowingRowInLHN(report, chatReport, hasRBR, isReportArchived);
        return [
            {
                title: translate('debug.visibleInLHN'),
                subtitle: translate("debug.".concat(!!reasonLHN)),
                message: reasonLHN ? translate(reasonLHN) : undefined,
            },
            {
                title: translate('debug.GBR'),
                subtitle: translate("debug.".concat(hasGBR)),
                message: hasGBR ? translate(reasonGBR) : undefined,
                action: hasGBR && reportActionGBR
                    ? {
                        name: translate('common.view'),
                        callback: function () {
                            var _a, _b;
                            return Navigation_1.default.navigate(ROUTES_1.default.REPORT_WITH_ID.getRoute((_b = (_a = reportActionGBR.childReportID) !== null && _a !== void 0 ? _a : reportActionGBR.parentReportID) !== null && _b !== void 0 ? _b : report.reportID, reportActionGBR.childReportID ? undefined : reportActionGBR.reportActionID));
                        },
                    }
                    : undefined,
            },
            {
                title: translate('debug.RBR'),
                subtitle: translate("debug.".concat(hasRBR)),
                message: hasRBR ? translate(reasonRBR) : undefined,
                action: hasRBR && reportActionRBR
                    ? {
                        name: translate('common.view'),
                        callback: function () {
                            var _a, _b;
                            return Navigation_1.default.navigate(ROUTES_1.default.REPORT_WITH_ID.getRoute((_b = (_a = reportActionRBR.childReportID) !== null && _a !== void 0 ? _a : reportActionRBR.parentReportID) !== null && _b !== void 0 ? _b : report.reportID, reportActionRBR.childReportID ? undefined : reportActionRBR.reportActionID));
                        },
                    }
                    : undefined,
            },
        ];
    }, [chatReport, report, transactionViolations, reportID, reportActions, transactions, reportAttributes === null || reportAttributes === void 0 ? void 0 : reportAttributes.reportErrors, isReportArchived, translate]);
    var DebugDetailsTab = (0, react_1.useCallback)(function () { return (<DebugDetails_1.default formType={CONST_1.default.DEBUG.FORMS.REPORT} data={report} onSave={function (data) {
            Debug_1.default.setDebugData("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID), data);
        }} onDelete={function () {
            (0, Report_1.navigateToConciergeChatAndDeleteReport)(reportID, true, true);
        }} validate={DebugUtils_1.default.validateReportDraftProperty}>
                <react_native_1.View style={[styles.mb5, styles.ph5, styles.gap5]}>
                    {metadata === null || metadata === void 0 ? void 0 : metadata.map(function (_a) {
            var title = _a.title, subtitle = _a.subtitle, message = _a.message, action = _a.action;
            return (<react_native_1.View key={title} style={[StyleUtils.getBackgroundColorStyle(theme.cardBG), styles.p5, styles.br4, styles.flexColumn, styles.gap2]}>
                            <react_native_1.View style={[styles.flexRow, styles.justifyContentBetween]}>
                                <Text_1.default style={styles.h4}>{title}</Text_1.default>
                                <Text_1.default>{subtitle}</Text_1.default>
                            </react_native_1.View>
                            {!!message && <Text_1.default style={styles.textSupporting}>{message}</Text_1.default>}
                            {!!action && (<Button_1.default text={action.name} onPress={action.callback}/>)}
                        </react_native_1.View>);
        })}
                    <Button_1.default text={translate('debug.viewReport')} onPress={function () {
            Navigation_1.default.navigate(ROUTES_1.default.REPORT_WITH_ID.getRoute(reportID));
        }} icon={Expensicons.Eye}/>
                    {!!transactionID && (<Button_1.default text={translate('debug.viewTransaction')} onPress={function () {
                Navigation_1.default.navigate(ROUTES_1.default.DEBUG_TRANSACTION.getRoute(transactionID));
            }}/>)}
                </react_native_1.View>
            </DebugDetails_1.default>); }, [
        StyleUtils,
        metadata,
        report,
        reportID,
        styles.br4,
        styles.flexColumn,
        styles.flexRow,
        styles.gap2,
        styles.gap5,
        styles.h4,
        styles.justifyContentBetween,
        styles.mb5,
        styles.p5,
        styles.ph5,
        styles.textSupporting,
        theme.cardBG,
        transactionID,
        translate,
    ]);
    var DebugJSONTab = (0, react_1.useCallback)(function () { return <DebugJSON_1.default data={report !== null && report !== void 0 ? report : {}}/>; }, [report]);
    var DebugReportActionsTab = (0, react_1.useCallback)(function () { return <DebugReportActions_1.default reportID={reportID}/>; }, [reportID]);
    var routes = (0, react_1.useMemo)(function () { return [
        {
            name: CONST_1.default.DEBUG.DETAILS,
            component: DebugDetailsTab,
        },
        {
            name: CONST_1.default.DEBUG.JSON,
            component: DebugJSONTab,
        },
        {
            name: CONST_1.default.DEBUG.REPORT_ACTIONS,
            component: DebugReportActionsTab,
        },
    ]; }, [DebugDetailsTab, DebugJSONTab, DebugReportActionsTab]);
    if (!report) {
        return <NotFoundPage_1.default />;
    }
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom={false} shouldEnableKeyboardAvoidingView={false} shouldEnableMinHeight={(0, DeviceCapabilities_1.canUseTouchScreen)()} testID={DebugReportPage.displayName}>
            {function (_a) {
            var safeAreaPaddingBottomStyle = _a.safeAreaPaddingBottomStyle;
            return (<react_native_1.View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                    <HeaderWithBackButton_1.default title={"".concat(translate('debug.debug'), " - ").concat(translate('debug.report'))} onBackButtonPress={Navigation_1.default.goBack}/>
                    <DebugTabNavigator_1.default id={CONST_1.default.DEBUG.FORMS.REPORT} routes={routes}/>
                </react_native_1.View>);
        }}
        </ScreenWrapper_1.default>);
}
DebugReportPage.displayName = 'DebugReportPage';
exports.default = DebugReportPage;
