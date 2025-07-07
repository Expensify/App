"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetSuiteImportAddCustomListForm_1 = require("@hooks/useNetSuiteImportAddCustomListForm");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var NetSuiteCustomListPicker_1 = require("@pages/workspace/accounting/netsuite/import/NetSuiteImportCustomFieldNew/NetSuiteCustomListPicker");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var NetSuiteCustomFieldForm_1 = require("@src/types/form/NetSuiteCustomFieldForm");
var STEP_FIELDS = [NetSuiteCustomFieldForm_1.default.LIST_NAME, NetSuiteCustomFieldForm_1.default.INTERNAL_ID];
function ChooseCustomListStep(_a) {
    var policy = _a.policy, onNext = _a.onNext, isEditing = _a.isEditing, netSuiteCustomFieldFormValues = _a.netSuiteCustomFieldFormValues;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var validate = (0, react_1.useCallback)(function (values) {
        return (0, ValidationUtils_1.getFieldRequiredErrors)(values, [NetSuiteCustomFieldForm_1.default.LIST_NAME]);
    }, []);
    var handleSubmit = (0, useNetSuiteImportAddCustomListForm_1.default)({
        fieldIds: STEP_FIELDS,
        onNext: onNext,
        shouldSaveDraft: true,
    });
    return (<FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.NETSUITE_CUSTOM_LIST_ADD_FORM} submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')} onSubmit={handleSubmit} validate={validate} style={[styles.flexGrow1, styles.mt3]} submitButtonStyles={[styles.ph5, styles.mb0]} enabledWhenOffline submitFlexEnabled shouldUseScrollView shouldHideFixErrorsAlert addBottomSafeAreaPadding>
            <Text_1.default style={[styles.mb3, styles.ph5, styles.textHeadlineLineHeightXXL]}>{translate("workspace.netsuite.import.importCustomFields.customLists.addForm.listNameTitle")}</Text_1.default>
            <InputWrapper_1.default InputComponent={NetSuiteCustomListPicker_1.default} inputID={NetSuiteCustomFieldForm_1.default.LIST_NAME} policy={policy} internalIDInputID={NetSuiteCustomFieldForm_1.default.INTERNAL_ID} defaultValue={netSuiteCustomFieldFormValues[NetSuiteCustomFieldForm_1.default.LIST_NAME]}/>
        </FormProvider_1.default>);
}
ChooseCustomListStep.displayName = 'ChooseCustomListStep';
exports.default = ChooseCustomListStep;
