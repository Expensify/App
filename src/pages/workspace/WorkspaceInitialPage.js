"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var HighlightableMenuItem_1 = require("@components/HighlightableMenuItem");
var Expensicons_1 = require("@components/Icon/Expensicons");
var MenuItem_1 = require("@components/MenuItem");
var NavigationTabBar_1 = require("@components/Navigation/NavigationTabBar");
var NAVIGATION_TABS_1 = require("@components/Navigation/NavigationTabBar/NAVIGATION_TABS");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var useCardFeeds_1 = require("@hooks/useCardFeeds");
var useCurrentUserPersonalDetails_1 = require("@hooks/useCurrentUserPersonalDetails");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var usePrevious_1 = require("@hooks/usePrevious");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useSingleExecution_1 = require("@hooks/useSingleExecution");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useWaitForNavigation_1 = require("@hooks/useWaitForNavigation");
var App_1 = require("@libs/actions/App");
var connections_1 = require("@libs/actions/connections");
var QuickbooksOnline_1 = require("@libs/actions/connections/QuickbooksOnline");
var Policy_1 = require("@libs/actions/Policy/Policy");
var CardUtils_1 = require("@libs/CardUtils");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SCREENS_1 = require("@src/SCREENS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var withPolicyAndFullscreenLoading_1 = require("./withPolicyAndFullscreenLoading");
function dismissError(policyID, pendingAction) {
    if (!policyID || pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
        (0, PolicyUtils_1.goBackFromInvalidPolicy)();
        if (policyID) {
            (0, Policy_1.removeWorkspace)(policyID);
        }
    }
    else {
        (0, Policy_1.clearErrors)(policyID);
    }
}
function WorkspaceInitialPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    var policyDraft = _a.policyDraft, policyProp = _a.policy, route = _a.route;
    var styles = (0, useThemeStyles_1.default)();
    var policy = (policyDraft === null || policyDraft === void 0 ? void 0 : policyDraft.id) ? policyDraft : policyProp;
    var workspaceAccountID = (_b = policy === null || policy === void 0 ? void 0 : policy.workspaceAccountID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID;
    var hasPolicyCreationError = (policy === null || policy === void 0 ? void 0 : policy.pendingAction) === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD && !(0, EmptyObject_1.isEmptyObject)(policy.errors);
    var cardFeeds = (0, useCardFeeds_1.default)(policy === null || policy === void 0 ? void 0 : policy.id)[0];
    var allFeedsCards = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.WORKSPACE_CARDS_LIST), { canBeMissing: true })[0];
    var connectionSyncProgress = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS).concat(policy === null || policy === void 0 ? void 0 : policy.id), { canBeMissing: true })[0];
    var currentUserLogin = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { selector: function (session) { return session === null || session === void 0 ? void 0 : session.email; }, canBeMissing: false })[0];
    var policyCategories = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES).concat((_c = route.params) === null || _c === void 0 ? void 0 : _c.policyID), { canBeMissing: true })[0];
    var personalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, { canBeMissing: false })[0];
    var cardsDomainIDs = Object.values((0, CardUtils_1.getCompanyFeeds)(cardFeeds))
        .map(function (data) { return data.domainID; })
        .filter(function (domainID) { return !!domainID; });
    var _p = (0, useCurrentUserPersonalDetails_1.default)(), login = _p.login, accountID = _p.accountID;
    var hasSyncError = (0, PolicyUtils_1.shouldShowSyncError)(policy, (0, connections_1.isConnectionInProgress)(connectionSyncProgress, policy));
    var waitForNavigate = (0, useWaitForNavigation_1.default)();
    var _q = (0, useSingleExecution_1.default)(), singleExecution = _q.singleExecution, isExecuting = _q.isExecuting;
    var activeRoute = (0, native_1.useNavigationState)(function (state) { var _a; return (_a = (0, native_1.findFocusedRoute)(state)) === null || _a === void 0 ? void 0 : _a.name; });
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var translate = (0, useLocalize_1.default)().translate;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var wasRendered = (0, react_1.useRef)(false);
    var currentUserPolicyExpenseChatReportID = (_d = (0, ReportUtils_1.getPolicyExpenseChat)(accountID, policy === null || policy === void 0 ? void 0 : policy.id)) === null || _d === void 0 ? void 0 : _d.reportID;
    var currentUserPolicyExpenseChat = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(currentUserPolicyExpenseChatReportID), { canBeMissing: true })[0];
    var reportPendingAction = (0, ReportUtils_1.getReportOfflinePendingActionAndErrors)(currentUserPolicyExpenseChat).reportPendingAction;
    var isPolicyExpenseChatEnabled = !!(policy === null || policy === void 0 ? void 0 : policy.isPolicyExpenseChatEnabled);
    var prevPendingFields = (0, usePrevious_1.default)(policy === null || policy === void 0 ? void 0 : policy.pendingFields);
    var shouldDisplayLHB = !shouldUseNarrowLayout;
    var policyFeatureStates = (0, react_1.useMemo)(function () {
        var _a;
        var _b;
        return (_a = {},
            _a[CONST_1.default.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED] = policy === null || policy === void 0 ? void 0 : policy.areDistanceRatesEnabled,
            _a[CONST_1.default.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED] = policy === null || policy === void 0 ? void 0 : policy.areWorkflowsEnabled,
            _a[CONST_1.default.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED] = policy === null || policy === void 0 ? void 0 : policy.areCategoriesEnabled,
            _a[CONST_1.default.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED] = policy === null || policy === void 0 ? void 0 : policy.areTagsEnabled,
            _a[CONST_1.default.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED] = (_b = policy === null || policy === void 0 ? void 0 : policy.tax) === null || _b === void 0 ? void 0 : _b.trackingEnabled,
            _a[CONST_1.default.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED] = policy === null || policy === void 0 ? void 0 : policy.areCompanyCardsEnabled,
            _a[CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED] = !!(policy === null || policy === void 0 ? void 0 : policy.areConnectionsEnabled) || !(0, EmptyObject_1.isEmptyObject)(policy === null || policy === void 0 ? void 0 : policy.connections),
            _a[CONST_1.default.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED] = policy === null || policy === void 0 ? void 0 : policy.areExpensifyCardsEnabled,
            _a[CONST_1.default.POLICY.MORE_FEATURES.ARE_REPORT_FIELDS_ENABLED] = policy === null || policy === void 0 ? void 0 : policy.areReportFieldsEnabled,
            _a[CONST_1.default.POLICY.MORE_FEATURES.ARE_RULES_ENABLED] = policy === null || policy === void 0 ? void 0 : policy.areRulesEnabled,
            _a[CONST_1.default.POLICY.MORE_FEATURES.ARE_INVOICES_ENABLED] = policy === null || policy === void 0 ? void 0 : policy.areInvoicesEnabled,
            _a[CONST_1.default.POLICY.MORE_FEATURES.ARE_PER_DIEM_RATES_ENABLED] = policy === null || policy === void 0 ? void 0 : policy.arePerDiemRatesEnabled,
            _a);
    }, [policy]);
    var fetchPolicyData = (0, react_1.useCallback)(function () {
        if (policyDraft === null || policyDraft === void 0 ? void 0 : policyDraft.id) {
            return;
        }
        (0, Policy_1.openPolicyInitialPage)(route.params.policyID);
    }, [policyDraft === null || policyDraft === void 0 ? void 0 : policyDraft.id, route.params.policyID]);
    (0, useNetwork_1.default)({ onReconnect: fetchPolicyData });
    (0, native_1.useFocusEffect)((0, react_1.useCallback)(function () {
        fetchPolicyData();
    }, [fetchPolicyData]));
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var policyName = (_e = policy === null || policy === void 0 ? void 0 : policy.name) !== null && _e !== void 0 ? _e : '';
    var hasMembersError = (0, PolicyUtils_1.shouldShowEmployeeListError)(policy);
    var hasPolicyCategoryError = (0, PolicyUtils_1.hasPolicyCategoriesError)(policyCategories);
    var hasGeneralSettingsError = !(0, EmptyObject_1.isEmptyObject)((_g = (_f = policy === null || policy === void 0 ? void 0 : policy.errorFields) === null || _f === void 0 ? void 0 : _f.name) !== null && _g !== void 0 ? _g : {}) ||
        !(0, EmptyObject_1.isEmptyObject)((_j = (_h = policy === null || policy === void 0 ? void 0 : policy.errorFields) === null || _h === void 0 ? void 0 : _h.avatarURL) !== null && _j !== void 0 ? _j : {}) ||
        !(0, EmptyObject_1.isEmptyObject)((_l = (_k = policy === null || policy === void 0 ? void 0 : policy.errorFields) === null || _k === void 0 ? void 0 : _k.outputCurrency) !== null && _l !== void 0 ? _l : {}) ||
        !(0, EmptyObject_1.isEmptyObject)((_o = (_m = policy === null || policy === void 0 ? void 0 : policy.errorFields) === null || _m === void 0 ? void 0 : _m.address) !== null && _o !== void 0 ? _o : {});
    var shouldShowProtectedItems = (0, PolicyUtils_1.isPolicyAdmin)(policy, login);
    var _r = (0, react_1.useState)(policyFeatureStates), featureStates = _r[0], setFeatureStates = _r[1];
    var _s = (0, react_1.useState)(undefined), highlightedFeature = _s[0], setHighlightedFeature = _s[1];
    var workspaceMenuItems = (0, react_1.useMemo)(function () {
        var _a, _b, _c, _d, _e, _f;
        var protectedMenuItems = [];
        protectedMenuItems.push({
            translationKey: 'common.reports',
            icon: Expensicons_1.Document,
            action: singleExecution(waitForNavigate(function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_REPORT_FIELDS.getRoute(policyID)); })),
            screenName: SCREENS_1.default.WORKSPACE.REPORT_FIELDS,
        });
        if (featureStates === null || featureStates === void 0 ? void 0 : featureStates[CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED]) {
            protectedMenuItems.push({
                translationKey: 'workspace.common.accounting',
                icon: Expensicons_1.Sync,
                action: singleExecution(waitForNavigate(function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING.getRoute(policyID)); })),
                brickRoadIndicator: hasSyncError || (0, QuickbooksOnline_1.shouldShowQBOReimbursableExportDestinationAccountError)(policy) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                screenName: SCREENS_1.default.WORKSPACE.ACCOUNTING.ROOT,
                highlighted: highlightedFeature === CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED,
            });
        }
        if (featureStates === null || featureStates === void 0 ? void 0 : featureStates[CONST_1.default.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED]) {
            protectedMenuItems.push({
                translationKey: 'workspace.common.categories',
                icon: Expensicons_1.Folder,
                action: singleExecution(waitForNavigate(function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_CATEGORIES.getRoute(policyID)); })),
                brickRoadIndicator: hasPolicyCategoryError ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                screenName: SCREENS_1.default.WORKSPACE.CATEGORIES,
                highlighted: highlightedFeature === CONST_1.default.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED,
            });
        }
        if (featureStates === null || featureStates === void 0 ? void 0 : featureStates[CONST_1.default.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED]) {
            protectedMenuItems.push({
                translationKey: 'workspace.common.tags',
                icon: Expensicons_1.Tag,
                action: singleExecution(waitForNavigate(function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_TAGS.getRoute(policyID)); })),
                screenName: SCREENS_1.default.WORKSPACE.TAGS,
                highlighted: highlightedFeature === CONST_1.default.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED,
            });
        }
        if (featureStates === null || featureStates === void 0 ? void 0 : featureStates[CONST_1.default.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED]) {
            protectedMenuItems.push({
                translationKey: 'workspace.common.taxes',
                icon: Expensicons_1.Coins,
                action: singleExecution(waitForNavigate(function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_TAXES.getRoute(policyID)); })),
                screenName: SCREENS_1.default.WORKSPACE.TAXES,
                brickRoadIndicator: (0, PolicyUtils_1.shouldShowTaxRateError)(policy) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                highlighted: highlightedFeature === CONST_1.default.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED,
            });
        }
        if (featureStates === null || featureStates === void 0 ? void 0 : featureStates[CONST_1.default.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED]) {
            protectedMenuItems.push({
                translationKey: 'workspace.common.workflows',
                icon: Expensicons_1.Workflows,
                action: singleExecution(waitForNavigate(function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_WORKFLOWS.getRoute(policyID)); })),
                screenName: SCREENS_1.default.WORKSPACE.WORKFLOWS,
                brickRoadIndicator: !(0, EmptyObject_1.isEmptyObject)((_b = (_a = policy === null || policy === void 0 ? void 0 : policy.errorFields) === null || _a === void 0 ? void 0 : _a.reimburser) !== null && _b !== void 0 ? _b : {}) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                highlighted: highlightedFeature === CONST_1.default.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED,
            });
        }
        if (featureStates === null || featureStates === void 0 ? void 0 : featureStates[CONST_1.default.POLICY.MORE_FEATURES.ARE_RULES_ENABLED]) {
            protectedMenuItems.push({
                translationKey: 'workspace.common.rules',
                icon: Expensicons_1.Feed,
                action: singleExecution(waitForNavigate(function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_RULES.getRoute(policyID)); })),
                screenName: SCREENS_1.default.WORKSPACE.RULES,
                highlighted: highlightedFeature === CONST_1.default.POLICY.MORE_FEATURES.ARE_RULES_ENABLED,
            });
        }
        if (featureStates === null || featureStates === void 0 ? void 0 : featureStates[CONST_1.default.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED]) {
            protectedMenuItems.push({
                translationKey: 'workspace.common.distanceRates',
                icon: Expensicons_1.Car,
                action: singleExecution(waitForNavigate(function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_DISTANCE_RATES.getRoute(policyID)); })),
                screenName: SCREENS_1.default.WORKSPACE.DISTANCE_RATES,
                highlighted: highlightedFeature === CONST_1.default.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED,
            });
        }
        if (featureStates === null || featureStates === void 0 ? void 0 : featureStates[CONST_1.default.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED]) {
            protectedMenuItems.push({
                translationKey: 'workspace.common.expensifyCard',
                icon: Expensicons_1.ExpensifyCard,
                action: singleExecution(waitForNavigate(function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_EXPENSIFY_CARD.getRoute(policyID)); })),
                screenName: SCREENS_1.default.WORKSPACE.EXPENSIFY_CARD,
                highlighted: highlightedFeature === CONST_1.default.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED,
            });
        }
        if (featureStates === null || featureStates === void 0 ? void 0 : featureStates[CONST_1.default.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED]) {
            var hasBrokenFeedConnection = (0, CardUtils_1.checkIfFeedConnectionIsBroken)((0, CardUtils_1.flatAllCardsList)(allFeedsCards, workspaceAccountID, cardsDomainIDs));
            protectedMenuItems.push({
                translationKey: 'workspace.common.companyCards',
                icon: Expensicons_1.CreditCard,
                action: singleExecution(waitForNavigate(function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_COMPANY_CARDS.getRoute(policyID)); })),
                screenName: SCREENS_1.default.WORKSPACE.COMPANY_CARDS,
                brickRoadIndicator: hasBrokenFeedConnection ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                highlighted: highlightedFeature === CONST_1.default.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED,
            });
        }
        if (featureStates === null || featureStates === void 0 ? void 0 : featureStates[CONST_1.default.POLICY.MORE_FEATURES.ARE_PER_DIEM_RATES_ENABLED]) {
            protectedMenuItems.push({
                translationKey: 'common.perDiem',
                icon: Expensicons_1.CalendarSolid,
                action: singleExecution(waitForNavigate(function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_PER_DIEM.getRoute(policyID)); })),
                screenName: SCREENS_1.default.WORKSPACE.PER_DIEM,
                highlighted: highlightedFeature === CONST_1.default.POLICY.MORE_FEATURES.ARE_PER_DIEM_RATES_ENABLED,
            });
        }
        if (featureStates === null || featureStates === void 0 ? void 0 : featureStates[CONST_1.default.POLICY.MORE_FEATURES.ARE_INVOICES_ENABLED]) {
            var currencyCode = (_c = policy === null || policy === void 0 ? void 0 : policy.outputCurrency) !== null && _c !== void 0 ? _c : CONST_1.default.CURRENCY.USD;
            protectedMenuItems.push({
                translationKey: 'workspace.common.invoices',
                icon: Expensicons_1.InvoiceGeneric,
                action: singleExecution(waitForNavigate(function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_INVOICES.getRoute(policyID)); })),
                screenName: SCREENS_1.default.WORKSPACE.INVOICES,
                badgeText: (0, CurrencyUtils_1.convertToDisplayString)((_f = (_e = (_d = policy === null || policy === void 0 ? void 0 : policy.invoice) === null || _d === void 0 ? void 0 : _d.bankAccount) === null || _e === void 0 ? void 0 : _e.stripeConnectAccountBalance) !== null && _f !== void 0 ? _f : 0, currencyCode),
                highlighted: highlightedFeature === CONST_1.default.POLICY.MORE_FEATURES.ARE_INVOICES_ENABLED,
            });
        }
        protectedMenuItems.push({
            translationKey: 'workspace.common.moreFeatures',
            icon: Expensicons_1.Gear,
            action: singleExecution(waitForNavigate(function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_MORE_FEATURES.getRoute(policyID)); })),
            screenName: SCREENS_1.default.WORKSPACE.MORE_FEATURES,
        });
        var menuItems = __spreadArray([
            {
                translationKey: 'workspace.common.profile',
                icon: Expensicons_1.Building,
                action: singleExecution(waitForNavigate(function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_OVERVIEW.getRoute(policyID)); })),
                brickRoadIndicator: hasGeneralSettingsError ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                screenName: SCREENS_1.default.WORKSPACE.PROFILE,
            },
            {
                translationKey: 'workspace.common.members',
                icon: Expensicons_1.Users,
                action: singleExecution(waitForNavigate(function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_MEMBERS.getRoute(policyID)); })),
                brickRoadIndicator: hasMembersError ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                screenName: SCREENS_1.default.WORKSPACE.MEMBERS,
            }
        ], ((0, PolicyUtils_1.isPaidGroupPolicy)(policy) && shouldShowProtectedItems ? protectedMenuItems : []), true);
        return menuItems;
    }, [
        featureStates,
        hasGeneralSettingsError,
        hasMembersError,
        hasPolicyCategoryError,
        hasSyncError,
        highlightedFeature,
        policy,
        policyID,
        shouldShowProtectedItems,
        singleExecution,
        waitForNavigate,
        allFeedsCards,
        cardsDomainIDs,
        workspaceAccountID,
    ]);
    // We only update feature states if they aren't pending.
    // These changes are made to synchronously change feature states along with AccessOrNotFoundWrapperComponent.
    (0, react_1.useEffect)(function () {
        setFeatureStates(function (currentFeatureStates) {
            var _a;
            var newFeatureStates = {};
            var newlyEnabledFeature = null;
            Object.keys((_a = policy === null || policy === void 0 ? void 0 : policy.pendingFields) !== null && _a !== void 0 ? _a : {}).forEach(function (key) {
                var _a, _b;
                var isFeatureEnabled = (0, PolicyUtils_1.isPolicyFeatureEnabled)(policy, key);
                // Determine if this feature is newly enabled (wasn't enabled before but is now)
                if (isFeatureEnabled && !currentFeatureStates[key]) {
                    newlyEnabledFeature = key;
                }
                newFeatureStates[key] =
                    (prevPendingFields === null || prevPendingFields === void 0 ? void 0 : prevPendingFields[key]) !== ((_a = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _a === void 0 ? void 0 : _a[key]) || isOffline || !((_b = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _b === void 0 ? void 0 : _b[key]) ? isFeatureEnabled : currentFeatureStates[key];
            });
            // Only highlight the newly enabled feature
            if (newlyEnabledFeature) {
                setHighlightedFeature(newlyEnabledFeature);
            }
            return __assign(__assign({}, policyFeatureStates), newFeatureStates);
        });
    }, [policy, isOffline, policyFeatureStates, prevPendingFields]);
    (0, react_1.useEffect)(function () {
        (0, App_1.confirmReadyToOpenApp)();
    }, []);
    var prevPolicy = (0, usePrevious_1.default)(policy);
    var shouldShowPolicy = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.shouldShowPolicy)(policy, false, currentUserLogin); }, [policy, currentUserLogin]);
    var isPendingDelete = (0, PolicyUtils_1.isPendingDeletePolicy)(policy);
    var prevIsPendingDelete = (0, PolicyUtils_1.isPendingDeletePolicy)(prevPolicy);
    // We check isPendingDelete and prevIsPendingDelete to prevent the NotFound view from showing right after we delete the workspace
    // eslint-disable-next-line rulesdir/no-negated-variables
    var shouldShowNotFoundPage = !shouldShowPolicy && (!isPendingDelete || prevIsPendingDelete);
    (0, react_1.useEffect)(function () {
        if ((0, EmptyObject_1.isEmptyObject)(prevPolicy) || prevIsPendingDelete || !isPendingDelete) {
            return;
        }
        (0, PolicyUtils_1.goBackFromInvalidPolicy)();
    }, [isPendingDelete, policy, prevIsPendingDelete, prevPolicy]);
    // We are checking if the user can access the route.
    // If user can't access the route, we are dismissing any modals that are open when the NotFound view is shown
    var canAccessRoute = activeRoute && (workspaceMenuItems.some(function (item) { return item.screenName === activeRoute; }) || activeRoute === SCREENS_1.default.WORKSPACE.INITIAL);
    (0, react_1.useEffect)(function () {
        if (!shouldShowNotFoundPage && canAccessRoute) {
            return;
        }
        if (wasRendered.current) {
            return;
        }
        wasRendered.current = true;
        // We are dismissing any modals that are open when the NotFound view is shown
        Navigation_1.default.isNavigationReady().then(function () {
            Navigation_1.default.closeRHPFlow();
        });
    }, [canAccessRoute, shouldShowNotFoundPage]);
    var policyAvatar = (0, react_1.useMemo)(function () {
        var _a;
        if (!policy) {
            return { source: Expensicons_1.ExpensifyAppIcon, name: CONST_1.default.EXPENSIFY_ICON_NAME, type: CONST_1.default.ICON_TYPE_AVATAR };
        }
        var avatar = (policy === null || policy === void 0 ? void 0 : policy.avatarURL) ? policy.avatarURL : (0, ReportUtils_1.getDefaultWorkspaceAvatar)(policy === null || policy === void 0 ? void 0 : policy.name);
        return {
            source: avatar,
            name: (_a = policy === null || policy === void 0 ? void 0 : policy.name) !== null && _a !== void 0 ? _a : '',
            type: CONST_1.default.ICON_TYPE_WORKSPACE,
            id: policy.id,
        };
    }, [policy]);
    var shouldShowNavigationTabBar = !shouldShowNotFoundPage;
    return (<ScreenWrapper_1.default testID={WorkspaceInitialPage.displayName} enableEdgeToEdgeBottomSafeAreaPadding={false} bottomContent={shouldShowNavigationTabBar && !shouldDisplayLHB && <NavigationTabBar_1.default selectedTab={NAVIGATION_TABS_1.default.WORKSPACES}/>}>
            <FullPageNotFoundView_1.default onBackButtonPress={Navigation_1.default.dismissModal} onLinkPress={Navigation_1.default.goBackToHome} shouldShow={shouldShowNotFoundPage} subtitleKey={shouldShowPolicy ? 'workspace.common.notAuthorized' : undefined} addBottomSafeAreaPadding shouldForceFullScreen shouldDisplaySearchRouter>
                <HeaderWithBackButton_1.default title={policyName} onBackButtonPress={function () { var _a, _b; return Navigation_1.default.goBack((_b = (_a = route.params) === null || _a === void 0 ? void 0 : _a.backTo) !== null && _b !== void 0 ? _b : ROUTES_1.default.WORKSPACES_LIST.route); }} policyAvatar={policyAvatar} shouldDisplayHelpButton={shouldUseNarrowLayout}/>

                <ScrollView_1.default contentContainerStyle={[styles.flexColumn]}>
                    <OfflineWithFeedback_1.default pendingAction={policy === null || policy === void 0 ? void 0 : policy.pendingAction} onClose={function () { return dismissError(policyID, policy === null || policy === void 0 ? void 0 : policy.pendingAction); }} errors={policy === null || policy === void 0 ? void 0 : policy.errors} errorRowStyles={[styles.ph5, styles.pv2]} shouldDisableStrikeThrough={false} shouldHideOnDelete={false}>
                        <react_native_1.View style={[styles.pb4, styles.mh3, styles.mt3]}>
                            {/*
            Ideally we should use MenuList component for MenuItems with singleExecution/Navigation actions.
            In this case where user can click on workspace avatar or menu items, we need to have a check for `isExecuting`. So, we are directly mapping menuItems.
        */}
                            {workspaceMenuItems.map(function (item) { return (<HighlightableMenuItem_1.default key={item.translationKey} disabled={hasPolicyCreationError || isExecuting} interactive={!hasPolicyCreationError} title={translate(item.translationKey)} icon={item.icon} onPress={item.action} brickRoadIndicator={item.brickRoadIndicator} wrapperStyle={styles.sectionMenuItem} highlighted={!!(item === null || item === void 0 ? void 0 : item.highlighted)} focused={!!(item.screenName && (activeRoute === null || activeRoute === void 0 ? void 0 : activeRoute.startsWith(item.screenName)))} badgeText={item.badgeText} shouldIconUseAutoWidthStyle/>); })}
                        </react_native_1.View>
                    </OfflineWithFeedback_1.default>
                    {isPolicyExpenseChatEnabled && (<react_native_1.View style={[styles.pb4, styles.mh3, styles.mt3]}>
                            <Text_1.default style={[styles.textSupporting, styles.fontSizeLabel, styles.ph2]}>{translate('workspace.common.submitExpense')}</Text_1.default>
                            <OfflineWithFeedback_1.default pendingAction={reportPendingAction}>
                                <MenuItem_1.default title={(0, ReportUtils_1.getReportName)(currentUserPolicyExpenseChat)} description={translate('workspace.common.workspace')} icon={(0, ReportUtils_1.getIcons)(currentUserPolicyExpenseChat, personalDetails)} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.REPORT_WITH_ID.getRoute(currentUserPolicyExpenseChat === null || currentUserPolicyExpenseChat === void 0 ? void 0 : currentUserPolicyExpenseChat.reportID)); }} shouldShowRightIcon wrapperStyle={[styles.br2, styles.pl2, styles.pr0, styles.pv3, styles.mt1, styles.alignItemsCenter]} shouldShowSubscriptAvatar/>
                            </OfflineWithFeedback_1.default>
                        </react_native_1.View>)}
                </ScrollView_1.default>
                {shouldShowNavigationTabBar && shouldDisplayLHB && <NavigationTabBar_1.default selectedTab={NAVIGATION_TABS_1.default.WORKSPACES}/>}
            </FullPageNotFoundView_1.default>
        </ScreenWrapper_1.default>);
}
WorkspaceInitialPage.displayName = 'WorkspaceInitialPage';
exports.default = (0, withPolicyAndFullscreenLoading_1.default)(WorkspaceInitialPage);
