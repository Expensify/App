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
var usePolicy_1 = require("@hooks/usePolicy");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var TaxRate_1 = require("@libs/actions/TaxRate");
var Navigation_1 = require("@libs/Navigation/Navigation");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var WorkspaceTaxCodeForm_1 = require("@src/types/form/WorkspaceTaxCodeForm");
function WorkspaceTaxCodePage(_a) {
    var route = _a.route;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var policyID = route.params.policyID;
    var currentTaxCode = route.params.taxID;
    var policy = (0, usePolicy_1.default)(policyID);
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var setTaxCode = (0, react_1.useCallback)(function (values) {
        var newTaxCode = values.taxCode.trim();
        if (currentTaxCode === newTaxCode) {
            Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_TAX_EDIT.getRoute(policyID, currentTaxCode));
            return;
        }
        (0, TaxRate_1.setPolicyTaxCode)(policyID, currentTaxCode, newTaxCode);
        Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_TAX_EDIT.getRoute(policyID, currentTaxCode));
    }, [currentTaxCode, policyID]);
    var validate = (0, react_1.useCallback)(function (values) {
        if (!policy) {
            return {};
        }
        var newTaxCode = values.taxCode.trim();
        if (newTaxCode === currentTaxCode) {
            return {};
        }
        return (0, TaxRate_1.validateTaxCode)(policy, values);
    }, [currentTaxCode, policy]);
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.CONTROL]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding shouldEnableMaxHeight testID={WorkspaceTaxCodePage.displayName}>
                <HeaderWithBackButton_1.default title={translate('workspace.taxes.taxCode')} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_TAX_EDIT.getRoute(policyID, currentTaxCode)); }}/>

                <FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.WORKSPACE_TAX_CODE_FORM} submitButtonText={translate('workspace.editor.save')} style={[styles.flexGrow1, styles.ph5]} onSubmit={setTaxCode} enabledWhenOffline validate={validate} shouldHideFixErrorsAlert addBottomSafeAreaPadding>
                    <react_native_1.View style={styles.mb4}>
                        <InputWrapper_1.default InputComponent={TextInput_1.default} role={CONST_1.default.ROLE.PRESENTATION} inputID={WorkspaceTaxCodeForm_1.default.TAX_CODE} label={translate('workspace.taxes.taxCode')} accessibilityLabel={translate('workspace.taxes.taxCode')} defaultValue={currentTaxCode} ref={inputCallbackRef}/>
                    </react_native_1.View>
                </FormProvider_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceTaxCodePage.displayName = 'WorkspaceTaxCodePage';
exports.default = WorkspaceTaxCodePage;
