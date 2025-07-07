"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldHideReimbursedReportsSection = void 0;
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_reanimated_1 = require("react-native-reanimated");
var Accordion_1 = require("@components/Accordion");
var ConnectionLayout_1 = require("@components/ConnectionLayout");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var NetSuiteCommands_1 = require("@libs/actions/connections/NetSuiteCommands");
var Policy_1 = require("@libs/actions/Policy/Policy");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var utils_1 = require("@pages/workspace/accounting/netsuite/utils");
Object.defineProperty(exports, "shouldHideReimbursedReportsSection", { enumerable: true, get: function () { return utils_1.shouldHideReimbursedReportsSection; } });
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var ToggleSettingsOptionRow_1 = require("@pages/workspace/workflows/ToggleSettingsOptionRow");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function NetSuiteAdvancedPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var policyID = (_b = policy === null || policy === void 0 ? void 0 : policy.id) !== null && _b !== void 0 ? _b : "".concat(CONST_1.default.DEFAULT_NUMBER_ID);
    var config = (_e = (_d = (_c = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _c === void 0 ? void 0 : _c.netsuite) === null || _d === void 0 ? void 0 : _d.options) === null || _e === void 0 ? void 0 : _e.config;
    var autoSyncConfig = (_g = (_f = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _f === void 0 ? void 0 : _f.netsuite) === null || _g === void 0 ? void 0 : _g.config;
    var accountingMethod = (_l = (_k = (_j = (_h = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _h === void 0 ? void 0 : _h.netsuite) === null || _j === void 0 ? void 0 : _j.options) === null || _k === void 0 ? void 0 : _k.config) === null || _l === void 0 ? void 0 : _l.accountingMethod;
    var payableList = ((_q = (_p = (_o = (_m = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _m === void 0 ? void 0 : _m.netsuite) === null || _o === void 0 ? void 0 : _o.options) === null || _p === void 0 ? void 0 : _p.data) !== null && _q !== void 0 ? _q : {}).payableList;
    var shouldShowCustomFormIDOptions = (0, react_native_reanimated_1.useSharedValue)(!(0, utils_1.shouldHideCustomFormIDOptions)(config));
    var shouldAnimateAccordionSection = (0, react_native_reanimated_1.useSharedValue)(false);
    var selectedReimbursementAccount = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.findSelectedBankAccountWithDefaultSelect)((0, PolicyUtils_1.getFilteredReimbursableAccountOptions)(payableList), config === null || config === void 0 ? void 0 : config.reimbursementAccountID); }, [payableList, config === null || config === void 0 ? void 0 : config.reimbursementAccountID]);
    var selectedCollectionAccount = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.findSelectedBankAccountWithDefaultSelect)((0, PolicyUtils_1.getFilteredCollectionAccountOptions)(payableList), config === null || config === void 0 ? void 0 : config.collectionAccount); }, [payableList, config === null || config === void 0 ? void 0 : config.collectionAccount]);
    var selectedApprovalAccount = (0, react_1.useMemo)(function () {
        if ((config === null || config === void 0 ? void 0 : config.approvalAccount) === CONST_1.default.NETSUITE_APPROVAL_ACCOUNT_DEFAULT) {
            return {
                id: CONST_1.default.NETSUITE_APPROVAL_ACCOUNT_DEFAULT,
                name: translate('workspace.netsuite.advancedConfig.defaultApprovalAccount'),
            };
        }
        return (0, PolicyUtils_1.findSelectedBankAccountWithDefaultSelect)((0, PolicyUtils_1.getFilteredApprovalAccountOptions)(payableList), config === null || config === void 0 ? void 0 : config.approvalAccount);
    }, [config === null || config === void 0 ? void 0 : config.approvalAccount, payableList, translate]);
    var renderDefaultMenuItem = function (item) {
        var _a;
        return (<OfflineWithFeedback_1.default key={item.description} pendingAction={(_a = (0, PolicyUtils_1.settingsPendingAction)(item.subscribedSettings, config === null || config === void 0 ? void 0 : config.pendingFields)) !== null && _a !== void 0 ? _a : (0, PolicyUtils_1.settingsPendingAction)(item.subscribedSettings, autoSyncConfig === null || autoSyncConfig === void 0 ? void 0 : autoSyncConfig.pendingFields)}>
                <MenuItemWithTopDescription_1.default title={item.title} description={item.description} shouldShowRightIcon onPress={item === null || item === void 0 ? void 0 : item.onPress} brickRoadIndicator={(0, PolicyUtils_1.areSettingsInErrorFields)(item.subscribedSettings, config === null || config === void 0 ? void 0 : config.errorFields) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined} hintText={item.hintText}/>
            </OfflineWithFeedback_1.default>);
    };
    var menuItems = [
        {
            type: 'menuitem',
            title: ((_r = autoSyncConfig === null || autoSyncConfig === void 0 ? void 0 : autoSyncConfig.autoSync) === null || _r === void 0 ? void 0 : _r.enabled) ? translate('common.enabled') : translate('common.disabled'),
            description: translate('workspace.accounting.autoSync'),
            onPress: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_AUTO_SYNC.getRoute(policyID)); },
            hintText: (function () {
                var _a;
                if (!((_a = autoSyncConfig === null || autoSyncConfig === void 0 ? void 0 : autoSyncConfig.autoSync) === null || _a === void 0 ? void 0 : _a.enabled)) {
                    return undefined;
                }
                return translate("workspace.netsuite.advancedConfig.accountingMethods.alternateText.".concat(accountingMethod !== null && accountingMethod !== void 0 ? accountingMethod : expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH));
            })(),
            subscribedSettings: [CONST_1.default.NETSUITE_CONFIG.AUTO_SYNC, CONST_1.default.NETSUITE_CONFIG.ACCOUNTING_METHOD],
        },
        {
            type: 'divider',
            key: 'divider1',
        },
        {
            type: 'toggle',
            title: translate('workspace.accounting.reimbursedReports'),
            subtitle: translate('workspace.netsuite.advancedConfig.reimbursedReportsDescription'),
            isActive: !!(config === null || config === void 0 ? void 0 : config.syncOptions.syncReimbursedReports),
            switchAccessibilityLabel: translate('workspace.netsuite.advancedConfig.reimbursedReportsDescription'),
            shouldPlaceSubtitleBelowSwitch: true,
            onCloseError: function () { return (0, Policy_1.clearNetSuiteErrorField)(policyID, CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.SYNC_REIMBURSED_REPORTS); },
            onToggle: function (isEnabled) { return (0, NetSuiteCommands_1.updateNetSuiteSyncReimbursedReports)(policyID, isEnabled); },
            pendingAction: (0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.SYNC_REIMBURSED_REPORTS], config === null || config === void 0 ? void 0 : config.pendingFields),
            errors: (0, ErrorUtils_1.getLatestErrorField)(config, CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.SYNC_REIMBURSED_REPORTS),
            shouldHide: (0, utils_1.shouldHideReimbursedReportsSection)(config),
        },
        {
            type: 'menuitem',
            description: translate('workspace.netsuite.advancedConfig.reimbursementsAccount'),
            onPress: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_REIMBURSEMENT_ACCOUNT_SELECT.getRoute(policyID)); },
            title: selectedReimbursementAccount ? selectedReimbursementAccount.name : undefined,
            subscribedSettings: [CONST_1.default.NETSUITE_CONFIG.REIMBURSEMENT_ACCOUNT_ID],
            shouldHide: (0, utils_1.shouldHideReimbursedReportsSection)(config),
        },
        {
            type: 'menuitem',
            description: translate('workspace.netsuite.advancedConfig.collectionsAccount'),
            onPress: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_COLLECTION_ACCOUNT_SELECT.getRoute(policyID)); },
            title: selectedCollectionAccount ? selectedCollectionAccount.name : undefined,
            subscribedSettings: [CONST_1.default.NETSUITE_CONFIG.COLLECTION_ACCOUNT],
            shouldHide: (0, utils_1.shouldHideReimbursedReportsSection)(config),
        },
        {
            type: 'divider',
            key: 'divider2',
            shouldHide: (0, utils_1.shouldHideReimbursedReportsSection)(config),
        },
        {
            type: 'toggle',
            title: translate('workspace.netsuite.advancedConfig.inviteEmployees'),
            subtitle: translate('workspace.netsuite.advancedConfig.inviteEmployeesDescription'),
            isActive: !!(config === null || config === void 0 ? void 0 : config.syncOptions.syncPeople),
            switchAccessibilityLabel: translate('workspace.netsuite.advancedConfig.inviteEmployeesDescription'),
            shouldPlaceSubtitleBelowSwitch: true,
            shouldParseSubtitle: true,
            onCloseError: function () { return (0, Policy_1.clearNetSuiteErrorField)(policyID, CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.SYNC_PEOPLE); },
            onToggle: function (isEnabled) { return (0, NetSuiteCommands_1.updateNetSuiteSyncPeople)(policyID, isEnabled); },
            pendingAction: (0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.SYNC_PEOPLE], config === null || config === void 0 ? void 0 : config.pendingFields),
            errors: (0, ErrorUtils_1.getLatestErrorField)(config, CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.SYNC_PEOPLE),
        },
        {
            type: 'toggle',
            title: translate('workspace.netsuite.advancedConfig.autoCreateEntities'),
            isActive: !!(config === null || config === void 0 ? void 0 : config.autoCreateEntities),
            switchAccessibilityLabel: translate('workspace.netsuite.advancedConfig.autoCreateEntities'),
            onCloseError: function () { return (0, Policy_1.clearNetSuiteErrorField)(policyID, CONST_1.default.NETSUITE_CONFIG.AUTO_CREATE_ENTITIES); },
            onToggle: function (isEnabled) { return (0, NetSuiteCommands_1.updateNetSuiteAutoCreateEntities)(policyID, isEnabled); },
            pendingAction: (0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.NETSUITE_CONFIG.AUTO_CREATE_ENTITIES], config === null || config === void 0 ? void 0 : config.pendingFields),
            errors: (0, ErrorUtils_1.getLatestErrorField)(config, CONST_1.default.NETSUITE_CONFIG.AUTO_CREATE_ENTITIES),
        },
        {
            type: 'divider',
            key: 'divider3',
        },
        {
            type: 'toggle',
            title: translate('workspace.netsuite.advancedConfig.enableCategories'),
            isActive: !!(config === null || config === void 0 ? void 0 : config.syncOptions.enableNewCategories),
            switchAccessibilityLabel: translate('workspace.netsuite.advancedConfig.enableCategories'),
            onCloseError: function () { return (0, Policy_1.clearNetSuiteErrorField)(policyID, CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.ENABLE_NEW_CATEGORIES); },
            onToggle: function (isEnabled) { return (0, NetSuiteCommands_1.updateNetSuiteEnableNewCategories)(policyID, isEnabled); },
            pendingAction: (0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.ENABLE_NEW_CATEGORIES], config === null || config === void 0 ? void 0 : config.pendingFields),
            errors: (0, ErrorUtils_1.getLatestErrorField)(config, CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.ENABLE_NEW_CATEGORIES),
        },
        {
            type: 'divider',
            key: 'divider4',
        },
        {
            type: 'menuitem',
            description: translate('workspace.netsuite.advancedConfig.exportReportsTo.label'),
            onPress: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_EXPENSE_REPORT_APPROVAL_LEVEL_SELECT.getRoute(policyID)); },
            title: (config === null || config === void 0 ? void 0 : config.syncOptions.exportReportsTo) ? translate("workspace.netsuite.advancedConfig.exportReportsTo.values.".concat(config.syncOptions.exportReportsTo)) : undefined,
            subscribedSettings: [CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.EXPORT_REPORTS_TO],
            shouldHide: (0, utils_1.shouldHideReportsExportTo)(config),
        },
        {
            type: 'menuitem',
            description: translate('workspace.netsuite.advancedConfig.exportVendorBillsTo.label'),
            onPress: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_VENDOR_BILL_APPROVAL_LEVEL_SELECT.getRoute(policyID)); },
            title: (config === null || config === void 0 ? void 0 : config.syncOptions.exportVendorBillsTo) ? translate("workspace.netsuite.advancedConfig.exportVendorBillsTo.values.".concat(config.syncOptions.exportVendorBillsTo)) : undefined,
            subscribedSettings: [CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.EXPORT_VENDOR_BILLS_TO],
            shouldHide: (0, utils_1.shouldHideExportVendorBillsTo)(config),
        },
        {
            type: 'menuitem',
            description: translate('workspace.netsuite.advancedConfig.exportJournalsTo.label'),
            onPress: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_JOURNAL_ENTRY_APPROVAL_LEVEL_SELECT.getRoute(policyID)); },
            title: (config === null || config === void 0 ? void 0 : config.syncOptions.exportJournalsTo) ? translate("workspace.netsuite.advancedConfig.exportJournalsTo.values.".concat(config.syncOptions.exportJournalsTo)) : undefined,
            subscribedSettings: [CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.EXPORT_JOURNALS_TO],
            shouldHide: (0, utils_1.shouldHideExportJournalsTo)(config),
        },
        {
            type: 'menuitem',
            description: translate('workspace.netsuite.advancedConfig.approvalAccount'),
            onPress: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_APPROVAL_ACCOUNT_SELECT.getRoute(policyID)); },
            title: selectedApprovalAccount ? selectedApprovalAccount.name : undefined,
            subscribedSettings: [CONST_1.default.NETSUITE_CONFIG.APPROVAL_ACCOUNT],
        },
        {
            type: 'divider',
            key: 'divider5',
        },
        {
            type: 'toggle',
            title: translate('workspace.netsuite.advancedConfig.customFormID'),
            subtitle: translate('workspace.netsuite.advancedConfig.customFormIDDescription'),
            isActive: !!((_s = config === null || config === void 0 ? void 0 : config.customFormIDOptions) === null || _s === void 0 ? void 0 : _s.enabled),
            switchAccessibilityLabel: translate('workspace.netsuite.advancedConfig.customFormIDDescription'),
            shouldPlaceSubtitleBelowSwitch: true,
            onCloseError: function () { return (0, Policy_1.clearNetSuiteErrorField)(policyID, CONST_1.default.NETSUITE_CONFIG.CUSTOM_FORM_ID_ENABLED); },
            onToggle: function (isEnabled) {
                (0, NetSuiteCommands_1.updateNetSuiteCustomFormIDOptionsEnabled)(policyID, isEnabled);
                shouldShowCustomFormIDOptions.set(isEnabled);
                shouldAnimateAccordionSection.set(true);
            },
            pendingAction: (0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.NETSUITE_CONFIG.CUSTOM_FORM_ID_ENABLED], config === null || config === void 0 ? void 0 : config.pendingFields),
            errors: (0, ErrorUtils_1.getLatestErrorField)(config, CONST_1.default.NETSUITE_CONFIG.CUSTOM_FORM_ID_ENABLED),
        },
        {
            type: 'accordion',
            children: [
                {
                    type: 'menuitem',
                    description: translate('workspace.netsuite.advancedConfig.customFormIDReimbursable'),
                    onPress: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_CUSTOM_FORM_ID.getRoute(policyID, CONST_1.default.NETSUITE_EXPENSE_TYPE.REIMBURSABLE)); },
                    title: (_u = (_t = config === null || config === void 0 ? void 0 : config.customFormIDOptions) === null || _t === void 0 ? void 0 : _t.reimbursable) === null || _u === void 0 ? void 0 : _u[CONST_1.default.NETSUITE_MAP_EXPORT_DESTINATION[config.reimbursableExpensesExportDestination]],
                    subscribedSettings: [CONST_1.default.NETSUITE_CONFIG.CUSTOM_FORM_ID_TYPE.REIMBURSABLE],
                    shouldHide: (0, utils_1.shouldHideCustomFormIDOptions)(config),
                },
                {
                    type: 'menuitem',
                    description: translate('workspace.netsuite.advancedConfig.customFormIDNonReimbursable'),
                    onPress: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_CUSTOM_FORM_ID.getRoute(policyID, CONST_1.default.NETSUITE_EXPENSE_TYPE.NON_REIMBURSABLE)); },
                    title: (_w = (_v = config === null || config === void 0 ? void 0 : config.customFormIDOptions) === null || _v === void 0 ? void 0 : _v.nonReimbursable) === null || _w === void 0 ? void 0 : _w[CONST_1.default.NETSUITE_MAP_EXPORT_DESTINATION[config.nonreimbursableExpensesExportDestination]],
                    subscribedSettings: [CONST_1.default.NETSUITE_CONFIG.CUSTOM_FORM_ID_TYPE.NON_REIMBURSABLE],
                    shouldHide: (0, utils_1.shouldHideCustomFormIDOptions)(config),
                },
            ],
            shouldHide: false,
            shouldExpand: shouldShowCustomFormIDOptions,
            shouldAnimateSection: shouldAnimateAccordionSection,
        },
    ];
    return (<ConnectionLayout_1.default displayName={NetSuiteAdvancedPage.displayName} headerTitle="workspace.accounting.advanced" headerSubtitle={(_x = config === null || config === void 0 ? void 0 : config.subsidiary) !== null && _x !== void 0 ? _x : ''} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} contentContainerStyle={styles.pb2} titleStyle={styles.ph5} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE}>
            {menuItems
            .filter(function (item) { return !(item === null || item === void 0 ? void 0 : item.shouldHide); })
            .map(function (item) {
            switch (item.type) {
                case 'divider':
                    return (<react_native_1.View key={item.key} style={styles.dividerLine}/>);
                case 'toggle':
                    // eslint-disable-next-line no-case-declarations
                    var type = item.type, shouldHide = item.shouldHide, rest = __rest(item, ["type", "shouldHide"]);
                    return (<ToggleSettingsOptionRow_1.default key={rest.title} 
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...rest} wrapperStyle={[styles.mv3, styles.ph5]}/>);
                case 'accordion':
                    return (<Accordion_1.default isExpanded={item.shouldExpand} isToggleTriggered={item.shouldAnimateSection}>
                                    {item.children.map(function (child) {
                            return renderDefaultMenuItem(child);
                        })}
                                </Accordion_1.default>);
                default:
                    return renderDefaultMenuItem(item);
            }
        })}
        </ConnectionLayout_1.default>);
}
NetSuiteAdvancedPage.displayName = 'NetSuiteAdvancedPage';
exports.default = (0, withPolicyConnections_1.default)(NetSuiteAdvancedPage);
