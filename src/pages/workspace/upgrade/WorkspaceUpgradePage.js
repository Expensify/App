"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var QuickbooksOnline_1 = require("@libs/actions/connections/QuickbooksOnline");
var Xero_1 = require("@libs/actions/connections/Xero");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var NotFoundPage_1 = require("@pages/ErrorPage/NotFoundPage");
var PerDiem_1 = require("@userActions/Policy/PerDiem");
var CONST_1 = require("@src/CONST");
var Policy_1 = require("@src/libs/actions/Policy/Policy");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var UpgradeConfirmation_1 = require("./UpgradeConfirmation");
var UpgradeIntro_1 = require("./UpgradeIntro");
function getFeatureNameAlias(featureName) {
    switch (featureName) {
        case CONST_1.default.REPORT_FIELDS_FEATURE.qbo.classes:
        case CONST_1.default.REPORT_FIELDS_FEATURE.qbo.customers:
        case CONST_1.default.REPORT_FIELDS_FEATURE.qbo.locations:
        case CONST_1.default.REPORT_FIELDS_FEATURE.xero.mapping:
            return CONST_1.default.UPGRADE_FEATURE_INTRO_MAPPING.reportFields.alias;
        default: {
            return featureName;
        }
    }
}
function WorkspaceUpgradePage(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    var route = _a.route;
    var styles = (0, useThemeStyles_1.default)();
    var policyID = (_b = route.params) === null || _b === void 0 ? void 0 : _b.policyID;
    var featureNameAlias = ((_c = route.params) === null || _c === void 0 ? void 0 : _c.featureName) && getFeatureNameAlias(route.params.featureName);
    var feature = (0, react_1.useMemo)(function () {
        return Object.values(CONST_1.default.UPGRADE_FEATURE_INTRO_MAPPING)
            .filter(function (value) { return value.id !== CONST_1.default.UPGRADE_FEATURE_INTRO_MAPPING.policyPreventMemberChangingTitle.id; })
            .find(function (f) { return f.alias === featureNameAlias; });
    }, [featureNameAlias]);
    var translate = (0, useLocalize_1.default)().translate;
    var policy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), { canBeMissing: true })[0];
    var qboConfig = (_e = (_d = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _d === void 0 ? void 0 : _d.quickbooksOnline) === null || _e === void 0 ? void 0 : _e.config;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var canPerformUpgrade = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.canModifyPlan)(policyID); }, [policyID]);
    var isUpgraded = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.isControlPolicy)(policy); }, [policy]);
    var perDiemCustomUnit = (0, PolicyUtils_1.getPerDiemCustomUnit)(policy);
    var categoryId = (_f = route.params) === null || _f === void 0 ? void 0 : _f.categoryId;
    var goBack = (0, react_1.useCallback)(function () {
        if ((!feature && featureNameAlias !== CONST_1.default.UPGRADE_FEATURE_INTRO_MAPPING.policyPreventMemberChangingTitle.alias) || !policyID) {
            Navigation_1.default.dismissModal();
            return;
        }
        switch (feature === null || feature === void 0 ? void 0 : feature.id) {
            case CONST_1.default.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id:
                Navigation_1.default.goBack();
                if (route.params.backTo) {
                    Navigation_1.default.navigate(route.params.backTo);
                }
                return;
            case CONST_1.default.UPGRADE_FEATURE_INTRO_MAPPING.reportFields.id:
                switch (route.params.featureName) {
                    case CONST_1.default.UPGRADE_FEATURE_INTRO_MAPPING.reportFields.alias:
                        return Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_REPORT_FIELDS.getRoute(policyID));
                    default: {
                        Navigation_1.default.goBack();
                        if (route.params.backTo) {
                            Navigation_1.default.navigate(route.params.backTo);
                        }
                        return;
                    }
                }
            case CONST_1.default.UPGRADE_FEATURE_INTRO_MAPPING.companyCards.id:
                Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_COMPANY_CARDS_ADD_NEW.getRoute(policyID, ROUTES_1.default.WORKSPACE_COMPANY_CARDS_SELECT_FEED.getRoute(policyID)));
                return;
            case CONST_1.default.UPGRADE_FEATURE_INTRO_MAPPING.rules.id:
            case CONST_1.default.UPGRADE_FEATURE_INTRO_MAPPING.perDiem.id:
                return Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_MORE_FEATURES.getRoute(policyID));
            default:
                return route.params.backTo ? Navigation_1.default.goBack(route.params.backTo) : Navigation_1.default.goBack();
        }
    }, [feature, policyID, (_g = route.params) === null || _g === void 0 ? void 0 : _g.backTo, (_h = route.params) === null || _h === void 0 ? void 0 : _h.featureName, featureNameAlias]);
    var onUpgradeToCorporate = function () {
        if (!canPerformUpgrade || !policy) {
            return;
        }
        (0, Policy_1.upgradeToCorporate)(policy.id, feature === null || feature === void 0 ? void 0 : feature.name);
    };
    var confirmUpgrade = (0, react_1.useCallback)(function () {
        var _a, _b;
        var _c, _d, _e, _f, _g, _h, _j;
        if (!policyID) {
            return;
        }
        if (!feature) {
            if (featureNameAlias === CONST_1.default.UPGRADE_FEATURE_INTRO_MAPPING.policyPreventMemberChangingTitle.alias) {
                (0, Policy_1.setPolicyPreventMemberCreatedTitle)(policyID, true);
            }
            return;
        }
        switch (feature.id) {
            case CONST_1.default.UPGRADE_FEATURE_INTRO_MAPPING.reportFields.id:
                switch (route.params.featureName) {
                    case CONST_1.default.REPORT_FIELDS_FEATURE.qbo.classes:
                        (0, QuickbooksOnline_1.updateQuickbooksOnlineSyncClasses)(policyID, CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD, qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.syncClasses);
                        break;
                    case CONST_1.default.REPORT_FIELDS_FEATURE.qbo.customers:
                        (0, QuickbooksOnline_1.updateQuickbooksOnlineSyncCustomers)(policyID, CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD, qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.syncCustomers);
                        break;
                    case CONST_1.default.REPORT_FIELDS_FEATURE.qbo.locations:
                        (0, QuickbooksOnline_1.updateQuickbooksOnlineSyncLocations)(policyID, CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD, qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.syncLocations);
                        break;
                    case CONST_1.default.REPORT_FIELDS_FEATURE.xero.mapping: {
                        var trackingCategories = ((_e = (_d = (_c = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _c === void 0 ? void 0 : _c.xero) === null || _d === void 0 ? void 0 : _d.data) !== null && _e !== void 0 ? _e : {}).trackingCategories;
                        var currentTrackingCategory = trackingCategories === null || trackingCategories === void 0 ? void 0 : trackingCategories.find(function (category) { return category.id === categoryId; });
                        var mappings = ((_h = (_g = (_f = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _f === void 0 ? void 0 : _f.xero) === null || _g === void 0 ? void 0 : _g.config) !== null && _h !== void 0 ? _h : {}).mappings;
                        var currentTrackingCategoryValue = currentTrackingCategory ? ((_j = mappings === null || mappings === void 0 ? void 0 : mappings["".concat(CONST_1.default.XERO_CONFIG.TRACKING_CATEGORY_PREFIX).concat(currentTrackingCategory.id)]) !== null && _j !== void 0 ? _j : '') : '';
                        (0, Xero_1.updateXeroMappings)(policyID, categoryId ? (_a = {}, _a["".concat(CONST_1.default.XERO_CONFIG.TRACKING_CATEGORY_PREFIX).concat(categoryId)] = CONST_1.default.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD, _a) : {}, categoryId ? (_b = {}, _b["".concat(CONST_1.default.XERO_CONFIG.TRACKING_CATEGORY_PREFIX).concat(categoryId)] = currentTrackingCategoryValue, _b) : {});
                        break;
                    }
                    default: {
                        (0, Policy_1.enablePolicyReportFields)(policyID, true);
                    }
                }
                break;
            case CONST_1.default.UPGRADE_FEATURE_INTRO_MAPPING.rules.id:
                (0, Policy_1.enablePolicyRules)(policyID, true, false);
                break;
            case CONST_1.default.UPGRADE_FEATURE_INTRO_MAPPING.companyCards.id:
                (0, Policy_1.enableCompanyCards)(policyID, true, false);
                break;
            case CONST_1.default.UPGRADE_FEATURE_INTRO_MAPPING.perDiem.id:
                (0, PerDiem_1.enablePerDiem)(policyID, true, perDiemCustomUnit === null || perDiemCustomUnit === void 0 ? void 0 : perDiemCustomUnit.customUnitID, false);
                break;
            default:
        }
    }, [
        categoryId,
        feature,
        perDiemCustomUnit === null || perDiemCustomUnit === void 0 ? void 0 : perDiemCustomUnit.customUnitID,
        (_k = (_j = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _j === void 0 ? void 0 : _j.xero) === null || _k === void 0 ? void 0 : _k.config,
        (_m = (_l = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _l === void 0 ? void 0 : _l.xero) === null || _m === void 0 ? void 0 : _m.data,
        policyID,
        qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.syncClasses,
        qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.syncCustomers,
        qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.syncLocations,
        (_o = route.params) === null || _o === void 0 ? void 0 : _o.featureName,
        featureNameAlias,
    ]);
    (0, native_1.useFocusEffect)((0, react_1.useCallback)(function () {
        return function () {
            if (!isUpgraded || !canPerformUpgrade) {
                return;
            }
            confirmUpgrade();
        };
    }, [isUpgraded, canPerformUpgrade, confirmUpgrade]));
    if (!canPerformUpgrade) {
        return <NotFoundPage_1.default />;
    }
    return (<ScreenWrapper_1.default shouldShowOfflineIndicator testID="workspaceUpgradePage" offlineIndicatorStyle={styles.mtAuto}>
            <HeaderWithBackButton_1.default title={translate('common.upgrade')} onBackButtonPress={function () {
            if (isUpgraded) {
                goBack();
            }
            else {
                Navigation_1.default.goBack();
            }
        }}/>
            <ScrollView_1.default contentContainerStyle={styles.flexGrow1}>
                {!!policy && isUpgraded && (<UpgradeConfirmation_1.default onConfirmUpgrade={goBack} policyName={policy.name}/>)}
                {!isUpgraded && (<UpgradeIntro_1.default policyID={policyID} feature={feature} onUpgrade={onUpgradeToCorporate} buttonDisabled={isOffline} loading={policy === null || policy === void 0 ? void 0 : policy.isPendingUpgrade} backTo={route.params.backTo}/>)}
            </ScrollView_1.default>
        </ScreenWrapper_1.default>);
}
exports.default = WorkspaceUpgradePage;
