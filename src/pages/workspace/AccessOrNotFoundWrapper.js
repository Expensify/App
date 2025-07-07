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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable rulesdir/no-negated-variables */
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var useCurrentUserPersonalDetails_1 = require("@hooks/useCurrentUserPersonalDetails");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var Policy_1 = require("@libs/actions/Policy/Policy");
var IOUUtils_1 = require("@libs/IOUUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var NotFoundPage_1 = require("@pages/ErrorPage/NotFoundPage");
var CONST_1 = require("@src/CONST");
var NAVIGATORS_1 = require("@src/NAVIGATORS");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SCREENS_1 = require("@src/SCREENS");
var callOrReturn_1 = require("@src/types/utils/callOrReturn");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var ACCESS_VARIANTS = (_a = {},
    _a[CONST_1.default.POLICY.ACCESS_VARIANTS.PAID] = function (policy) { return (0, PolicyUtils_1.isPaidGroupPolicy)(policy); },
    _a[CONST_1.default.POLICY.ACCESS_VARIANTS.CONTROL] = function (policy) { return (0, PolicyUtils_1.isControlPolicy)(policy); },
    _a[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN] = function (policy, login) { return (0, PolicyUtils_1.isPolicyAdmin)(policy, login); },
    _a[CONST_1.default.IOU.ACCESS_VARIANTS.CREATE] = function (policy, login, report, allPolicies, iouType) {
        return !!iouType &&
            (0, IOUUtils_1.isValidMoneyRequestType)(iouType) &&
            // Allow the user to submit the expense if we are submitting the expense in global menu or the report can create the expense
            ((0, EmptyObject_1.isEmptyObject)(report === null || report === void 0 ? void 0 : report.reportID) || (0, ReportUtils_1.canCreateRequest)(report, policy, iouType)) &&
            (iouType !== CONST_1.default.IOU.TYPE.INVOICE || (0, PolicyUtils_1.canSendInvoice)(allPolicies, login));
    },
    _a);
function PageNotFoundFallback(_a) {
    var _b;
    var policyID = _a.policyID, fullPageNotFoundViewProps = _a.fullPageNotFoundViewProps, isFeatureEnabled = _a.isFeatureEnabled, isPolicyNotAccessible = _a.isPolicyNotAccessible, isMoneyRequest = _a.isMoneyRequest;
    var shouldShowFullScreenFallback = !isFeatureEnabled || isPolicyNotAccessible;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    return (<NotFoundPage_1.default shouldForceFullScreen={shouldShowFullScreenFallback} shouldShowOfflineIndicator={false} onBackButtonPress={function () {
            if (isPolicyNotAccessible) {
                var rootState = Navigation_1.navigationRef.getRootState();
                var secondToLastRoute = rootState.routes.at(-2);
                if ((secondToLastRoute === null || secondToLastRoute === void 0 ? void 0 : secondToLastRoute.name) === NAVIGATORS_1.default.REPORTS_SPLIT_NAVIGATOR) {
                    Navigation_1.default.dismissModal();
                }
                else {
                    Navigation_1.default.goBack(ROUTES_1.default.WORKSPACES_LIST.route);
                }
                return;
            }
            Navigation_1.default.goBack(policyID && !isMoneyRequest ? ROUTES_1.default.WORKSPACE_OVERVIEW.getRoute(policyID) : undefined);
        }} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...fullPageNotFoundViewProps} shouldShowBackButton={(_b = fullPageNotFoundViewProps === null || fullPageNotFoundViewProps === void 0 ? void 0 : fullPageNotFoundViewProps.shouldShowBackButton) !== null && _b !== void 0 ? _b : (!shouldShowFullScreenFallback ? shouldUseNarrowLayout : undefined)}/>);
}
function AccessOrNotFoundWrapper(_a) {
    var _b;
    var _c = _a.accessVariants, accessVariants = _c === void 0 ? [] : _c, fullPageNotFoundViewProps = _a.fullPageNotFoundViewProps, shouldBeBlocked = _a.shouldBeBlocked, policyID = _a.policyID, reportID = _a.reportID, iouType = _a.iouType, allPolicies = _a.allPolicies, featureName = _a.featureName, props = __rest(_a, ["accessVariants", "fullPageNotFoundViewProps", "shouldBeBlocked", "policyID", "reportID", "iouType", "allPolicies", "featureName"]);
    var report = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID), {
        canBeMissing: true,
    })[0];
    var policy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), {
        canBeMissing: true,
    })[0];
    var isLoadingReportData = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_LOADING_REPORT_DATA, { initialValue: true, canBeMissing: true })[0];
    var _d = (0, useCurrentUserPersonalDetails_1.default)().login, login = _d === void 0 ? '' : _d;
    var isPolicyIDInRoute = !!(policyID === null || policyID === void 0 ? void 0 : policyID.length);
    var isMoneyRequest = !!iouType && (0, IOUUtils_1.isValidMoneyRequestType)(iouType);
    var isFromGlobalCreate = !!reportID && (0, EmptyObject_1.isEmptyObject)(report === null || report === void 0 ? void 0 : report.reportID);
    var pendingField = featureName ? (_b = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _b === void 0 ? void 0 : _b[featureName] : undefined;
    var isFocused = (0, native_1.useIsFocused)();
    (0, react_1.useEffect)(function () {
        if (!isPolicyIDInRoute || !(0, EmptyObject_1.isEmptyObject)(policy)) {
            // If the workspace is not required or is already loaded, we don't need to call the API
            return;
        }
        (0, Policy_1.openWorkspace)(policyID, []);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [isPolicyIDInRoute, policyID]);
    var shouldShowFullScreenLoadingIndicator = !isMoneyRequest && isLoadingReportData !== false && (!Object.entries(policy !== null && policy !== void 0 ? policy : {}).length || !(policy === null || policy === void 0 ? void 0 : policy.id));
    var isFeatureEnabled = featureName ? (0, PolicyUtils_1.isPolicyFeatureEnabled)(policy, featureName) : true;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var isPageAccessible = accessVariants.reduce(function (acc, variant) {
        var accessFunction = ACCESS_VARIANTS[variant];
        return acc && accessFunction(policy, login, report, allPolicies !== null && allPolicies !== void 0 ? allPolicies : null, iouType);
    }, true);
    var isPolicyNotAccessible = !(0, PolicyUtils_1.isPolicyAccessible)(policy);
    var shouldShowNotFoundPage = (!isMoneyRequest && !isFromGlobalCreate && isPolicyNotAccessible) || !isPageAccessible || shouldBeBlocked;
    // We only update the feature state if it isn't pending.
    // This is because the feature state changes several times during the creation of a workspace, while we are waiting for a response from the backend.
    // Without this, we can be unexpectedly navigated to the More Features page.
    (0, react_1.useEffect)(function () {
        if (!isFocused || isFeatureEnabled || (pendingField && !isOffline && !isFeatureEnabled)) {
            return;
        }
        // When a workspace feature linked to the current page is disabled we will navigate to the More Features page.
        Navigation_1.default.isNavigationReady().then(function () { return Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_MORE_FEATURES.getRoute(policyID)); });
        // We don't need to run the effect on policyID change as we only use it to get the route to navigate to.
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pendingField, isOffline, isFeatureEnabled]);
    (0, react_1.useEffect)(function () {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (isLoadingReportData || !isPolicyNotAccessible) {
            return;
        }
        Navigation_1.default.removeScreenFromNavigationState(SCREENS_1.default.WORKSPACE.INITIAL);
    }, [isLoadingReportData, isPolicyNotAccessible]);
    if (shouldShowFullScreenLoadingIndicator) {
        return <FullscreenLoadingIndicator_1.default />;
    }
    if (shouldShowNotFoundPage) {
        return (<PageNotFoundFallback policyID={policyID} isMoneyRequest={isMoneyRequest} isFeatureEnabled={isFeatureEnabled} isPolicyNotAccessible={isPolicyNotAccessible} fullPageNotFoundViewProps={fullPageNotFoundViewProps}/>);
    }
    return (0, callOrReturn_1.default)(props.children, { report: report, policy: policy, isLoadingReportData: isLoadingReportData });
}
exports.default = AccessOrNotFoundWrapper;
