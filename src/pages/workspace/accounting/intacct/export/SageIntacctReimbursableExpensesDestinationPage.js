"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var SelectionScreen_1 = require("@components/SelectionScreen");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Policy_1 = require("@libs/actions/Policy/Policy");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var Navigation_1 = require("@navigation/Navigation");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var SageIntacct_1 = require("@userActions/connections/SageIntacct");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function SageIntacctReimbursableExpensesDestinationPage(_a) {
    var _b, _c, _d;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var config = ((_c = (_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b.intacct) !== null && _c !== void 0 ? _c : {}).config;
    var route = (0, native_1.useRoute)();
    var backTo = route.params.backTo;
    var data = Object.values(CONST_1.default.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE).map(function (expenseType) { return ({
        value: expenseType,
        text: translate("workspace.sageIntacct.reimbursableExpenses.values.".concat(expenseType)),
        keyForList: expenseType,
        isSelected: (config === null || config === void 0 ? void 0 : config.export.reimbursable) === expenseType,
    }); });
    var goBack = (0, react_1.useCallback)(function () {
        Navigation_1.default.goBack(backTo !== null && backTo !== void 0 ? backTo : (policyID && ROUTES_1.default.POLICY_ACCOUNTING_SAGE_INTACCT_REIMBURSABLE_EXPENSES.getRoute(policyID)));
    }, [backTo, policyID]);
    var selectDestination = (0, react_1.useCallback)(function (row) {
        if (row.value !== (config === null || config === void 0 ? void 0 : config.export.reimbursable) && policyID) {
            (0, SageIntacct_1.updateSageIntacctReimbursableExpensesExportDestination)(policyID, row.value, config === null || config === void 0 ? void 0 : config.export.reimbursable);
            if (row.value === CONST_1.default.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL) {
                // Employee default mapping value is not allowed when expense type is VENDOR_BILL, so we have to change mapping value to Tag
                (0, SageIntacct_1.changeMappingsValueFromDefaultToTag)(policyID, config === null || config === void 0 ? void 0 : config.mappings);
            }
        }
        goBack();
    }, [config === null || config === void 0 ? void 0 : config.export.reimbursable, config === null || config === void 0 ? void 0 : config.mappings, policyID, goBack]);
    return (<SelectionScreen_1.default displayName={SageIntacctReimbursableExpensesDestinationPage.displayName} title="workspace.accounting.exportAs" sections={[{ data: data }]} listItem={RadioListItem_1.default} onSelectRow={function (selection) { return selectDestination(selection); }} initiallyFocusedOptionKey={(_d = data.find(function (mode) { return mode.isSelected; })) === null || _d === void 0 ? void 0 : _d.keyForList} policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} onBackButtonPress={goBack} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.SAGE_INTACCT} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.SAGE_INTACCT_CONFIG.REIMBURSABLE], config === null || config === void 0 ? void 0 : config.pendingFields)} errors={(0, ErrorUtils_1.getLatestErrorField)(config, CONST_1.default.SAGE_INTACCT_CONFIG.REIMBURSABLE)} errorRowStyles={[styles.ph5, styles.pv3]} onClose={function () { return (0, Policy_1.clearSageIntacctErrorField)(policyID, CONST_1.default.SAGE_INTACCT_CONFIG.REIMBURSABLE); }}/>);
}
SageIntacctReimbursableExpensesDestinationPage.displayName = 'SageIntacctReimbursableExpensesDestinationPage';
exports.default = (0, withPolicyConnections_1.default)(SageIntacctReimbursableExpensesDestinationPage);
