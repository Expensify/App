"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var SelectionScreen_1 = require("@components/SelectionScreen");
var Text_1 = require("@components/Text");
var useCurrentUserPersonalDetails_1 = require("@hooks/useCurrentUserPersonalDetails");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var QuickbooksDesktop_1 = require("@libs/actions/connections/QuickbooksDesktop");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var Navigation_1 = require("@navigation/Navigation");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function QuickbooksDesktopPreferredExporterConfigurationPage(_a) {
    var _b, _c, _d, _e, _f;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var qbdConfig = (_c = (_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b.quickbooksDesktop) === null || _c === void 0 ? void 0 : _c.config;
    var exporters = (0, PolicyUtils_1.getAdminEmployees)(policy);
    var currentUserLogin = (0, useCurrentUserPersonalDetails_1.default)().login;
    var currentExporter = (_d = qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.export) === null || _d === void 0 ? void 0 : _d.exporter;
    var route = (0, native_1.useRoute)();
    var backTo = (_e = route.params) === null || _e === void 0 ? void 0 : _e.backTo;
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var goBack = (0, react_1.useCallback)(function () {
        Navigation_1.default.goBack(backTo !== null && backTo !== void 0 ? backTo : ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT.getRoute(policyID));
    }, [policyID, backTo]);
    var data = (0, react_1.useMemo)(function () {
        return exporters === null || exporters === void 0 ? void 0 : exporters.reduce(function (options, exporter) {
            if (!exporter.email) {
                return options;
            }
            // Don't show guides if the current user is not a guide themselves or an Expensify employee
            if ((0, PolicyUtils_1.isExpensifyTeam)(exporter.email) && !(0, PolicyUtils_1.isExpensifyTeam)(policy === null || policy === void 0 ? void 0 : policy.owner) && !(0, PolicyUtils_1.isExpensifyTeam)(currentUserLogin)) {
                return options;
            }
            options.push({
                value: exporter.email,
                text: exporter.email,
                keyForList: exporter.email,
                // We use the logical OR (||) here instead of ?? because `exporter` could be an empty string
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                isSelected: (currentExporter || (policy === null || policy === void 0 ? void 0 : policy.owner)) === exporter.email,
            });
            return options;
        }, []);
    }, [exporters, policy === null || policy === void 0 ? void 0 : policy.owner, currentUserLogin, currentExporter]);
    var selectExporter = (0, react_1.useCallback)(function (row) {
        if (!policyID) {
            return;
        }
        if (row.value !== currentExporter) {
            (0, QuickbooksDesktop_1.updateQuickbooksDesktopPreferredExporter)(policyID, row.value, currentExporter);
        }
        goBack();
    }, [currentExporter, goBack, policyID]);
    var headerContent = (0, react_1.useMemo)(function () { return (<>
                <Text_1.default style={[styles.ph5, styles.pb5]}>{translate('workspace.accounting.exportPreferredExporterNote')}</Text_1.default>
                <Text_1.default style={[styles.ph5, styles.pb5]}>{translate('workspace.accounting.exportPreferredExporterSubNote')}</Text_1.default>
            </>); }, [translate, styles.ph5, styles.pb5]);
    return (<SelectionScreen_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.CONTROL]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} displayName={QuickbooksDesktopPreferredExporterConfigurationPage.displayName} sections={[{ data: data }]} listItem={RadioListItem_1.default} headerContent={headerContent} onBackButtonPress={goBack} onSelectRow={selectExporter} shouldSingleExecuteRowSelect initiallyFocusedOptionKey={(_f = data.find(function (mode) { return mode.isSelected; })) === null || _f === void 0 ? void 0 : _f.keyForList} title="workspace.accounting.preferredExporter" connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.QBD} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.EXPORTER], qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.pendingFields)} errors={(0, ErrorUtils_1.getLatestErrorField)(qbdConfig, CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.EXPORTER)} errorRowStyles={[styles.ph5, styles.pv3]} onClose={function () {
            if (!policyID) {
                return;
            }
            (0, Policy_1.clearQBDErrorField)(policyID, CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.EXPORTER);
        }}/>);
}
QuickbooksDesktopPreferredExporterConfigurationPage.displayName = 'QuickbooksDesktopPreferredExporterConfigurationPage';
exports.default = (0, withPolicyConnections_1.default)(QuickbooksDesktopPreferredExporterConfigurationPage);
