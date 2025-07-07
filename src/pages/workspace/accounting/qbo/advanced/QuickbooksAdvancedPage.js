"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_1 = require("react-native");
var Accordion_1 = require("@components/Accordion");
var ConnectionLayout_1 = require("@components/ConnectionLayout");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var useAccordionAnimation_1 = require("@hooks/useAccordionAnimation");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useWaitForNavigation_1 = require("@hooks/useWaitForNavigation");
var QuickbooksOnline_1 = require("@libs/actions/connections/QuickbooksOnline");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var ToggleSettingsOptionRow_1 = require("@pages/workspace/workflows/ToggleSettingsOptionRow");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
var reimbursementOrCollectionAccountIDs = [CONST_1.default.QUICKBOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID, CONST_1.default.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID];
var collectionAccountIDs = [CONST_1.default.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID];
function QuickbooksAdvancedPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k;
    var policy = _a.policy;
    var styles = (0, useThemeStyles_1.default)();
    var waitForNavigate = (0, useWaitForNavigation_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var qboConfig = (_c = (_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b.quickbooksOnline) === null || _c === void 0 ? void 0 : _c.config;
    var accountingMethod = (_f = (_e = (_d = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _d === void 0 ? void 0 : _d.quickbooksOnline) === null || _e === void 0 ? void 0 : _e.config) === null || _f === void 0 ? void 0 : _f.accountingMethod;
    var _l = (_j = (_h = (_g = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _g === void 0 ? void 0 : _g.quickbooksOnline) === null || _h === void 0 ? void 0 : _h.data) !== null && _j !== void 0 ? _j : {}, bankAccounts = _l.bankAccounts, creditCards = _l.creditCards, otherCurrentAssetAccounts = _l.otherCurrentAssetAccounts, vendors = _l.vendors;
    var nonReimbursableBillDefaultVendorObject = vendors === null || vendors === void 0 ? void 0 : vendors.find(function (vendor) { return vendor.id === (qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.nonReimbursableBillDefaultVendor); });
    var qboAccountOptions = (0, react_1.useMemo)(function () { return __spreadArray(__spreadArray([], (bankAccounts !== null && bankAccounts !== void 0 ? bankAccounts : []), true), (creditCards !== null && creditCards !== void 0 ? creditCards : []), true); }, [bankAccounts, creditCards]);
    var invoiceAccountCollectionOptions = (0, react_1.useMemo)(function () { return __spreadArray(__spreadArray([], (bankAccounts !== null && bankAccounts !== void 0 ? bankAccounts : []), true), (otherCurrentAssetAccounts !== null && otherCurrentAssetAccounts !== void 0 ? otherCurrentAssetAccounts : []), true); }, [bankAccounts, otherCurrentAssetAccounts]);
    var isSyncReimbursedSwitchOn = !!(qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.collectionAccountID);
    var reimbursementAccountID = qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.reimbursementAccountID;
    var selectedQboAccountName = (0, react_1.useMemo)(function () { var _a; return (_a = qboAccountOptions === null || qboAccountOptions === void 0 ? void 0 : qboAccountOptions.find(function (_a) {
        var id = _a.id;
        return id === reimbursementAccountID;
    })) === null || _a === void 0 ? void 0 : _a.name; }, [qboAccountOptions, reimbursementAccountID]);
    var collectionAccountID = qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.collectionAccountID;
    var selectedInvoiceCollectionAccountName = (0, react_1.useMemo)(function () { var _a; return (_a = invoiceAccountCollectionOptions === null || invoiceAccountCollectionOptions === void 0 ? void 0 : invoiceAccountCollectionOptions.find(function (_a) {
        var id = _a.id;
        return id === collectionAccountID;
    })) === null || _a === void 0 ? void 0 : _a.name; }, [invoiceAccountCollectionOptions, collectionAccountID]);
    var autoCreateVendorConst = CONST_1.default.QUICKBOOKS_CONFIG.AUTO_CREATE_VENDOR;
    var defaultVendorConst = CONST_1.default.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR;
    var _m = (0, useAccordionAnimation_1.default)(isSyncReimbursedSwitchOn), isAccordionExpanded = _m.isAccordionExpanded, shouldAnimateAccordionSection = _m.shouldAnimateAccordionSection;
    var AccordionMenuItems = [
        {
            title: selectedQboAccountName,
            description: translate('workspace.qbo.advancedConfig.qboBillPaymentAccount'),
            onPress: waitForNavigate(function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_ACCOUNT_SELECTOR.getRoute(policyID)); }),
            subscribedSettings: reimbursementOrCollectionAccountIDs,
            brickRoadIndicator: (0, PolicyUtils_1.areSettingsInErrorFields)(reimbursementOrCollectionAccountIDs, qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.errorFields) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            pendingAction: (0, PolicyUtils_1.settingsPendingAction)(reimbursementOrCollectionAccountIDs, qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.pendingFields),
        },
        {
            title: selectedInvoiceCollectionAccountName,
            description: translate('workspace.qbo.advancedConfig.qboInvoiceCollectionAccount'),
            onPress: waitForNavigate(function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_INVOICE_ACCOUNT_SELECTOR.getRoute(policyID)); }),
            subscribedSettings: collectionAccountIDs,
            brickRoadIndicator: (0, PolicyUtils_1.areSettingsInErrorFields)(collectionAccountIDs, qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.errorFields) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            pendingAction: (0, PolicyUtils_1.settingsPendingAction)(collectionAccountIDs, qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.pendingFields),
        },
    ];
    var syncReimbursedSubMenuItems = function () { return (<react_native_1.View style={[styles.mt3]}>
            {AccordionMenuItems.map(function (item) { return (<OfflineWithFeedback_1.default pendingAction={item.pendingAction}>
                    <MenuItemWithTopDescription_1.default shouldShowRightIcon title={item.title} description={item.description} wrapperStyle={[styles.sectionMenuItemTopDescription]} onPress={item.onPress} brickRoadIndicator={item.brickRoadIndicator}/>
                </OfflineWithFeedback_1.default>); })}
        </react_native_1.View>); };
    var qboToggleSettingItems = [
        {
            title: translate('workspace.qbo.advancedConfig.inviteEmployees'),
            subtitle: translate('workspace.qbo.advancedConfig.inviteEmployeesDescription'),
            switchAccessibilityLabel: translate('workspace.qbo.advancedConfig.inviteEmployeesDescription'),
            isActive: !!(qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.syncPeople),
            onToggle: function () { return (0, QuickbooksOnline_1.updateQuickbooksOnlineSyncPeople)(policyID, !(qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.syncPeople)); },
            subscribedSetting: CONST_1.default.QUICKBOOKS_CONFIG.SYNC_PEOPLE,
            errors: (0, ErrorUtils_1.getLatestErrorField)(qboConfig, CONST_1.default.QUICKBOOKS_CONFIG.SYNC_PEOPLE),
            pendingAction: (0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.QUICKBOOKS_CONFIG.SYNC_PEOPLE], qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.pendingFields),
        },
        {
            title: translate('workspace.qbo.advancedConfig.createEntities'),
            subtitle: translate('workspace.qbo.advancedConfig.createEntitiesDescription'),
            switchAccessibilityLabel: translate('workspace.qbo.advancedConfig.createEntitiesDescription'),
            isActive: !!(qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.autoCreateVendor),
            onToggle: function (isOn) {
                var _a, _b;
                var _c, _d, _e, _f, _g, _h, _j;
                var nonReimbursableVendorUpdateValue = isOn
                    ? ((_h = (_g = (_f = (_e = (_d = (_c = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _c === void 0 ? void 0 : _c.quickbooksOnline) === null || _d === void 0 ? void 0 : _d.data) === null || _e === void 0 ? void 0 : _e.vendors) === null || _f === void 0 ? void 0 : _f[0]) === null || _g === void 0 ? void 0 : _g.id) !== null && _h !== void 0 ? _h : CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NONE)
                    : CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NONE;
                var nonReimbursableVendorCurrentValue = (_j = nonReimbursableBillDefaultVendorObject === null || nonReimbursableBillDefaultVendorObject === void 0 ? void 0 : nonReimbursableBillDefaultVendorObject.id) !== null && _j !== void 0 ? _j : CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NONE;
                (0, QuickbooksOnline_1.updateQuickbooksOnlineAutoCreateVendor)(policyID, (_a = {},
                    _a[autoCreateVendorConst] = isOn,
                    _a[defaultVendorConst] = nonReimbursableVendorUpdateValue,
                    _a), (_b = {},
                    _b[autoCreateVendorConst] = !!(qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.autoCreateVendor),
                    _b[defaultVendorConst] = nonReimbursableVendorCurrentValue,
                    _b));
            },
            subscribedSetting: CONST_1.default.QUICKBOOKS_CONFIG.AUTO_CREATE_VENDOR,
            errors: (0, ErrorUtils_1.getLatestErrorField)(qboConfig, CONST_1.default.QUICKBOOKS_CONFIG.AUTO_CREATE_VENDOR),
            pendingAction: (0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.QUICKBOOKS_CONFIG.AUTO_CREATE_VENDOR], qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.pendingFields),
        },
        {
            title: translate('workspace.accounting.reimbursedReports'),
            subtitle: translate('workspace.qbo.advancedConfig.reimbursedReportsDescription'),
            switchAccessibilityLabel: translate('workspace.qbo.advancedConfig.reimbursedReportsDescription'),
            isActive: isSyncReimbursedSwitchOn,
            onToggle: function () {
                var _a;
                return (0, QuickbooksOnline_1.updateQuickbooksOnlineCollectionAccountID)(policyID, isSyncReimbursedSwitchOn ? '' : (_a = __spreadArray(__spreadArray([], qboAccountOptions, true), invoiceAccountCollectionOptions, true).at(0)) === null || _a === void 0 ? void 0 : _a.id, qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.collectionAccountID);
            },
            subscribedSetting: CONST_1.default.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID,
            errors: (0, ErrorUtils_1.getLatestErrorField)(qboConfig, CONST_1.default.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID),
            pendingAction: (0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID], qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.pendingFields),
        },
    ];
    return (<ConnectionLayout_1.default displayName={QuickbooksAdvancedPage.displayName} headerTitle="workspace.accounting.advanced" accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} contentContainerStyle={[styles.pb2, styles.ph5]} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.QBO}>
            <OfflineWithFeedback_1.default pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.QUICKBOOKS_CONFIG.AUTO_SYNC, CONST_1.default.QUICKBOOKS_CONFIG.ACCOUNTING_METHOD], qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.pendingFields)}>
                <MenuItemWithTopDescription_1.default title={((_k = qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.autoSync) === null || _k === void 0 ? void 0 : _k.enabled) ? translate('common.enabled') : translate('common.disabled')} description={translate('workspace.accounting.autoSync')} shouldShowRightIcon wrapperStyle={[styles.sectionMenuItemTopDescription]} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_AUTO_SYNC.getRoute(policyID)); }} brickRoadIndicator={(0, PolicyUtils_1.areSettingsInErrorFields)([CONST_1.default.QUICKBOOKS_CONFIG.AUTO_SYNC, CONST_1.default.QUICKBOOKS_CONFIG.ACCOUNTING_METHOD], qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.errorFields)
            ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR
            : undefined} hintText={(function () {
            var _a;
            if (!((_a = qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.autoSync) === null || _a === void 0 ? void 0 : _a.enabled)) {
                return undefined;
            }
            return translate("workspace.qbo.accountingMethods.alternateText.".concat(accountingMethod !== null && accountingMethod !== void 0 ? accountingMethod : expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH));
        })()}/>
            </OfflineWithFeedback_1.default>
            {qboToggleSettingItems.map(function (item) { return (<ToggleSettingsOptionRow_1.default key={item.title} title={item.title} subtitle={item.subtitle} switchAccessibilityLabel={item.switchAccessibilityLabel} shouldPlaceSubtitleBelowSwitch wrapperStyle={styles.mv3} isActive={item.isActive} onToggle={item.onToggle} pendingAction={item.pendingAction} errors={item.errors} onCloseError={function () { return (0, Policy_1.clearQBOErrorField)(policyID, item.subscribedSetting); }}/>); })}
            <Accordion_1.default isExpanded={isAccordionExpanded} isToggleTriggered={shouldAnimateAccordionSection}>
                {syncReimbursedSubMenuItems()}
            </Accordion_1.default>
        </ConnectionLayout_1.default>);
}
QuickbooksAdvancedPage.displayName = 'QuickbooksAdvancedPage';
exports.default = (0, withPolicyConnections_1.default)(QuickbooksAdvancedPage);
