"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var SelectionScreen_1 = require("@components/SelectionScreen");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var NetSuiteCommands_1 = require("@libs/actions/connections/NetSuiteCommands");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var Navigation_1 = require("@navigation/Navigation");
var utils_1 = require("@pages/workspace/accounting/netsuite/utils");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function NetSuiteExportExpensesDestinationSelectPage(_a) {
    var _b, _c, _d;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var config = (_c = (_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b.netsuite) === null || _c === void 0 ? void 0 : _c.options.config;
    var route = (0, native_1.useRoute)();
    var params = route.params;
    var backTo = params.backTo;
    var isReimbursable = params.expenseType === CONST_1.default.NETSUITE_EXPENSE_TYPE.REIMBURSABLE;
    var currentSettingName = (0, utils_1.exportExpensesDestinationSettingName)(isReimbursable);
    var currentDestination = config === null || config === void 0 ? void 0 : config[currentSettingName];
    var data = Object.values(CONST_1.default.NETSUITE_EXPORT_DESTINATION).map(function (dateType) { return ({
        value: dateType,
        text: translate("workspace.netsuite.exportDestination.values.".concat(dateType, ".label")),
        keyForList: dateType,
        isSelected: currentDestination === dateType,
    }); });
    var goBack = (0, react_1.useCallback)(function () {
        Navigation_1.default.goBack(backTo !== null && backTo !== void 0 ? backTo : ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES.getRoute(policyID, params.expenseType));
    }, [backTo, policyID, params.expenseType]);
    var selectDestination = (0, react_1.useCallback)(function (row) {
        if (row.value !== currentDestination && policyID) {
            if (isReimbursable) {
                (0, NetSuiteCommands_1.updateNetSuiteReimbursableExpensesExportDestination)(policyID, row.value, currentDestination !== null && currentDestination !== void 0 ? currentDestination : CONST_1.default.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT);
            }
            else {
                (0, NetSuiteCommands_1.updateNetSuiteNonReimbursableExpensesExportDestination)(policyID, row.value, currentDestination !== null && currentDestination !== void 0 ? currentDestination : CONST_1.default.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL);
            }
        }
        goBack();
    }, [currentDestination, isReimbursable, policyID, goBack]);
    return (<SelectionScreen_1.default displayName={NetSuiteExportExpensesDestinationSelectPage.displayName} title="workspace.accounting.exportAs" sections={[{ data: data }]} listItem={RadioListItem_1.default} onSelectRow={function (selection) { return selectDestination(selection); }} initiallyFocusedOptionKey={(_d = data.find(function (mode) { return mode.isSelected; })) === null || _d === void 0 ? void 0 : _d.keyForList} policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} onBackButtonPress={goBack} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([currentSettingName], config === null || config === void 0 ? void 0 : config.pendingFields)} errors={(0, ErrorUtils_1.getLatestErrorField)(config, currentSettingName)} errorRowStyles={[styles.ph5, styles.pv3]} onClose={function () { return (0, Policy_1.clearNetSuiteErrorField)(policyID, currentSettingName); }}/>);
}
NetSuiteExportExpensesDestinationSelectPage.displayName = 'NetSuiteExportExpensesDestinationSelectPage';
exports.default = (0, withPolicyConnections_1.default)(NetSuiteExportExpensesDestinationSelectPage);
