"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var SelectionScreen_1 = require("@components/SelectionScreen");
var usePolicy_1 = require("@hooks/usePolicy");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var SageIntacct_1 = require("@libs/actions/connections/SageIntacct");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function SageIntacctImportTaxMappingPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j;
    var route = _a.route;
    var styles = (0, useThemeStyles_1.default)();
    var policy = (0, usePolicy_1.default)(route.params.policyID);
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var config = ((_c = (_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b.intacct) !== null && _c !== void 0 ? _c : {}).config;
    var pendingFields = (config !== null && config !== void 0 ? config : {}).pendingFields;
    var sageIntacctConfig = (_e = (_d = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _d === void 0 ? void 0 : _d.intacct) === null || _e === void 0 ? void 0 : _e.config;
    var sageIntacctConfigTaxSolutionID = (_f = sageIntacctConfig === null || sageIntacctConfig === void 0 ? void 0 : sageIntacctConfig.tax) === null || _f === void 0 ? void 0 : _f.taxSolutionID;
    var sageIntacctData = (_h = (_g = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _g === void 0 ? void 0 : _g.intacct) === null || _h === void 0 ? void 0 : _h.data;
    var selectionOptions = (0, react_1.useMemo)(function () {
        var _a;
        var mappingOptions = [];
        var sageIntacctTaxSolutionIDs = (_a = sageIntacctData === null || sageIntacctData === void 0 ? void 0 : sageIntacctData.taxSolutionIDs) !== null && _a !== void 0 ? _a : [];
        sageIntacctTaxSolutionIDs.forEach(function (taxSolutionID) {
            mappingOptions.push({
                value: taxSolutionID,
                text: taxSolutionID,
                keyForList: taxSolutionID,
                isSelected: sageIntacctConfigTaxSolutionID === taxSolutionID,
            });
        });
        return mappingOptions;
    }, [sageIntacctConfigTaxSolutionID, sageIntacctData === null || sageIntacctData === void 0 ? void 0 : sageIntacctData.taxSolutionIDs]);
    var updateMapping = (0, react_1.useCallback)(function (_a) {
        var value = _a.value;
        (0, SageIntacct_1.UpdateSageIntacctTaxSolutionID)(policyID, value);
        Navigation_1.default.goBack(ROUTES_1.default.POLICY_ACCOUNTING_SAGE_INTACCT_IMPORT_TAX.getRoute(policyID));
    }, [policyID]);
    return (<SelectionScreen_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} displayName={SageIntacctImportTaxMappingPage.displayName} sections={[{ data: selectionOptions }]} listItem={RadioListItem_1.default} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.SAGE_INTACCT} onSelectRow={updateMapping} initiallyFocusedOptionKey={(_j = selectionOptions.find(function (option) { return option.isSelected; })) === null || _j === void 0 ? void 0 : _j.keyForList} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.POLICY_ACCOUNTING_SAGE_INTACCT_IMPORT_TAX.getRoute(policyID)); }} title="workspace.sageIntacct.taxSolution" pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.SAGE_INTACCT_CONFIG.TAX, CONST_1.default.SAGE_INTACCT_CONFIG.TAX_SOLUTION_ID], pendingFields)} errors={(0, ErrorUtils_1.getLatestErrorField)(config !== null && config !== void 0 ? config : {}, CONST_1.default.SAGE_INTACCT_CONFIG.TAX_SOLUTION_ID)} errorRowStyles={[styles.ph5, styles.pv3]} onClose={function () { return (0, Policy_1.clearSageIntacctErrorField)(policyID, CONST_1.default.SAGE_INTACCT_CONFIG.TAX_SOLUTION_ID); }}/>);
}
SageIntacctImportTaxMappingPage.displayName = 'SageIntacctImportTaxMappingPage';
exports.default = SageIntacctImportTaxMappingPage;
