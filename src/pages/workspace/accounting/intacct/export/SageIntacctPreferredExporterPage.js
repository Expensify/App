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
var SageIntacct_1 = require("@userActions/connections/SageIntacct");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function SageIntacctPreferredExporterPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var policyOwner = (_b = policy === null || policy === void 0 ? void 0 : policy.owner) !== null && _b !== void 0 ? _b : '';
    var config = ((_d = (_c = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _c === void 0 ? void 0 : _c.intacct) !== null && _d !== void 0 ? _d : {}).config;
    var _k = (_g = (_f = (_e = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _e === void 0 ? void 0 : _e.intacct) === null || _f === void 0 ? void 0 : _f.config) !== null && _g !== void 0 ? _g : {}, exportConfiguration = _k.export, pendingFields = _k.pendingFields;
    var exporters = (0, PolicyUtils_1.getAdminEmployees)(policy);
    var currentUserLogin = (0, useCurrentUserPersonalDetails_1.default)().login;
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var route = (0, native_1.useRoute)();
    var backTo = (_h = route.params) === null || _h === void 0 ? void 0 : _h.backTo;
    var goBack = (0, react_1.useCallback)(function () {
        Navigation_1.default.goBack(backTo !== null && backTo !== void 0 ? backTo : (policyID && ROUTES_1.default.POLICY_ACCOUNTING_SAGE_INTACCT_EXPORT.getRoute(policyID)));
    }, [policyID, backTo]);
    var data = (0, react_1.useMemo)(function () {
        if (!(0, isEmpty_1.default)(policyOwner) && (0, isEmpty_1.default)(exporters)) {
            return [
                {
                    value: policyOwner,
                    text: policyOwner,
                    keyForList: policyOwner,
                    isSelected: (exportConfiguration === null || exportConfiguration === void 0 ? void 0 : exportConfiguration.exporter) === policyOwner,
                },
            ];
        }
        return exporters === null || exporters === void 0 ? void 0 : exporters.reduce(function (options, exporter) {
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
                isSelected: (exportConfiguration === null || exportConfiguration === void 0 ? void 0 : exportConfiguration.exporter) === exporter.email,
            });
            return options;
        }, []);
    }, [exportConfiguration, exporters, policyOwner, currentUserLogin]);
    var selectExporter = (0, react_1.useCallback)(function (row) {
        if (row.value !== (exportConfiguration === null || exportConfiguration === void 0 ? void 0 : exportConfiguration.exporter) && policyID) {
            (0, SageIntacct_1.updateSageIntacctExporter)(policyID, row.value, exportConfiguration === null || exportConfiguration === void 0 ? void 0 : exportConfiguration.exporter);
        }
        goBack();
    }, [policyID, exportConfiguration, goBack]);
    var headerContent = (0, react_1.useMemo)(function () { return (<react_native_1.View style={[styles.pb2, styles.ph5]}>
                <Text_1.default style={[styles.pb2, styles.textNormal]}>{translate('workspace.sageIntacct.exportPreferredExporterNote')}</Text_1.default>
                <Text_1.default style={[styles.pb5, styles.textNormal]}>{translate('workspace.sageIntacct.exportPreferredExporterSubNote')}</Text_1.default>
            </react_native_1.View>); }, [translate, styles.pb2, styles.ph5, styles.pb5, styles.textNormal]);
    return (<SelectionScreen_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} displayName={SageIntacctPreferredExporterPage.displayName} sections={[{ data: data }]} listItem={RadioListItem_1.default} headerContent={headerContent} onSelectRow={selectExporter} initiallyFocusedOptionKey={(_j = data.find(function (mode) { return mode.isSelected; })) === null || _j === void 0 ? void 0 : _j.keyForList} onBackButtonPress={goBack} title="workspace.sageIntacct.preferredExporter" connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.SAGE_INTACCT} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.SAGE_INTACCT_CONFIG.EXPORTER], pendingFields)} errors={(0, ErrorUtils_1.getLatestErrorField)(config !== null && config !== void 0 ? config : {}, CONST_1.default.SAGE_INTACCT_CONFIG.EXPORTER)} errorRowStyles={[styles.ph5, styles.pv3]} onClose={function () { return (0, Policy_1.clearSageIntacctErrorField)(policyID, CONST_1.default.SAGE_INTACCT_CONFIG.EXPORTER); }}/>);
}
SageIntacctPreferredExporterPage.displayName = 'SageIntacctPreferredExporterPage';
exports.default = (0, withPolicyConnections_1.default)(SageIntacctPreferredExporterPage);
