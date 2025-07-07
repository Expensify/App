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
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
var ConfirmModal_1 = require("@components/ConfirmModal");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons = require("@components/Icon/Expensicons");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useThreeDotsAnchorPosition_1 = require("@hooks/useThreeDotsAnchorPosition");
var Report_1 = require("@libs/actions/Report");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportUtils_1 = require("@libs/ReportUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EditReportFieldDate_1 = require("./EditReportFieldDate");
var EditReportFieldDropdown_1 = require("./EditReportFieldDropdown");
var EditReportFieldText_1 = require("./EditReportFieldText");
function EditReportFieldPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h;
    var route = _a.route;
    var styles = (0, useThemeStyles_1.default)();
    var threeDotsAnchorPosition = (0, useThreeDotsAnchorPosition_1.default)(styles.threeDotsPopoverOffsetNoCloseButton);
    var _j = route.params, backTo = _j.backTo, reportID = _j.reportID, policyID = _j.policyID;
    var fieldKey = (0, ReportUtils_1.getReportFieldKey)(route.params.fieldID);
    var report = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID))[0];
    var policy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID))[0];
    var reportField = (_c = (_b = report === null || report === void 0 ? void 0 : report.fieldList) === null || _b === void 0 ? void 0 : _b[fieldKey]) !== null && _c !== void 0 ? _c : (_d = policy === null || policy === void 0 ? void 0 : policy.fieldList) === null || _d === void 0 ? void 0 : _d[fieldKey];
    var policyField = (_f = (_e = policy === null || policy === void 0 ? void 0 : policy.fieldList) === null || _e === void 0 ? void 0 : _e[fieldKey]) !== null && _f !== void 0 ? _f : reportField;
    var isDisabled = (0, ReportUtils_1.isReportFieldDisabled)(report, reportField, policy);
    var _k = (0, react_1.useState)(false), isDeleteModalVisible = _k[0], setIsDeleteModalVisible = _k[1];
    var translate = (0, useLocalize_1.default)().translate;
    var isReportFieldTitle = (0, ReportUtils_1.isReportFieldOfTypeTitle)(reportField);
    var reportFieldsEnabled = (((0, ReportUtils_1.isPaidGroupPolicyExpenseReport)(report) || (0, ReportUtils_1.isInvoiceReport)(report)) && !!(policy === null || policy === void 0 ? void 0 : policy.areReportFieldsEnabled)) || isReportFieldTitle;
    if (!reportFieldsEnabled || !reportField || !policyField || !report || isDisabled) {
        return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom={false} shouldEnableMaxHeight testID={EditReportFieldPage.displayName}>
                <FullPageNotFoundView_1.default shouldShow/>
            </ScreenWrapper_1.default>);
    }
    var goBack = function () {
        if (isReportFieldTitle) {
            Navigation_1.default.goBack(ROUTES_1.default.REPORT_WITH_ID_DETAILS.getRoute(report.reportID, backTo));
            return;
        }
        Navigation_1.default.goBack(backTo);
    };
    var handleReportFieldChange = function (form) {
        var _a;
        var value = form[fieldKey];
        if (isReportFieldTitle) {
            (0, Report_1.updateReportName)(report.reportID, value, (_a = report.reportName) !== null && _a !== void 0 ? _a : '');
            goBack();
        }
        else {
            if (value !== '') {
                (0, Report_1.updateReportField)(report.reportID, __assign(__assign({}, reportField), { value: value }), reportField);
            }
            goBack();
        }
    };
    var handleReportFieldDelete = function () {
        (0, Report_1.deleteReportField)(report.reportID, reportField);
        setIsDeleteModalVisible(false);
        goBack();
    };
    var fieldValue = isReportFieldTitle ? ((_g = report.reportName) !== null && _g !== void 0 ? _g : '') : ((_h = reportField.value) !== null && _h !== void 0 ? _h : reportField.defaultValue);
    var menuItems = [];
    var isReportFieldDeletable = reportField.deletable && (reportField === null || reportField === void 0 ? void 0 : reportField.fieldID) !== CONST_1.default.REPORT_FIELD_TITLE_FIELD_ID;
    if (isReportFieldDeletable) {
        menuItems.push({ icon: Expensicons.Trashcan, text: translate('common.delete'), onSelected: function () { return setIsDeleteModalVisible(true); }, shouldCallAfterModalHide: true });
    }
    var fieldName = expensify_common_1.Str.UCFirst(reportField.name);
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom shouldEnableMaxHeight testID={EditReportFieldPage.displayName}>
            <HeaderWithBackButton_1.default title={fieldName} threeDotsMenuItems={menuItems} shouldShowThreeDotsButton={!!(menuItems === null || menuItems === void 0 ? void 0 : menuItems.length)} threeDotsAnchorPosition={threeDotsAnchorPosition} onBackButtonPress={goBack}/>

            <ConfirmModal_1.default title={translate('workspace.reportFields.delete')} isVisible={isDeleteModalVisible} onConfirm={handleReportFieldDelete} onCancel={function () { return setIsDeleteModalVisible(false); }} prompt={translate('workspace.reportFields.deleteConfirmation')} confirmText={translate('common.delete')} cancelText={translate('common.cancel')} danger shouldEnableNewFocusManagement/>

            {(reportField.type === 'text' || isReportFieldTitle) && (<EditReportFieldText_1.default fieldName={expensify_common_1.Str.UCFirst(reportField.name)} fieldKey={fieldKey} fieldValue={fieldValue} isRequired={!isReportFieldDeletable} onSubmit={handleReportFieldChange}/>)}

            {reportField.type === 'date' && (<EditReportFieldDate_1.default fieldName={expensify_common_1.Str.UCFirst(reportField.name)} fieldKey={fieldKey} fieldValue={fieldValue} isRequired={!reportField.deletable} onSubmit={handleReportFieldChange}/>)}

            {reportField.type === 'dropdown' && (<EditReportFieldDropdown_1.default fieldKey={fieldKey} fieldValue={fieldValue} fieldOptions={policyField.values.filter(function (_value, index) { return !policyField.disabledOptions.at(index); })} onSubmit={handleReportFieldChange}/>)}
        </ScreenWrapper_1.default>);
}
EditReportFieldPage.displayName = 'EditReportFieldPage';
exports.default = EditReportFieldPage;
