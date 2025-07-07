"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var TextInput_1 = require("@components/TextInput");
var useAutoFocusInput_1 = require("@hooks/useAutoFocusInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var WorkspaceReportFieldUtils_1 = require("@libs/WorkspaceReportFieldUtils");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var withPolicyAndFullscreenLoading_1 = require("@pages/workspace/withPolicyAndFullscreenLoading");
var ReportField_1 = require("@userActions/Policy/ReportField");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var WorkspaceReportFieldForm_1 = require("@src/types/form/WorkspaceReportFieldForm");
function ReportFieldsEditValuePage(_a) {
    var _b, _c;
    var policy = _a.policy, _d = _a.route.params, policyID = _d.policyID, valueIndex = _d.valueIndex;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var formDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT)[0];
    var currentValueName = (_c = (_b = formDraft === null || formDraft === void 0 ? void 0 : formDraft.listValues) === null || _b === void 0 ? void 0 : _b[valueIndex]) !== null && _c !== void 0 ? _c : '';
    var validate = (0, react_1.useCallback)(function (values) { var _a; return (0, WorkspaceReportFieldUtils_1.validateReportFieldListValueName)(values[WorkspaceReportFieldForm_1.default.NEW_VALUE_NAME].trim(), currentValueName, (_a = formDraft === null || formDraft === void 0 ? void 0 : formDraft[WorkspaceReportFieldForm_1.default.LIST_VALUES]) !== null && _a !== void 0 ? _a : [], WorkspaceReportFieldForm_1.default.NEW_VALUE_NAME); }, [currentValueName, formDraft]);
    var editValue = (0, react_1.useCallback)(function (values) {
        var _a;
        var valueName = (_a = values[WorkspaceReportFieldForm_1.default.NEW_VALUE_NAME]) === null || _a === void 0 ? void 0 : _a.trim();
        if (currentValueName !== valueName) {
            (0, ReportField_1.renameReportFieldsListValue)(valueIndex, valueName);
        }
        react_native_1.Keyboard.dismiss();
        Navigation_1.default.goBack();
    }, [currentValueName, valueIndex]);
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_REPORT_FIELDS_ENABLED} shouldBeBlocked={(0, PolicyUtils_1.hasAccountingConnections)(policy)}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding style={styles.defaultModalContainer} testID={ReportFieldsEditValuePage.displayName} shouldEnableMaxHeight>
                <HeaderWithBackButton_1.default title={translate('workspace.reportFields.editValue')} onBackButtonPress={Navigation_1.default.goBack}/>
                <FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.WORKSPACE_REPORT_FIELDS_FORM} onSubmit={editValue} submitButtonText={translate('common.save')} validate={validate} style={[styles.mh5, styles.flex1]} enabledWhenOffline shouldHideFixErrorsAlert addBottomSafeAreaPadding>
                    <InputWrapper_1.default InputComponent={TextInput_1.default} defaultValue={currentValueName} label={translate('common.value')} accessibilityLabel={translate('common.value')} inputID={WorkspaceReportFieldForm_1.default.NEW_VALUE_NAME} role={CONST_1.default.ROLE.PRESENTATION} ref={inputCallbackRef}/>
                </FormProvider_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
ReportFieldsEditValuePage.displayName = 'ReportFieldsEditValuePage';
exports.default = (0, withPolicyAndFullscreenLoading_1.default)(ReportFieldsEditValuePage);
