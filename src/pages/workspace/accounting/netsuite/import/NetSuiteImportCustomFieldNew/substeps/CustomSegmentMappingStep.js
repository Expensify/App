"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetSuiteImportAddCustomSegmentForm_1 = require("@hooks/useNetSuiteImportAddCustomSegmentForm");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ValidationUtils = require("@libs/ValidationUtils");
var NetSuiteCustomFieldMappingPicker_1 = require("@pages/workspace/accounting/netsuite/import/NetSuiteImportCustomFieldNew/NetSuiteCustomFieldMappingPicker");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var NetSuiteCustomFieldForm_1 = require("@src/types/form/NetSuiteCustomFieldForm");
var STEP_FIELDS = [NetSuiteCustomFieldForm_1.default.MAPPING];
function CustomSegmentMappingStep(_a) {
    var importCustomField = _a.importCustomField, customSegmentType = _a.customSegmentType, onNext = _a.onNext, isEditing = _a.isEditing, netSuiteCustomFieldFormValues = _a.netSuiteCustomFieldFormValues;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    // reminder to change the validation logic at the last phase of PR
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = {};
        if (!ValidationUtils.isRequiredFulfilled(values[NetSuiteCustomFieldForm_1.default.MAPPING])) {
            errors[NetSuiteCustomFieldForm_1.default.MAPPING] = translate('common.error.pleaseSelectOne');
        }
        return errors;
    }, [translate]);
    var handleSubmit = (0, useNetSuiteImportAddCustomSegmentForm_1.default)({
        fieldIds: STEP_FIELDS,
        onNext: onNext,
        shouldSaveDraft: true,
    });
    var titleKey;
    if (importCustomField === CONST_1.default.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS.CUSTOM_LISTS) {
        titleKey = 'workspace.netsuite.import.importCustomFields.customLists.addForm.mappingTitle';
    }
    else {
        var customSegmentRecordType = customSegmentType !== null && customSegmentType !== void 0 ? customSegmentType : CONST_1.default.NETSUITE_CUSTOM_RECORD_TYPES.CUSTOM_SEGMENT;
        titleKey = "workspace.netsuite.import.importCustomFields.customSegments.addForm.".concat(customSegmentRecordType, "MappingTitle");
    }
    return (<FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.NETSUITE_CUSTOM_SEGMENT_ADD_FORM} submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')} onSubmit={handleSubmit} validate={validate} style={[styles.flexGrow1]} submitButtonStyles={[styles.ph5, styles.mb0]} enabledWhenOffline shouldUseScrollView={false} shouldHideFixErrorsAlert submitFlexEnabled={false} addBottomSafeAreaPadding>
            <Text_1.default style={[styles.ph5, styles.textHeadlineLineHeightXXL, styles.mb3]}>{translate(titleKey)}</Text_1.default>
            <Text_1.default style={[styles.ph5, styles.mb3]}>{translate("workspace.netsuite.import.importCustomFields.chooseOptionBelow")}</Text_1.default>
            <InputWrapper_1.default InputComponent={NetSuiteCustomFieldMappingPicker_1.default} inputID={NetSuiteCustomFieldForm_1.default.MAPPING} defaultValue={netSuiteCustomFieldFormValues[NetSuiteCustomFieldForm_1.default.MAPPING]}/>
        </FormProvider_1.default>);
}
CustomSegmentMappingStep.displayName = 'CustomSegmentMappingStep';
exports.default = CustomSegmentMappingStep;
