"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var ConfirmModal_1 = require("@components/ConfirmModal");
var ConnectionLayout_1 = require("@components/ConnectionLayout");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var Expensicons = require("@components/Icon/Expensicons");
var MenuItem_1 = require("@components/MenuItem");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var TextInput_1 = require("@components/TextInput");
var useLocalize_1 = require("@hooks/useLocalize");
var usePolicy_1 = require("@hooks/usePolicy");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var SageIntacct_1 = require("@libs/actions/connections/SageIntacct");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SageIntacctDimensionsForm_1 = require("@src/types/form/SageIntacctDimensionsForm");
var DimensionTypeSelector_1 = require("./DimensionTypeSelector");
function SageIntacctEditUserDimensionsPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h;
    var route = _a.route;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var editedUserDimensionName = route.params.dimensionName;
    var policy = (0, usePolicy_1.default)(route.params.policyID);
    var policyID = (_b = policy === null || policy === void 0 ? void 0 : policy.id) !== null && _b !== void 0 ? _b : "".concat(CONST_1.default.DEFAULT_NUMBER_ID);
    var config = (_d = (_c = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _c === void 0 ? void 0 : _c.intacct) === null || _d === void 0 ? void 0 : _d.config;
    var userDimensions = (_h = (_g = (_f = (_e = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _e === void 0 ? void 0 : _e.intacct) === null || _f === void 0 ? void 0 : _f.config) === null || _g === void 0 ? void 0 : _g.mappings) === null || _h === void 0 ? void 0 : _h.dimensions;
    var editedUserDimension = userDimensions === null || userDimensions === void 0 ? void 0 : userDimensions.find(function (userDimension) { return userDimension.dimension === editedUserDimensionName; });
    var _j = (0, react_1.useState)(false), isDeleteModalOpen = _j[0], setIsDeleteModalOpen = _j[1];
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = {};
        if (!values[SageIntacctDimensionsForm_1.default.INTEGRATION_NAME]) {
            (0, ErrorUtils_1.addErrorMessage)(errors, SageIntacctDimensionsForm_1.default.INTEGRATION_NAME, translate('common.error.fieldRequired'));
        }
        if (userDimensions === null || userDimensions === void 0 ? void 0 : userDimensions.some(function (userDimension) { return userDimension.dimension === values[SageIntacctDimensionsForm_1.default.INTEGRATION_NAME] && editedUserDimensionName !== values[SageIntacctDimensionsForm_1.default.INTEGRATION_NAME]; })) {
            (0, ErrorUtils_1.addErrorMessage)(errors, SageIntacctDimensionsForm_1.default.INTEGRATION_NAME, translate('workspace.intacct.dimensionExists'));
        }
        if (!values[SageIntacctDimensionsForm_1.default.DIMENSION_TYPE]) {
            (0, ErrorUtils_1.addErrorMessage)(errors, SageIntacctDimensionsForm_1.default.DIMENSION_TYPE, translate('common.error.fieldRequired'));
        }
        return errors;
    }, [editedUserDimensionName, translate, userDimensions]);
    return (<ConnectionLayout_1.default displayName={SageIntacctEditUserDimensionsPage.displayName} headerTitleAlreadyTranslated={editedUserDimensionName} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} contentContainerStyle={styles.flex1} shouldUseScrollView={false} titleStyle={styles.ph5} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.SAGE_INTACCT} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.POLICY_ACCOUNTING_SAGE_INTACCT_USER_DIMENSIONS.getRoute(policyID)); }}>
            <FormProvider_1.default style={[styles.flexGrow1, styles.ph5]} formID={ONYXKEYS_1.default.FORMS.SAGE_INTACCT_DIMENSION_TYPE_FORM} validate={validate} onSubmit={function (value) {
            (0, SageIntacct_1.editSageIntacctUserDimensions)(policyID, editedUserDimensionName, value[SageIntacctDimensionsForm_1.default.INTEGRATION_NAME], value[SageIntacctDimensionsForm_1.default.DIMENSION_TYPE], userDimensions !== null && userDimensions !== void 0 ? userDimensions : []);
            Navigation_1.default.goBack(ROUTES_1.default.POLICY_ACCOUNTING_SAGE_INTACCT_USER_DIMENSIONS.getRoute(policyID));
        }} submitButtonText={translate('common.save')} enabledWhenOffline shouldValidateOnBlur shouldValidateOnChange>
                <OfflineWithFeedback_1.default pendingAction={(0, PolicyUtils_1.settingsPendingAction)(["".concat(CONST_1.default.SAGE_INTACCT_CONFIG.DIMENSION_PREFIX).concat(editedUserDimensionName)], config === null || config === void 0 ? void 0 : config.pendingFields)} errors={(0, ErrorUtils_1.getLatestErrorField)(config !== null && config !== void 0 ? config : {}, "".concat(CONST_1.default.SAGE_INTACCT_CONFIG.DIMENSION_PREFIX).concat(editedUserDimensionName))} errorRowStyles={[styles.pb3]} onClose={function () {
            (0, SageIntacct_1.clearSageIntacctErrorField)(policyID, "".concat(CONST_1.default.SAGE_INTACCT_CONFIG.DIMENSION_PREFIX).concat(editedUserDimensionName));
            var pendingAction = (0, PolicyUtils_1.settingsPendingAction)(["".concat(CONST_1.default.SAGE_INTACCT_CONFIG.DIMENSION_PREFIX).concat(editedUserDimensionName)], config === null || config === void 0 ? void 0 : config.pendingFields);
            if (pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
                (0, SageIntacct_1.removeSageIntacctUserDimensionsByName)(userDimensions !== null && userDimensions !== void 0 ? userDimensions : [], policyID, editedUserDimensionName);
                Navigation_1.default.goBack();
            }
            (0, SageIntacct_1.clearSageIntacctPendingField)(policyID, "".concat(CONST_1.default.SAGE_INTACCT_CONFIG.DIMENSION_PREFIX).concat(editedUserDimensionName));
        }}>
                    <react_native_1.View style={[styles.mb4]}>
                        <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={SageIntacctDimensionsForm_1.default.INTEGRATION_NAME} label={translate('workspace.intacct.integrationName')} aria-label={translate('workspace.intacct.integrationName')} role={CONST_1.default.ROLE.PRESENTATION} spellCheck={false} defaultValue={editedUserDimensionName}/>
                    </react_native_1.View>
                    <react_native_1.View style={[]}>
                        <InputWrapper_1.default InputComponent={DimensionTypeSelector_1.default} inputID={SageIntacctDimensionsForm_1.default.DIMENSION_TYPE} aria-label="dimensionTypeSelector" defaultValue={editedUserDimension === null || editedUserDimension === void 0 ? void 0 : editedUserDimension.mapping}/>
                    </react_native_1.View>
                    <react_native_1.View style={[styles.mhn5]}>
                        <MenuItem_1.default title={translate('common.remove')} icon={Expensicons.Trashcan} onPress={function () { return setIsDeleteModalOpen(true); }}/>
                    </react_native_1.View>
                </OfflineWithFeedback_1.default>
                <ConfirmModal_1.default title={translate('workspace.intacct.removeDimension')} isVisible={isDeleteModalOpen} onConfirm={function () {
            setIsDeleteModalOpen(false);
            (0, SageIntacct_1.removeSageIntacctUserDimensions)(policyID, editedUserDimensionName, userDimensions !== null && userDimensions !== void 0 ? userDimensions : []);
            Navigation_1.default.goBack();
        }} onCancel={function () { return setIsDeleteModalOpen(false); }} prompt={translate('workspace.intacct.removeDimensionPrompt')} confirmText={translate('common.remove')} cancelText={translate('common.cancel')} danger shouldEnableNewFocusManagement/>
            </FormProvider_1.default>
        </ConnectionLayout_1.default>);
}
SageIntacctEditUserDimensionsPage.displayName = 'SageIntacctEditUserDimensionsPage';
exports.default = SageIntacctEditUserDimensionsPage;
