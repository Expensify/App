"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var RenderHTML_1 = require("@components/RenderHTML");
var Text_1 = require("@components/Text");
var TextInput_1 = require("@components/TextInput");
var useAutoFocusInput_1 = require("@hooks/useAutoFocusInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetSuiteImportAddCustomSegmentForm_1 = require("@hooks/useNetSuiteImportAddCustomSegmentForm");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Parser_1 = require("@libs/Parser");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var NetSuiteCustomFieldForm_1 = require("@src/types/form/NetSuiteCustomFieldForm");
var STEP_FIELDS = [NetSuiteCustomFieldForm_1.default.INTERNAL_ID];
function CustomSegmentInternalIdStep(_a) {
    var customSegmentType = _a.customSegmentType, onNext = _a.onNext, isEditing = _a.isEditing, netSuiteCustomFieldFormValues = _a.netSuiteCustomFieldFormValues, customSegments = _a.customSegments;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var customSegmentRecordType = customSegmentType !== null && customSegmentType !== void 0 ? customSegmentType : CONST_1.default.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_SEGMENT;
    var fieldLabel = translate("workspace.netsuite.import.importCustomFields.customSegments.fields.internalID");
    var handleSubmit = (0, useNetSuiteImportAddCustomSegmentForm_1.default)({
        fieldIds: STEP_FIELDS,
        onNext: onNext,
        shouldSaveDraft: true,
    });
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = {};
        if (!(0, ValidationUtils_1.isRequiredFulfilled)(values[NetSuiteCustomFieldForm_1.default.INTERNAL_ID])) {
            errors[NetSuiteCustomFieldForm_1.default.INTERNAL_ID] = translate('workspace.netsuite.import.importCustomFields.requiredFieldError', { fieldName: fieldLabel });
        }
        else if (customSegments === null || customSegments === void 0 ? void 0 : customSegments.find(function (customSegment) { return customSegment.internalID.toLowerCase() === values[NetSuiteCustomFieldForm_1.default.INTERNAL_ID].toLowerCase(); })) {
            errors[NetSuiteCustomFieldForm_1.default.INTERNAL_ID] = translate('workspace.netsuite.import.importCustomFields.customSegments.errors.uniqueFieldError', { fieldName: fieldLabel });
        }
        return errors;
    }, [customSegments, translate, fieldLabel]);
    return (<FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.NETSUITE_CUSTOM_SEGMENT_ADD_FORM} submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')} onSubmit={handleSubmit} validate={validate} style={[styles.flexGrow1]} submitButtonStyles={[styles.ph5, styles.mb0]} enabledWhenOffline submitFlexEnabled shouldUseScrollView shouldHideFixErrorsAlert addBottomSafeAreaPadding>
            <react_native_1.View style={styles.ph5}>
                <Text_1.default style={[styles.mb3, styles.textHeadlineLineHeightXXL]}>
                    {translate("workspace.netsuite.import.importCustomFields.customSegments.addForm.customSegmentInternalIDTitle")}
                </Text_1.default>

                <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={NetSuiteCustomFieldForm_1.default.INTERNAL_ID} label={fieldLabel} aria-label={fieldLabel} role={CONST_1.default.ROLE.PRESENTATION} spellCheck={false} ref={inputCallbackRef} defaultValue={netSuiteCustomFieldFormValues[NetSuiteCustomFieldForm_1.default.INTERNAL_ID]}/>
                <react_native_1.View style={[styles.flex1, styles.mv3, styles.renderHTML, styles.textDecorationSkipInkNone]}>
                    <RenderHTML_1.default html={"<comment>".concat(Parser_1.default.replace(translate("workspace.netsuite.import.importCustomFields.customSegments.addForm.".concat(customSegmentRecordType, "InternalIDFooter"))), "</comment>")}/>
                </react_native_1.View>
            </react_native_1.View>
        </FormProvider_1.default>);
}
CustomSegmentInternalIdStep.displayName = 'CustomSegmentInternalIdStep';
exports.default = CustomSegmentInternalIdStep;
