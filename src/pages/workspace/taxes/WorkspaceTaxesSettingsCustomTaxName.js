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
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var withPolicyAndFullscreenLoading_1 = require("@pages/workspace/withPolicyAndFullscreenLoading");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var WorkspaceTaxCustomName_1 = require("@src/types/form/WorkspaceTaxCustomName");
function WorkspaceTaxesSettingsCustomTaxName(_a) {
    var _b;
    var policyID = _a.route.params.policyID, policy = _a.policy;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = {};
        var customTaxName = values[WorkspaceTaxCustomName_1.default.NAME];
        if (!(0, ValidationUtils_1.isRequiredFulfilled)(customTaxName)) {
            errors.name = translate('workspace.taxes.error.customNameRequired');
        }
        else if (customTaxName.length > CONST_1.default.TAX_RATES.CUSTOM_NAME_MAX_LENGTH) {
            errors.name = translate('common.error.characterLimitExceedCounter', {
                length: customTaxName.length,
                limit: CONST_1.default.TAX_RATES.CUSTOM_NAME_MAX_LENGTH,
            });
        }
        return errors;
    }, [translate]);
    var submit = function (_a) {
        var name = _a.name;
        (0, Policy_1.setPolicyCustomTaxName)(policyID, name);
        Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_TAXES_SETTINGS.getRoute(policyID));
    };
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding shouldEnableMaxHeight testID={WorkspaceTaxesSettingsCustomTaxName.displayName} style={styles.defaultModalContainer}>
                <HeaderWithBackButton_1.default title={translate('workspace.taxes.customTaxName')}/>

                <FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.WORKSPACE_TAX_CUSTOM_NAME} submitButtonText={translate('workspace.editor.save')} style={[styles.flexGrow1, styles.ph5]} scrollContextEnabled enabledWhenOffline validate={validate} onSubmit={submit} shouldHideFixErrorsAlert addBottomSafeAreaPadding>
                    <react_native_1.View style={styles.mb4}>
                        <InputWrapper_1.default InputComponent={TextInput_1.default} role={CONST_1.default.ROLE.PRESENTATION} inputID={WorkspaceTaxCustomName_1.default.NAME} label={translate('workspace.editor.nameInputLabel')} accessibilityLabel={translate('workspace.editor.nameInputLabel')} defaultValue={(_b = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _b === void 0 ? void 0 : _b.name} multiline={false} ref={inputCallbackRef}/>
                    </react_native_1.View>
                </FormProvider_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceTaxesSettingsCustomTaxName.displayName = 'WorkspaceTaxesSettingsCustomTaxName';
exports.default = (0, withPolicyAndFullscreenLoading_1.default)(WorkspaceTaxesSettingsCustomTaxName);
