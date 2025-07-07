"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var ConnectionLayout_1 = require("@components/ConnectionLayout");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var TextInput_1 = require("@components/TextInput");
var useAutoFocusInput_1 = require("@hooks/useAutoFocusInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var SageIntacct_1 = require("@libs/actions/connections/SageIntacct");
var ErrorUtils = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var withPolicy_1 = require("@pages/workspace/withPolicy");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SageIntacctDimensionsForm_1 = require("@src/types/form/SageIntacctDimensionsForm");
var DimensionTypeSelector_1 = require("./DimensionTypeSelector");
function SageIntacctAddUserDimensionPage(_a) {
    var _b, _c, _d, _e, _f;
    var policy = _a.policy;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var policyID = (_b = policy === null || policy === void 0 ? void 0 : policy.id) !== null && _b !== void 0 ? _b : '-1';
    var userDimensions = (_f = (_e = (_d = (_c = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _c === void 0 ? void 0 : _c.intacct) === null || _d === void 0 ? void 0 : _d.config) === null || _e === void 0 ? void 0 : _e.mappings) === null || _f === void 0 ? void 0 : _f.dimensions;
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = {};
        if (!values[SageIntacctDimensionsForm_1.default.INTEGRATION_NAME]) {
            ErrorUtils.addErrorMessage(errors, SageIntacctDimensionsForm_1.default.INTEGRATION_NAME, translate('common.error.fieldRequired'));
        }
        if (userDimensions === null || userDimensions === void 0 ? void 0 : userDimensions.some(function (userDimension) { return userDimension.dimension === values[SageIntacctDimensionsForm_1.default.INTEGRATION_NAME]; })) {
            ErrorUtils.addErrorMessage(errors, SageIntacctDimensionsForm_1.default.INTEGRATION_NAME, translate('workspace.intacct.dimensionExists'));
        }
        if (!values[SageIntacctDimensionsForm_1.default.DIMENSION_TYPE]) {
            ErrorUtils.addErrorMessage(errors, SageIntacctDimensionsForm_1.default.DIMENSION_TYPE, translate('common.error.fieldRequired'));
        }
        return errors;
    }, [translate, userDimensions]);
    return (<ConnectionLayout_1.default displayName={SageIntacctAddUserDimensionPage.displayName} headerTitle="workspace.intacct.addUserDefinedDimension" accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} contentContainerStyle={styles.flex1} shouldUseScrollView={false} titleStyle={styles.ph5} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.SAGE_INTACCT} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.POLICY_ACCOUNTING_SAGE_INTACCT_USER_DIMENSIONS.getRoute(policyID)); }}>
            <FormProvider_1.default style={[styles.flexGrow1, styles.ph5]} formID={ONYXKEYS_1.default.FORMS.SAGE_INTACCT_DIMENSION_TYPE_FORM} validate={validate} onSubmit={function (value) {
            (0, SageIntacct_1.addSageIntacctUserDimensions)(policyID, value[SageIntacctDimensionsForm_1.default.INTEGRATION_NAME], value[SageIntacctDimensionsForm_1.default.DIMENSION_TYPE], userDimensions !== null && userDimensions !== void 0 ? userDimensions : []);
            Navigation_1.default.goBack(ROUTES_1.default.POLICY_ACCOUNTING_SAGE_INTACCT_USER_DIMENSIONS.getRoute(policyID));
        }} submitButtonText={translate('common.confirm')} enabledWhenOffline shouldValidateOnBlur shouldValidateOnChange>
                <react_native_1.View style={styles.mb4}>
                    <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={SageIntacctDimensionsForm_1.default.INTEGRATION_NAME} label={translate('workspace.intacct.integrationName')} aria-label={translate('workspace.intacct.integrationName')} role={CONST_1.default.ROLE.PRESENTATION} spellCheck={false} ref={inputCallbackRef}/>
                </react_native_1.View>
                <react_native_1.View>
                    <InputWrapper_1.default InputComponent={DimensionTypeSelector_1.default} inputID={SageIntacctDimensionsForm_1.default.DIMENSION_TYPE} aria-label="dimensionTypeSelector"/>
                </react_native_1.View>
            </FormProvider_1.default>
        </ConnectionLayout_1.default>);
}
SageIntacctAddUserDimensionPage.displayName = 'SageIntacctAddUserDimensionPage';
exports.default = (0, withPolicy_1.default)(SageIntacctAddUserDimensionPage);
