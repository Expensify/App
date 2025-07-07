"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var SelectionScreen_1 = require("@components/SelectionScreen");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var NetSuiteCommands_1 = require("@libs/actions/connections/NetSuiteCommands");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var Navigation_1 = require("@navigation/Navigation");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function NetSuiteVendorBillApprovalLevelSelectPage(_a) {
    var _b, _c, _d;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var styles = (0, useThemeStyles_1.default)();
    var config = (_c = (_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b.netsuite) === null || _c === void 0 ? void 0 : _c.options.config;
    var data = Object.values(CONST_1.default.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL).map(function (approvalType) { return ({
        value: approvalType,
        text: translate("workspace.netsuite.advancedConfig.exportVendorBillsTo.values.".concat(approvalType)),
        keyForList: approvalType,
        isSelected: (config === null || config === void 0 ? void 0 : config.syncOptions.exportVendorBillsTo) === approvalType,
    }); });
    var headerContent = (0, react_1.useMemo)(function () { return (<react_native_1.View>
                <Text_1.default style={[styles.ph5, styles.pb5]}>{translate('workspace.netsuite.advancedConfig.exportVendorBillsTo.description')}</Text_1.default>
            </react_native_1.View>); }, [translate, styles.pb5, styles.ph5]);
    var selectVendorBillApprovalLevel = (0, react_1.useCallback)(function (row) {
        var _a;
        if (row.value !== (config === null || config === void 0 ? void 0 : config.syncOptions.exportVendorBillsTo) && policyID) {
            (0, NetSuiteCommands_1.updateNetSuiteExportVendorBillsTo)(policyID, row.value, (_a = config === null || config === void 0 ? void 0 : config.syncOptions.exportVendorBillsTo) !== null && _a !== void 0 ? _a : CONST_1.default.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE);
        }
        Navigation_1.default.goBack(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_ADVANCED.getRoute(policyID));
    }, [config === null || config === void 0 ? void 0 : config.syncOptions.exportVendorBillsTo, policyID]);
    return (<SelectionScreen_1.default displayName={NetSuiteVendorBillApprovalLevelSelectPage.displayName} title="workspace.netsuite.advancedConfig.exportVendorBillsTo.label" headerContent={headerContent} sections={[{ data: data }]} listItem={RadioListItem_1.default} onSelectRow={function (selection) { return selectVendorBillApprovalLevel(selection); }} initiallyFocusedOptionKey={(_d = data.find(function (mode) { return mode.isSelected; })) === null || _d === void 0 ? void 0 : _d.keyForList} policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_ADVANCED.getRoute(policyID)); }} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE} shouldBeBlocked={(config === null || config === void 0 ? void 0 : config.reimbursableExpensesExportDestination) !== CONST_1.default.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL &&
            (config === null || config === void 0 ? void 0 : config.nonreimbursableExpensesExportDestination) !== CONST_1.default.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.EXPORT_VENDOR_BILLS_TO], config === null || config === void 0 ? void 0 : config.pendingFields)} errors={(0, ErrorUtils_1.getLatestErrorField)(config, CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.EXPORT_VENDOR_BILLS_TO)} errorRowStyles={[styles.ph5, styles.pv3]} onClose={function () { return (0, Policy_1.clearNetSuiteErrorField)(policyID, CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.EXPORT_VENDOR_BILLS_TO); }}/>);
}
NetSuiteVendorBillApprovalLevelSelectPage.displayName = 'NetSuiteVendorBillApprovalLevelSelectPage';
exports.default = (0, withPolicyConnections_1.default)(NetSuiteVendorBillApprovalLevelSelectPage);
