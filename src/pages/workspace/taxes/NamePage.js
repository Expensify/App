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
var TaxRate_1 = require("@libs/actions/TaxRate");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var NotFoundPage_1 = require("@pages/ErrorPage/NotFoundPage");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var withPolicyAndFullscreenLoading_1 = require("@pages/workspace/withPolicyAndFullscreenLoading");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var WorkspaceTaxNameForm_1 = require("@src/types/form/WorkspaceTaxNameForm");
function NamePage(_a) {
    var _b;
    var _c = _a.route.params, policyID = _c.policyID, taxID = _c.taxID, policy = _a.policy;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var currentTaxRate = (0, PolicyUtils_1.getTaxByID)(policy, taxID);
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var _d = (0, react_1.useState)((_b = currentTaxRate === null || currentTaxRate === void 0 ? void 0 : currentTaxRate.name) !== null && _b !== void 0 ? _b : ''), name = _d[0], setName = _d[1];
    var goBack = (0, react_1.useCallback)(function () { return Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_TAX_EDIT.getRoute(policyID, taxID)); }, [policyID, taxID]);
    var submit = function () {
        var taxName = name.trim();
        // Do not call the API if the edited tax name is the same as the current tag name
        if ((currentTaxRate === null || currentTaxRate === void 0 ? void 0 : currentTaxRate.name) !== taxName) {
            (0, TaxRate_1.renamePolicyTax)(policyID, taxID, taxName);
        }
        goBack();
    };
    var validate = (0, react_1.useCallback)(function (values) {
        if (!policy) {
            return {};
        }
        if (values[WorkspaceTaxNameForm_1.default.NAME] === (currentTaxRate === null || currentTaxRate === void 0 ? void 0 : currentTaxRate.name)) {
            return {};
        }
        return (0, TaxRate_1.validateTaxName)(policy, values);
    }, [currentTaxRate === null || currentTaxRate === void 0 ? void 0 : currentTaxRate.name, policy]);
    if (!currentTaxRate) {
        return <NotFoundPage_1.default />;
    }
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding shouldEnableMaxHeight testID={NamePage.displayName}>
                <HeaderWithBackButton_1.default title={translate('common.name')} onBackButtonPress={goBack}/>

                <FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.WORKSPACE_TAX_NAME_FORM} submitButtonText={translate('workspace.editor.save')} style={[styles.flexGrow1, styles.ph5]} onSubmit={submit} enabledWhenOffline validate={validate} shouldHideFixErrorsAlert addBottomSafeAreaPadding>
                    <react_native_1.View style={styles.mb4}>
                        <InputWrapper_1.default InputComponent={TextInput_1.default} role={CONST_1.default.ROLE.PRESENTATION} inputID={WorkspaceTaxNameForm_1.default.NAME} label={translate('workspace.editor.nameInputLabel')} accessibilityLabel={translate('workspace.editor.nameInputLabel')} value={name} onChangeText={setName} ref={inputCallbackRef}/>
                    </react_native_1.View>
                </FormProvider_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
NamePage.displayName = 'NamePage';
exports.default = (0, withPolicyAndFullscreenLoading_1.default)(NamePage);
