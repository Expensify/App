"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var TextInput_1 = require("@components/TextInput");
var useAutoFocusInput_1 = require("@hooks/useAutoFocusInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var WorkspaceReportFieldUtils_1 = require("@libs/WorkspaceReportFieldUtils");
var NotFoundPage_1 = require("@pages/ErrorPage/NotFoundPage");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var withPolicyAndFullscreenLoading_1 = require("@pages/workspace/withPolicyAndFullscreenLoading");
var ReportField_1 = require("@userActions/Policy/ReportField");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var WorkspaceReportFieldForm_1 = require("@src/types/form/WorkspaceReportFieldForm");
var ReportFieldsInitialListValuePicker_1 = require("./InitialListValueSelector/ReportFieldsInitialListValuePicker");
function ReportFieldsInitialValuePage(_a) {
    var _b, _c, _d;
    var policy = _a.policy, _e = _a.route.params, policyID = _e.policyID, reportFieldID = _e.reportFieldID;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var hasAccountingConnections = (0, PolicyUtils_1.hasAccountingConnections)(policy);
    var reportField = (_c = (_b = policy === null || policy === void 0 ? void 0 : policy.fieldList) === null || _b === void 0 ? void 0 : _b[(0, ReportUtils_1.getReportFieldKey)(reportFieldID)]) !== null && _c !== void 0 ? _c : null;
    var availableListValuesLength = ((_d = reportField === null || reportField === void 0 ? void 0 : reportField.disabledOptions) !== null && _d !== void 0 ? _d : []).filter(function (disabledListValue) { return !disabledListValue; }).length;
    var currentInitialValue = (0, WorkspaceReportFieldUtils_1.getReportFieldInitialValue)(reportField);
    var _f = (0, react_1.useState)(currentInitialValue), initialValue = _f[0], setInitialValue = _f[1];
    var submitForm = (0, react_1.useCallback)(function (values) {
        if (currentInitialValue !== values.initialValue) {
            (0, ReportField_1.updateReportFieldInitialValue)(policyID, reportFieldID, values.initialValue);
        }
        Navigation_1.default.goBack();
    }, [policyID, reportFieldID, currentInitialValue]);
    var submitListValueUpdate = function (value) {
        (0, ReportField_1.updateReportFieldInitialValue)(policyID, reportFieldID, currentInitialValue === value ? '' : value);
        Navigation_1.default.goBack();
    };
    var validateForm = (0, react_1.useCallback)(function (values) {
        var formInitialValue = values.initialValue;
        var errors = {};
        if ((reportField === null || reportField === void 0 ? void 0 : reportField.type) === CONST_1.default.REPORT_FIELD_TYPES.TEXT && formInitialValue.length > CONST_1.default.WORKSPACE_REPORT_FIELD_POLICY_MAX_LENGTH) {
            errors[WorkspaceReportFieldForm_1.default.INITIAL_VALUE] = translate('common.error.characterLimitExceedCounter', {
                length: formInitialValue.length,
                limit: CONST_1.default.WORKSPACE_REPORT_FIELD_POLICY_MAX_LENGTH,
            });
        }
        if ((reportField === null || reportField === void 0 ? void 0 : reportField.type) === CONST_1.default.REPORT_FIELD_TYPES.LIST && availableListValuesLength > 0 && !(0, ValidationUtils_1.isRequiredFulfilled)(formInitialValue)) {
            errors[WorkspaceReportFieldForm_1.default.INITIAL_VALUE] = translate('workspace.reportFields.reportFieldInitialValueRequiredError');
        }
        return errors;
    }, [availableListValuesLength, reportField === null || reportField === void 0 ? void 0 : reportField.type, translate]);
    if (!reportField || hasAccountingConnections) {
        return <NotFoundPage_1.default />;
    }
    var isTextFieldType = reportField.type === CONST_1.default.REPORT_FIELD_TYPES.TEXT;
    var isListFieldType = reportField.type === CONST_1.default.REPORT_FIELD_TYPES.LIST;
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_REPORT_FIELDS_ENABLED}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding style={styles.defaultModalContainer} testID={ReportFieldsInitialValuePage.displayName} shouldEnableMaxHeight>
                <HeaderWithBackButton_1.default title={translate('common.initialValue')} onBackButtonPress={Navigation_1.default.goBack}/>
                {isListFieldType && (<react_native_1.View style={[styles.ph5, styles.pb4]}>
                        <Text_1.default style={[styles.sidebarLinkText, styles.optionAlternateText]}>{translate('workspace.reportFields.listValuesInputSubtitle')}</Text_1.default>
                    </react_native_1.View>)}

                {isTextFieldType && (<FormProvider_1.default addBottomSafeAreaPadding formID={ONYXKEYS_1.default.FORMS.WORKSPACE_REPORT_FIELDS_FORM} onSubmit={submitForm} submitButtonText={translate('common.save')} validate={validateForm} style={styles.flex1} enabledWhenOffline isSubmitButtonVisible={isTextFieldType} submitButtonStyles={styles.mh5} shouldHideFixErrorsAlert>
                        <InputWrapper_1.default containerStyles={styles.mh5} InputComponent={TextInput_1.default} inputID={WorkspaceReportFieldForm_1.default.INITIAL_VALUE} label={translate('common.initialValue')} accessibilityLabel={translate('workspace.editor.initialValueInputLabel')} multiline={false} value={initialValue} role={CONST_1.default.ROLE.PRESENTATION} ref={inputCallbackRef} onChangeText={setInitialValue}/>
                    </FormProvider_1.default>)}
                {isListFieldType && (<ReportFieldsInitialListValuePicker_1.default listValues={reportField.values} disabledOptions={reportField.disabledOptions} value={initialValue} onValueChange={submitListValueUpdate}/>)}
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
ReportFieldsInitialValuePage.displayName = 'ReportFieldsInitialValuePage';
exports.default = (0, withPolicyAndFullscreenLoading_1.default)(ReportFieldsInitialValuePage);
