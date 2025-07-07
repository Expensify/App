"use strict";
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
var TextInput_1 = require("@components/TextInput");
var useAutoFocusInput_1 = require("@hooks/useAutoFocusInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var WorkspaceCategoryForm_1 = require("@src/types/form/WorkspaceCategoryForm");
function CategoryForm(_a) {
    var onSubmit = _a.onSubmit, policyCategories = _a.policyCategories, categoryName = _a.categoryName, validateEdit = _a.validateEdit;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = {};
        var newCategoryName = values.categoryName.trim();
        if (!(0, ValidationUtils_1.isRequiredFulfilled)(newCategoryName)) {
            errors.categoryName = translate('workspace.categories.categoryRequiredError');
        }
        else if (policyCategories === null || policyCategories === void 0 ? void 0 : policyCategories[newCategoryName]) {
            errors.categoryName = translate('workspace.categories.existingCategoryError');
        }
        else if (newCategoryName === CONST_1.default.INVALID_CATEGORY_NAME) {
            errors.categoryName = translate('workspace.categories.invalidCategoryName');
        }
        else if (__spreadArray([], newCategoryName, true).length > CONST_1.default.API_TRANSACTION_CATEGORY_MAX_LENGTH) {
            // Uses the spread syntax to count the number of Unicode code points instead of the number of UTF-16 code units.
            (0, ErrorUtils_1.addErrorMessage)(errors, 'categoryName', translate('common.error.characterLimitExceedCounter', { length: __spreadArray([], newCategoryName, true).length, limit: CONST_1.default.API_TRANSACTION_CATEGORY_MAX_LENGTH }));
        }
        return errors;
    }, [policyCategories, translate]);
    var submit = (0, react_1.useCallback)(function (values) {
        react_native_1.Keyboard.dismiss();
        onSubmit(values);
    }, [onSubmit]);
    return (<FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.WORKSPACE_CATEGORY_FORM} onSubmit={submit} submitButtonText={translate('common.save')} 
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    validate={validateEdit || validate} style={[styles.mh5, styles.flex1]} enabledWhenOffline shouldHideFixErrorsAlert addBottomSafeAreaPadding>
            <InputWrapper_1.default ref={inputCallbackRef} InputComponent={TextInput_1.default} defaultValue={categoryName} label={translate('common.name')} accessibilityLabel={translate('common.name')} inputID={WorkspaceCategoryForm_1.default.CATEGORY_NAME} role={CONST_1.default.ROLE.PRESENTATION}/>
        </FormProvider_1.default>);
}
CategoryForm.displayName = 'CategoryForm';
exports.default = CategoryForm;
