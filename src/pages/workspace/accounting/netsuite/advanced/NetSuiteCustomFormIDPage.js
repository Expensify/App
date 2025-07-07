"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var ConnectionLayout_1 = require("@components/ConnectionLayout");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var TextInput_1 = require("@components/TextInput");
var useAutoFocusInput_1 = require("@hooks/useAutoFocusInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var NetSuiteCommands_1 = require("@userActions/connections/NetSuiteCommands");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function NetSuiteCustomFormIDPage(_a) {
    var _b, _c, _d, _e, _f, _g;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var styles = (0, useThemeStyles_1.default)();
    var route = (0, native_1.useRoute)();
    var params = route.params;
    var policyID = params.policyID;
    var isReimbursable = params.expenseType === CONST_1.default.NETSUITE_EXPENSE_TYPE.REIMBURSABLE;
    var config = (_c = (_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b.netsuite) === null || _c === void 0 ? void 0 : _c.options.config;
    var exportDestination = (_d = (isReimbursable ? config === null || config === void 0 ? void 0 : config.reimbursableExpensesExportDestination : config === null || config === void 0 ? void 0 : config.nonreimbursableExpensesExportDestination)) !== null && _d !== void 0 ? _d : CONST_1.default.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT;
    var customFormIDKey = isReimbursable ? CONST_1.default.NETSUITE_CONFIG.CUSTOM_FORM_ID_TYPE.REIMBURSABLE : CONST_1.default.NETSUITE_CONFIG.CUSTOM_FORM_ID_TYPE.NON_REIMBURSABLE;
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = {};
        if (values[params.expenseType] && !(0, ValidationUtils_1.isNumeric)(values[params.expenseType])) {
            (0, ErrorUtils_1.addErrorMessage)(errors, params.expenseType, translate('workspace.netsuite.advancedConfig.error.customFormID'));
        }
        return errors;
    }, [params.expenseType, translate]);
    var updateCustomFormID = (0, react_1.useCallback)(function (formValues) {
        var _a, _b;
        if (((_b = (_a = config === null || config === void 0 ? void 0 : config.customFormIDOptions) === null || _a === void 0 ? void 0 : _a[customFormIDKey]) === null || _b === void 0 ? void 0 : _b[CONST_1.default.NETSUITE_MAP_EXPORT_DESTINATION[exportDestination]]) !== formValues[params.expenseType]) {
            (0, NetSuiteCommands_1.updateNetSuiteCustomFormIDOptions)(policyID, formValues[params.expenseType], isReimbursable, exportDestination, config === null || config === void 0 ? void 0 : config.customFormIDOptions);
        }
        Navigation_1.default.goBack(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_ADVANCED.getRoute(policyID));
    }, [config === null || config === void 0 ? void 0 : config.customFormIDOptions, customFormIDKey, exportDestination, isReimbursable, params.expenseType, policyID]);
    return (<ConnectionLayout_1.default displayName={NetSuiteCustomFormIDPage.displayName} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_ADVANCED.getRoute(policyID)); }} headerTitle={"workspace.netsuite.advancedConfig.".concat(isReimbursable ? 'customFormIDReimbursable' : 'customFormIDNonReimbursable')} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.CONTROL]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} contentContainerStyle={[styles.flex1]} titleStyle={styles.ph5} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE} shouldBeBlocked={!((_e = config === null || config === void 0 ? void 0 : config.customFormIDOptions) === null || _e === void 0 ? void 0 : _e.enabled)} shouldUseScrollView={false}>
            <react_native_1.View style={[styles.flexGrow1, styles.ph5]}>
                <FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.NETSUITE_CUSTOM_FORM_ID_FORM} style={styles.flexGrow1} validate={validate} onSubmit={updateCustomFormID} submitButtonText={translate('common.confirm')} shouldValidateOnBlur shouldValidateOnChange shouldHideFixErrorsAlert addBottomSafeAreaPadding>
                    <OfflineWithFeedback_1.default pendingAction={(0, PolicyUtils_1.settingsPendingAction)([customFormIDKey], config === null || config === void 0 ? void 0 : config.pendingFields)} errors={(0, ErrorUtils_1.getLatestErrorField)(config, customFormIDKey)} errorRowStyles={[styles.ph5, styles.pv3]} onClose={function () { return (0, Policy_1.clearNetSuiteErrorField)(policyID, customFormIDKey); }}>
                        <InputWrapper_1.default InputComponent={TextInput_1.default} ref={inputCallbackRef} inputID={params.expenseType} label={translate("workspace.netsuite.advancedConfig.".concat(isReimbursable ? 'customFormIDReimbursable' : 'customFormIDNonReimbursable'))} aria-label={translate("workspace.netsuite.advancedConfig.".concat(isReimbursable ? 'customFormIDReimbursable' : 'customFormIDNonReimbursable'))} role={CONST_1.default.ROLE.PRESENTATION} spellCheck={false} inputMode={CONST_1.default.INPUT_MODE.NUMERIC} defaultValue={(_g = (_f = config === null || config === void 0 ? void 0 : config.customFormIDOptions) === null || _f === void 0 ? void 0 : _f[customFormIDKey]) === null || _g === void 0 ? void 0 : _g[CONST_1.default.NETSUITE_MAP_EXPORT_DESTINATION[exportDestination]]}/>
                    </OfflineWithFeedback_1.default>
                </FormProvider_1.default>
            </react_native_1.View>
        </ConnectionLayout_1.default>);
}
NetSuiteCustomFormIDPage.displayName = 'NetSuiteCustomFormIDPage';
exports.default = (0, withPolicyConnections_1.default)(NetSuiteCustomFormIDPage);
