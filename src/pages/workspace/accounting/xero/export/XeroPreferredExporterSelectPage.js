"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var isEmpty_1 = require("lodash/isEmpty");
var react_1 = require("react");
var react_native_1 = require("react-native");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var SelectionScreen_1 = require("@components/SelectionScreen");
var Text_1 = require("@components/Text");
var useCurrentUserPersonalDetails_1 = require("@hooks/useCurrentUserPersonalDetails");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Policy_1 = require("@libs/actions/Policy/Policy");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var Navigation_1 = require("@navigation/Navigation");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var Xero_1 = require("@userActions/connections/Xero");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function XeroPreferredExporterSelectPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h;
    var policy = _a.policy;
    var config = ((_c = (_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b.xero) !== null && _c !== void 0 ? _c : {}).config;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var policyOwner = (_d = policy === null || policy === void 0 ? void 0 : policy.owner) !== null && _d !== void 0 ? _d : '';
    var exporters = (0, PolicyUtils_1.getAdminEmployees)(policy);
    var currentUserLogin = (0, useCurrentUserPersonalDetails_1.default)().login;
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var route = (0, native_1.useRoute)();
    var backTo = (_e = route.params) === null || _e === void 0 ? void 0 : _e.backTo;
    var goBack = (0, react_1.useCallback)(function () {
        Navigation_1.default.goBack(backTo !== null && backTo !== void 0 ? backTo : (policyID && ROUTES_1.default.POLICY_ACCOUNTING_XERO_EXPORT.getRoute(policyID)));
    }, [policyID, backTo]);
    var data = (0, react_1.useMemo)(function () {
        if (!(0, isEmpty_1.default)(policyOwner) && (0, isEmpty_1.default)(exporters)) {
            return [
                {
                    value: policyOwner,
                    text: policyOwner,
                    keyForList: policyOwner,
                    isSelected: true,
                },
            ];
        }
        return exporters === null || exporters === void 0 ? void 0 : exporters.reduce(function (options, exporter) {
            var _a, _b;
            if (!exporter.email) {
                return options;
            }
            // Don't show guides if the current user is not a guide themselves or an Expensify employee
            if ((0, PolicyUtils_1.isExpensifyTeam)(exporter.email) && !(0, PolicyUtils_1.isExpensifyTeam)(policyOwner) && !(0, PolicyUtils_1.isExpensifyTeam)(currentUserLogin)) {
                return options;
            }
            options.push({
                value: exporter.email,
                text: exporter.email,
                keyForList: exporter.email,
                isSelected: ((_b = (_a = config === null || config === void 0 ? void 0 : config.export) === null || _a === void 0 ? void 0 : _a.exporter) !== null && _b !== void 0 ? _b : policyOwner) === exporter.email,
            });
            return options;
        }, []);
    }, [policyOwner, exporters, currentUserLogin, (_f = config === null || config === void 0 ? void 0 : config.export) === null || _f === void 0 ? void 0 : _f.exporter]);
    var selectExporter = (0, react_1.useCallback)(function (row) {
        var _a, _b;
        if (row.value !== ((_a = config === null || config === void 0 ? void 0 : config.export) === null || _a === void 0 ? void 0 : _a.exporter) && policyID) {
            (0, Xero_1.updateXeroExportExporter)(policyID, row.value, (_b = config === null || config === void 0 ? void 0 : config.export) === null || _b === void 0 ? void 0 : _b.exporter);
        }
        goBack();
    }, [policyID, (_g = config === null || config === void 0 ? void 0 : config.export) === null || _g === void 0 ? void 0 : _g.exporter, goBack]);
    var headerContent = (0, react_1.useMemo)(function () { return (<react_native_1.View style={[styles.pb2, styles.ph5]}>
                <Text_1.default style={[styles.pb2, styles.textNormal]}>{translate('workspace.accounting.exportPreferredExporterNote')}</Text_1.default>
                <Text_1.default style={[styles.pb5, styles.textNormal]}>{translate('workspace.accounting.exportPreferredExporterSubNote')}</Text_1.default>
            </react_native_1.View>); }, [translate, styles.pb2, styles.ph5, styles.pb5, styles.textNormal]);
    return (<SelectionScreen_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} displayName={XeroPreferredExporterSelectPage.displayName} sections={[{ data: data }]} listItem={RadioListItem_1.default} headerContent={headerContent} onSelectRow={selectExporter} initiallyFocusedOptionKey={(_h = data.find(function (mode) { return mode.isSelected; })) === null || _h === void 0 ? void 0 : _h.keyForList} onBackButtonPress={goBack} title="workspace.accounting.preferredExporter" connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.XERO} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.XERO_CONFIG.EXPORTER], config === null || config === void 0 ? void 0 : config.pendingFields)} errors={(0, ErrorUtils_1.getLatestErrorField)(config !== null && config !== void 0 ? config : {}, CONST_1.default.XERO_CONFIG.EXPORTER)} errorRowStyles={[styles.ph5, styles.pv3]} onClose={function () { return (0, Policy_1.clearXeroErrorField)(policyID, CONST_1.default.XERO_CONFIG.EXPORTER); }}/>);
}
XeroPreferredExporterSelectPage.displayName = 'XeroPreferredExporterSelectPage';
exports.default = (0, withPolicyConnections_1.default)(XeroPreferredExporterSelectPage);
