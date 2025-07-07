"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_1 = require("react-native");
var ConfirmModal_1 = require("@components/ConfirmModal");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons = require("@components/Icon/Expensicons");
var MenuItem_1 = require("@components/MenuItem");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var LocaleCompare_1 = require("@libs/LocaleCompare");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var WorkspaceReportFieldUtils_1 = require("@libs/WorkspaceReportFieldUtils");
var NotFoundPage_1 = require("@pages/ErrorPage/NotFoundPage");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var withPolicyAndFullscreenLoading_1 = require("@pages/workspace/withPolicyAndFullscreenLoading");
var ReportField_1 = require("@userActions/Policy/ReportField");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function ReportFieldsSettingsPage(_a) {
    var _b, _c, _d, _e, _f, _g;
    var policy = _a.policy, _h = _a.route.params, policyID = _h.policyID, reportFieldID = _h.reportFieldID;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var _j = (0, react_1.useState)(false), isDeleteModalVisible = _j[0], setIsDeleteModalVisible = _j[1];
    var hasAccountingConnections = (0, PolicyUtils_1.hasAccountingConnections)(policy);
    var reportFieldKey = (0, ReportUtils_1.getReportFieldKey)(reportFieldID);
    var reportField = (_c = (_b = policy === null || policy === void 0 ? void 0 : policy.fieldList) === null || _b === void 0 ? void 0 : _b[reportFieldKey]) !== null && _c !== void 0 ? _c : null;
    if (!reportField) {
        return <NotFoundPage_1.default />;
    }
    var isDateFieldType = reportField.type === CONST_1.default.REPORT_FIELD_TYPES.DATE;
    var isListFieldType = reportField.type === CONST_1.default.REPORT_FIELD_TYPES.LIST;
    var isListFieldEmpty = isListFieldType && reportField.disabledOptions.filter(function (disabledListValue) { return !disabledListValue; }).length <= 0;
    var listValues = (_g = Object.values((_f = (_e = (_d = policy === null || policy === void 0 ? void 0 : policy.fieldList) === null || _d === void 0 ? void 0 : _d[reportFieldKey]) === null || _e === void 0 ? void 0 : _e.values) !== null && _f !== void 0 ? _f : {})) === null || _g === void 0 ? void 0 : _g.sort(LocaleCompare_1.default);
    var deleteReportFieldAndHideModal = function () {
        (0, ReportField_1.deleteReportFields)(policyID, [reportFieldKey]);
        setIsDeleteModalVisible(false);
        Navigation_1.default.goBack();
    };
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_REPORT_FIELDS_ENABLED}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding style={[styles.defaultModalContainer]} testID={ReportFieldsSettingsPage.displayName}>
                <HeaderWithBackButton_1.default title={reportField.name} shouldSetModalVisibility={false}/>
                <ConfirmModal_1.default title={translate('workspace.reportFields.delete')} isVisible={isDeleteModalVisible && !hasAccountingConnections} onConfirm={deleteReportFieldAndHideModal} onCancel={function () { return setIsDeleteModalVisible(false); }} shouldSetModalVisibility={false} prompt={translate('workspace.reportFields.deleteConfirmation')} confirmText={translate('common.delete')} cancelText={translate('common.cancel')} danger/>
                <react_native_1.View style={styles.flexGrow1}>
                    <MenuItemWithTopDescription_1.default style={[styles.moneyRequestMenuItem]} titleStyle={styles.flex1} title={reportField.name} description={translate('common.name')} interactive={false}/>
                    <MenuItemWithTopDescription_1.default style={[styles.moneyRequestMenuItem]} titleStyle={styles.flex1} title={expensify_common_1.Str.recapitalize(translate((0, WorkspaceReportFieldUtils_1.getReportFieldTypeTranslationKey)(reportField.type)))} description={translate('common.type')} interactive={false}/>
                    {isListFieldType && (<MenuItemWithTopDescription_1.default style={[styles.moneyRequestMenuItem]} titleStyle={styles.flex1} description={translate('workspace.reportFields.listValues')} shouldShowRightIcon onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_REPORT_FIELDS_LIST_VALUES.getRoute(policyID, reportFieldID)); }} title={listValues.join(', ')} numberOfLinesTitle={5}/>)}
                    {!isListFieldEmpty && (<MenuItemWithTopDescription_1.default style={[styles.moneyRequestMenuItem]} titleStyle={styles.flex1} title={(0, WorkspaceReportFieldUtils_1.getReportFieldInitialValue)(reportField)} description={translate('common.initialValue')} shouldShowRightIcon={!isDateFieldType && !hasAccountingConnections} interactive={!isDateFieldType && !hasAccountingConnections} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_EDIT_REPORT_FIELDS_INITIAL_VALUE.getRoute(policyID, reportFieldID)); }}/>)}
                    {!hasAccountingConnections && (<react_native_1.View style={styles.flexGrow1}>
                            <MenuItem_1.default icon={Expensicons.Trashcan} title={translate('common.delete')} onPress={function () { return setIsDeleteModalVisible(true); }}/>
                        </react_native_1.View>)}
                </react_native_1.View>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
ReportFieldsSettingsPage.displayName = 'ReportFieldsSettingsPage';
exports.default = (0, withPolicyAndFullscreenLoading_1.default)(ReportFieldsSettingsPage);
