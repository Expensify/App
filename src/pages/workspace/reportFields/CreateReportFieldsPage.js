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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var TextPicker_1 = require("@components/TextPicker");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var DateUtils_1 = require("@libs/DateUtils");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var LocaleCompare_1 = require("@libs/LocaleCompare");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var withPolicyAndFullscreenLoading_1 = require("@pages/workspace/withPolicyAndFullscreenLoading");
var ReportField_1 = require("@userActions/Policy/ReportField");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var WorkspaceReportFieldForm_1 = require("@src/types/form/WorkspaceReportFieldForm");
var InitialListValueSelector_1 = require("./InitialListValueSelector");
var TypeSelector_1 = require("./TypeSelector");
var defaultDate = DateUtils_1.default.extractDate(new Date().toString());
function WorkspaceCreateReportFieldsPage(_a) {
    var _b, _c;
    var policy = _a.policy, policyID = _a.route.params.policyID;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var formRef = (0, react_1.useRef)(null);
    var formDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT, { canBeMissing: true })[0];
    var availableListValuesLength = ((_b = formDraft === null || formDraft === void 0 ? void 0 : formDraft[WorkspaceReportFieldForm_1.default.DISABLED_LIST_VALUES]) !== null && _b !== void 0 ? _b : []).filter(function (disabledListValue) { return !disabledListValue; }).length;
    var submitForm = (0, react_1.useCallback)(function (values) {
        (0, ReportField_1.createReportField)(policyID, {
            name: values[WorkspaceReportFieldForm_1.default.NAME],
            type: values[WorkspaceReportFieldForm_1.default.TYPE],
            initialValue: !(values[WorkspaceReportFieldForm_1.default.TYPE] === CONST_1.default.REPORT_FIELD_TYPES.LIST && availableListValuesLength === 0) ? values[WorkspaceReportFieldForm_1.default.INITIAL_VALUE] : '',
        });
        Navigation_1.default.goBack();
    }, [availableListValuesLength, policyID]);
    var validateForm = (0, react_1.useCallback)(function (values) {
        var _a;
        var name = values.name, type = values.type, formInitialValue = values.initialValue;
        var errors = {};
        if (!(0, ValidationUtils_1.isRequiredFulfilled)(name)) {
            errors[WorkspaceReportFieldForm_1.default.NAME] = translate('workspace.reportFields.reportFieldNameRequiredError');
        }
        else if (Object.values((_a = policy === null || policy === void 0 ? void 0 : policy.fieldList) !== null && _a !== void 0 ? _a : {}).some(function (reportField) { return reportField.name === name; })) {
            errors[WorkspaceReportFieldForm_1.default.NAME] = translate('workspace.reportFields.existingReportFieldNameError');
        }
        else if (__spreadArray([], name, true).length > CONST_1.default.WORKSPACE_REPORT_FIELD_POLICY_MAX_LENGTH) {
            // Uses the spread syntax to count the number of Unicode code points instead of the number of UTF-16 code units.
            (0, ErrorUtils_1.addErrorMessage)(errors, WorkspaceReportFieldForm_1.default.NAME, translate('common.error.characterLimitExceedCounter', { length: __spreadArray([], name, true).length, limit: CONST_1.default.WORKSPACE_REPORT_FIELD_POLICY_MAX_LENGTH }));
        }
        if (!(0, ValidationUtils_1.isRequiredFulfilled)(type)) {
            errors[WorkspaceReportFieldForm_1.default.TYPE] = translate('workspace.reportFields.reportFieldTypeRequiredError');
        }
        // formInitialValue can be undefined because the InitialValue component is rendered conditionally.
        // If it's not been rendered when the validation is executed, formInitialValue will be undefined.
        if (type === CONST_1.default.REPORT_FIELD_TYPES.TEXT && !!formInitialValue && formInitialValue.length > CONST_1.default.WORKSPACE_REPORT_FIELD_POLICY_MAX_LENGTH) {
            errors[WorkspaceReportFieldForm_1.default.INITIAL_VALUE] = translate('common.error.characterLimitExceedCounter', {
                length: formInitialValue.length,
                limit: CONST_1.default.WORKSPACE_REPORT_FIELD_POLICY_MAX_LENGTH,
            });
        }
        if (type === CONST_1.default.REPORT_FIELD_TYPES.LIST && availableListValuesLength > 0 && !(0, ValidationUtils_1.isRequiredFulfilled)(formInitialValue)) {
            errors[WorkspaceReportFieldForm_1.default.INITIAL_VALUE] = translate('workspace.reportFields.reportFieldInitialValueRequiredError');
        }
        return errors;
    }, [availableListValuesLength, policy === null || policy === void 0 ? void 0 : policy.fieldList, translate]);
    (0, react_1.useEffect)(function () {
        (0, ReportField_1.setInitialCreateReportFieldsForm)();
    }, []);
    var modal = (0, useOnyx_1.default)(ONYXKEYS_1.default.MODAL, { canBeMissing: true })[0];
    var listValues = __spreadArray([], ((_c = formDraft === null || formDraft === void 0 ? void 0 : formDraft[WorkspaceReportFieldForm_1.default.LIST_VALUES]) !== null && _c !== void 0 ? _c : []), true).sort(LocaleCompare_1.default).join(', ');
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_REPORT_FIELDS_ENABLED} shouldBeBlocked={(0, PolicyUtils_1.hasAccountingConnections)(policy)}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding style={styles.defaultModalContainer} testID={WorkspaceCreateReportFieldsPage.displayName} shouldEnableMaxHeight>
                <HeaderWithBackButton_1.default title={translate('workspace.reportFields.addField')} onBackButtonPress={Navigation_1.default.goBack}/>
                <FormProvider_1.default ref={formRef} style={[styles.mh5, styles.flex1]} formID={ONYXKEYS_1.default.FORMS.WORKSPACE_REPORT_FIELDS_FORM} onSubmit={submitForm} validate={validateForm} submitButtonText={translate('common.save')} enabledWhenOffline shouldValidateOnBlur={false} disablePressOnEnter={!!(modal === null || modal === void 0 ? void 0 : modal.isVisible)} addBottomSafeAreaPadding>
                    {function (_a) {
            var inputValues = _a.inputValues;
            return (<react_native_1.View style={styles.mhn5}>
                            <InputWrapper_1.default InputComponent={TextPicker_1.default} inputID={WorkspaceReportFieldForm_1.default.NAME} label={translate('common.name')} subtitle={translate('workspace.reportFields.nameInputSubtitle')} description={translate('common.name')} rightLabel={translate('common.required')} accessibilityLabel={translate('workspace.editor.nameInputLabel')} maxLength={CONST_1.default.WORKSPACE_REPORT_FIELD_POLICY_MAX_LENGTH} multiline={false} role={CONST_1.default.ROLE.PRESENTATION} required/>
                            <InputWrapper_1.default InputComponent={TypeSelector_1.default} inputID={WorkspaceReportFieldForm_1.default.TYPE} label={translate('common.type')} subtitle={translate('workspace.reportFields.typeInputSubtitle')} rightLabel={translate('common.required')} onTypeSelected={function (type) { var _a; return (_a = formRef.current) === null || _a === void 0 ? void 0 : _a.resetForm(__assign(__assign({}, inputValues), { type: type, initialValue: type === CONST_1.default.REPORT_FIELD_TYPES.DATE ? defaultDate : '' })); }}/>

                            {inputValues[WorkspaceReportFieldForm_1.default.TYPE] === CONST_1.default.REPORT_FIELD_TYPES.LIST && (<MenuItemWithTopDescription_1.default description={translate('workspace.reportFields.listValues')} shouldShowRightIcon onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_REPORT_FIELDS_LIST_VALUES.getRoute(policyID)); }} title={listValues} numberOfLinesTitle={5}/>)}

                            {inputValues[WorkspaceReportFieldForm_1.default.TYPE] === CONST_1.default.REPORT_FIELD_TYPES.TEXT && (<InputWrapper_1.default InputComponent={TextPicker_1.default} inputID={WorkspaceReportFieldForm_1.default.INITIAL_VALUE} label={translate('common.initialValue')} subtitle={translate('workspace.reportFields.initialValueInputSubtitle')} description={translate('common.initialValue')} accessibilityLabel={translate('workspace.editor.initialValueInputLabel')} maxLength={CONST_1.default.WORKSPACE_REPORT_FIELD_POLICY_MAX_LENGTH} multiline={false} role={CONST_1.default.ROLE.PRESENTATION}/>)}

                            {inputValues[WorkspaceReportFieldForm_1.default.TYPE] === CONST_1.default.REPORT_FIELD_TYPES.DATE && (<MenuItemWithTopDescription_1.default title={translate('common.currentDate')} description={translate('common.initialValue')} rightLabel={translate('common.required')} interactive={false}/>)}

                            {inputValues[WorkspaceReportFieldForm_1.default.TYPE] === CONST_1.default.REPORT_FIELD_TYPES.LIST && availableListValuesLength > 0 && (<InputWrapper_1.default InputComponent={InitialListValueSelector_1.default} inputID={WorkspaceReportFieldForm_1.default.INITIAL_VALUE} label={translate('common.initialValue')} subtitle={translate('workspace.reportFields.listValuesInputSubtitle')}/>)}
                        </react_native_1.View>);
        }}
                </FormProvider_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceCreateReportFieldsPage.displayName = 'WorkspaceCreateReportFieldsPage';
exports.default = (0, withPolicyAndFullscreenLoading_1.default)(WorkspaceCreateReportFieldsPage);
