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
var NetSuiteCustomSegmentMappingPicker_1 = require("@pages/workspace/accounting/netsuite/import/NetSuiteImportCustomFieldNew/NetSuiteCustomSegmentMappingPicker");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var NetSuiteCustomFieldForm_1 = require("@src/types/form/NetSuiteCustomFieldForm");
var STEP_FIELDS = [NetSuiteCustomFieldForm_1.default.SEGMENT_TYPE];
function ChooseSegmentTypeStep(_a) {
    var onNext = _a.onNext, setCustomSegmentType = _a.setCustomSegmentType, isEditing = _a.isEditing, netSuiteCustomFieldFormValues = _a.netSuiteCustomFieldFormValues;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = {};
        if (!ValidationUtils.isRequiredFulfilled(values[NetSuiteCustomFieldForm_1.default.SEGMENT_TYPE])) {
            errors[NetSuiteCustomFieldForm_1.default.SEGMENT_TYPE] = translate('common.error.pleaseSelectOne');
        }
        return errors;
    }, [translate]);
    var handleSubmit = (0, useNetSuiteImportAddCustomSegmentForm_1.default)({
        fieldIds: STEP_FIELDS,
        onNext: function () {
            setCustomSegmentType === null || setCustomSegmentType === void 0 ? void 0 : setCustomSegmentType(netSuiteCustomFieldFormValues[NetSuiteCustomFieldForm_1.default.SEGMENT_TYPE]);
            onNext();
        },
        shouldSaveDraft: true,
    });
    return (<FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.NETSUITE_CUSTOM_SEGMENT_ADD_FORM} submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')} onSubmit={handleSubmit} validate={validate} style={[styles.flexGrow1]} submitButtonStyles={[styles.ph5, styles.mb0]} enabledWhenOffline shouldUseScrollView shouldHideFixErrorsAlert submitFlexEnabled={false} addBottomSafeAreaPadding>
            <Text_1.default style={[styles.ph5, styles.textHeadlineLineHeightXXL, styles.mb3]}>
                {translate("workspace.netsuite.import.importCustomFields.customSegments.addForm.segmentRecordType")}
            </Text_1.default>
            <Text_1.default style={[styles.ph5, styles.mb3]}>{translate("workspace.netsuite.import.importCustomFields.chooseOptionBelow")}</Text_1.default>
            <InputWrapper_1.default InputComponent={NetSuiteCustomSegmentMappingPicker_1.default} inputID={NetSuiteCustomFieldForm_1.default.SEGMENT_TYPE} defaultValue={netSuiteCustomFieldFormValues[NetSuiteCustomFieldForm_1.default.SEGMENT_TYPE]} shouldSaveDraft/>
        </FormProvider_1.default>);
}
ChooseSegmentTypeStep.displayName = 'ChooseSegmentTypeStep';
exports.default = ChooseSegmentTypeStep;
