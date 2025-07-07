"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var ConfirmModal_1 = require("@components/ConfirmModal");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons = require("@components/Icon/Expensicons");
var MenuItem_1 = require("@components/MenuItem");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Switch_1 = require("@components/Switch");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePrevious_1 = require("@hooks/usePrevious");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ReportField = require("@libs/actions/Policy/ReportField");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils = require("@libs/PolicyUtils");
var ReportUtils = require("@libs/ReportUtils");
var NotFoundPage_1 = require("@pages/ErrorPage/NotFoundPage");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var withPolicyAndFullscreenLoading_1 = require("@pages/workspace/withPolicyAndFullscreenLoading");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function ReportFieldsValueSettingsPage(_a) {
    var policy = _a.policy, _b = _a.route.params, policyID = _b.policyID, valueIndex = _b.valueIndex, reportFieldID = _b.reportFieldID;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var formDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT)[0];
    var _c = (0, react_1.useState)(false), isDeleteTagModalOpen = _c[0], setIsDeleteTagModalOpen = _c[1];
    var _d = (0, react_1.useMemo)(function () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        var reportFieldValue;
        var reportFieldDisabledValue;
        if (reportFieldID) {
            var reportFieldKey = ReportUtils.getReportFieldKey(reportFieldID);
            reportFieldValue = (_e = (_d = Object.values((_c = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.fieldList) === null || _a === void 0 ? void 0 : _a[reportFieldKey]) === null || _b === void 0 ? void 0 : _b.values) !== null && _c !== void 0 ? _c : {})) === null || _d === void 0 ? void 0 : _d.at(valueIndex)) !== null && _e !== void 0 ? _e : '';
            reportFieldDisabledValue = (_k = (_j = Object.values((_h = (_g = (_f = policy === null || policy === void 0 ? void 0 : policy.fieldList) === null || _f === void 0 ? void 0 : _f[reportFieldKey]) === null || _g === void 0 ? void 0 : _g.disabledOptions) !== null && _h !== void 0 ? _h : {})) === null || _j === void 0 ? void 0 : _j.at(valueIndex)) !== null && _k !== void 0 ? _k : false;
        }
        else {
            reportFieldValue = (_m = (_l = formDraft === null || formDraft === void 0 ? void 0 : formDraft.listValues) === null || _l === void 0 ? void 0 : _l[valueIndex]) !== null && _m !== void 0 ? _m : '';
            reportFieldDisabledValue = (_p = (_o = formDraft === null || formDraft === void 0 ? void 0 : formDraft.disabledListValues) === null || _o === void 0 ? void 0 : _o[valueIndex]) !== null && _p !== void 0 ? _p : false;
        }
        return [reportFieldValue, reportFieldDisabledValue];
    }, [formDraft === null || formDraft === void 0 ? void 0 : formDraft.disabledListValues, formDraft === null || formDraft === void 0 ? void 0 : formDraft.listValues, policy === null || policy === void 0 ? void 0 : policy.fieldList, reportFieldID, valueIndex]), currentValueName = _d[0], currentValueDisabled = _d[1];
    var hasAccountingConnections = PolicyUtils.hasAccountingConnections(policy);
    var oldValueName = (0, usePrevious_1.default)(currentValueName);
    if ((!currentValueName && !oldValueName) || hasAccountingConnections) {
        return <NotFoundPage_1.default />;
    }
    var deleteListValueAndHideModal = function () {
        if (reportFieldID) {
            ReportField.removeReportFieldListValue(policyID, reportFieldID, [valueIndex]);
        }
        else {
            ReportField.deleteReportFieldsListValue([valueIndex]);
        }
        setIsDeleteTagModalOpen(false);
        Navigation_1.default.goBack();
    };
    var updateListValueEnabled = function (value) {
        if (reportFieldID) {
            ReportField.updateReportFieldListValueEnabled(policyID, reportFieldID, [Number(valueIndex)], value);
            return;
        }
        ReportField.setReportFieldsListValueEnabled([valueIndex], value);
    };
    var navigateToEditValue = function () {
        Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_REPORT_FIELDS_EDIT_VALUE.getRoute(policyID, valueIndex));
    };
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_REPORT_FIELDS_ENABLED}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding style={styles.defaultModalContainer} testID={ReportFieldsValueSettingsPage.displayName}>
                <HeaderWithBackButton_1.default title={currentValueName !== null && currentValueName !== void 0 ? currentValueName : oldValueName} shouldSetModalVisibility={false}/>
                <ConfirmModal_1.default title={translate('workspace.reportFields.deleteValue')} isVisible={isDeleteTagModalOpen} onConfirm={deleteListValueAndHideModal} onCancel={function () { return setIsDeleteTagModalOpen(false); }} shouldSetModalVisibility={false} prompt={translate('workspace.reportFields.deleteValuePrompt')} confirmText={translate('common.delete')} cancelText={translate('common.cancel')} danger/>
                <react_native_1.View style={styles.flexGrow1}>
                    <react_native_1.View style={[styles.mt2, styles.mh5]}>
                        <react_native_1.View style={[styles.flexRow, styles.mb5, styles.mr2, styles.alignItemsCenter, styles.justifyContentBetween]}>
                            <Text_1.default>{translate('workspace.reportFields.enableValue')}</Text_1.default>
                            <Switch_1.default isOn={!currentValueDisabled} accessibilityLabel={translate('workspace.reportFields.enableValue')} onToggle={updateListValueEnabled}/>
                        </react_native_1.View>
                    </react_native_1.View>
                    <MenuItemWithTopDescription_1.default title={currentValueName !== null && currentValueName !== void 0 ? currentValueName : oldValueName} description={translate('common.value')} shouldShowRightIcon={!reportFieldID} interactive={!reportFieldID} onPress={navigateToEditValue}/>
                    <MenuItem_1.default icon={Expensicons.Trashcan} title={translate('common.delete')} onPress={function () { return setIsDeleteTagModalOpen(true); }}/>
                </react_native_1.View>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
ReportFieldsValueSettingsPage.displayName = 'ReportFieldsValueSettingsPage';
exports.default = (0, withPolicyAndFullscreenLoading_1.default)(ReportFieldsValueSettingsPage);
