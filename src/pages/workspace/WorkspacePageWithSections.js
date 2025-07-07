"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollViewWithContext_1 = require("@components/ScrollViewWithContext");
var useHandleBackButton_1 = require("@hooks/useHandleBackButton");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var usePrevious_1 = require("@hooks/usePrevious");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var BankAccounts_1 = require("@libs/actions/BankAccounts");
var BankAccount_1 = require("@libs/models/BankAccount");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var withPolicyAndFullscreenLoading_1 = require("./withPolicyAndFullscreenLoading");
function fetchData(policyID, skipVBBACal) {
    if (skipVBBACal) {
        return;
    }
    (0, BankAccounts_1.openWorkspaceView)(policyID);
}
function WorkspacePageWithSections(_a) {
    var _b, _c, _d, _e;
    var backButtonRoute = _a.backButtonRoute, _f = _a.children, children = _f === void 0 ? function () { return null; } : _f, _g = _a.footer, footer = _g === void 0 ? null : _g, _h = _a.icon, icon = _h === void 0 ? undefined : _h, headerText = _a.headerText, policy = _a.policy, policyDraft = _a.policyDraft, route = _a.route, _j = _a.shouldUseScrollView, shouldUseScrollView = _j === void 0 ? false : _j, _k = _a.showLoadingAsFirstRender, showLoadingAsFirstRender = _k === void 0 ? true : _k, _l = _a.shouldSkipVBBACall, shouldSkipVBBACall = _l === void 0 ? true : _l, _m = _a.shouldShowBackButton, shouldShowBackButton = _m === void 0 ? false : _m, _o = _a.shouldShowLoading, shouldShowLoading = _o === void 0 ? true : _o, _p = _a.shouldShowOfflineIndicatorInWideScreen, shouldShowOfflineIndicatorInWideScreen = _p === void 0 ? false : _p, _q = _a.shouldShowNonAdmin, shouldShowNonAdmin = _q === void 0 ? false : _q, headerContent = _a.headerContent, testID = _a.testID, _r = _a.shouldShowNotFoundPage, shouldShowNotFoundPage = _r === void 0 ? false : _r, _s = _a.isLoading, isPageLoading = _s === void 0 ? false : _s, onBackButtonPress = _a.onBackButtonPress, shouldShowThreeDotsButton = _a.shouldShowThreeDotsButton, threeDotsMenuItems = _a.threeDotsMenuItems, threeDotsAnchorPosition = _a.threeDotsAnchorPosition, _t = _a.shouldUseHeadlineHeader, shouldUseHeadlineHeader = _t === void 0 ? true : _t, _u = _a.addBottomSafeAreaPadding, addBottomSafeAreaPadding = _u === void 0 ? false : _u;
    var styles = (0, useThemeStyles_1.default)();
    var policyID = (_b = route.params) === null || _b === void 0 ? void 0 : _b.policyID;
    (0, useNetwork_1.default)({ onReconnect: function () { return fetchData(policyID, shouldSkipVBBACall); } });
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { canBeMissing: false })[0];
    var _v = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, { canBeMissing: true })[0], reimbursementAccount = _v === void 0 ? CONST_1.default.REIMBURSEMENT_ACCOUNT.DEFAULT_DATA : _v;
    var currentUserLogin = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, {
        selector: function (session) { return session === null || session === void 0 ? void 0 : session.email; },
        canBeMissing: true,
    })[0];
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    var isLoading = (_c = ((reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.isLoading) || isPageLoading)) !== null && _c !== void 0 ? _c : true;
    var achState = (_d = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _d === void 0 ? void 0 : _d.state;
    var isUsingECard = (_e = account === null || account === void 0 ? void 0 : account.isUsingExpensifyCard) !== null && _e !== void 0 ? _e : false;
    var hasVBA = achState === BankAccount_1.default.STATE.OPEN;
    var content = typeof children === 'function' ? children(hasVBA, policyID, isUsingECard) : children;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var firstRender = (0, react_1.useRef)(showLoadingAsFirstRender);
    var isFocused = (0, native_1.useIsFocused)();
    var prevPolicy = (0, usePrevious_1.default)(policy);
    (0, react_1.useEffect)(function () {
        // Because isLoading is false before merging in Onyx, we need firstRender ref to display loading page as well before isLoading is change to true
        firstRender.current = false;
    }, []);
    (0, react_1.useEffect)(function () {
        fetchData(policyID, shouldSkipVBBACall);
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    var shouldShowPolicy = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.shouldShowPolicy)(policy, false, currentUserLogin); }, [policy, currentUserLogin]);
    var isPendingDelete = (0, PolicyUtils_1.isPendingDeletePolicy)(policy);
    var prevIsPendingDelete = (0, PolicyUtils_1.isPendingDeletePolicy)(prevPolicy);
    var shouldShow = (0, react_1.useMemo)(function () {
        // If the policy object doesn't exist or contains only error data, we shouldn't display it.
        if ((((0, EmptyObject_1.isEmptyObject)(policy) || (Object.keys(policy).length === 1 && !(0, EmptyObject_1.isEmptyObject)(policy.errors))) && (0, EmptyObject_1.isEmptyObject)(policyDraft)) || shouldShowNotFoundPage) {
            return true;
        }
        // We check isPendingDelete and prevIsPendingDelete to prevent the NotFound view from showing right after we delete the workspace
        return (!(0, EmptyObject_1.isEmptyObject)(policy) && !(0, PolicyUtils_1.isPolicyAdmin)(policy) && !shouldShowNonAdmin) || (!shouldShowPolicy && (!isPendingDelete || prevIsPendingDelete));
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [policy, shouldShowNonAdmin, shouldShowPolicy]);
    var handleOnBackButtonPress = function () {
        if (onBackButtonPress) {
            onBackButtonPress();
            return true;
        }
        if (backButtonRoute) {
            Navigation_1.default.goBack(backButtonRoute);
            return true;
        }
        Navigation_1.default.popToSidebar();
        return true;
    };
    (0, useHandleBackButton_1.default)(handleOnBackButtonPress);
    return (<ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding shouldEnablePickerAvoiding={false} shouldEnableMaxHeight testID={testID !== null && testID !== void 0 ? testID : WorkspacePageWithSections.displayName} shouldShowOfflineIndicator={!shouldShow} shouldShowOfflineIndicatorInWideScreen={shouldShowOfflineIndicatorInWideScreen && !shouldShow}>
            <FullPageNotFoundView_1.default onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.WORKSPACES_LIST.route); }} onLinkPress={PolicyUtils_1.goBackFromInvalidPolicy} shouldShow={shouldShow} subtitleKey={shouldShowPolicy ? 'workspace.common.notAuthorized' : undefined} shouldForceFullScreen shouldDisplaySearchRouter>
                <HeaderWithBackButton_1.default title={headerText} onBackButtonPress={handleOnBackButtonPress} shouldShowBackButton={shouldUseNarrowLayout || shouldShowBackButton} icon={icon !== null && icon !== void 0 ? icon : undefined} shouldShowThreeDotsButton={shouldShowThreeDotsButton} threeDotsMenuItems={threeDotsMenuItems} threeDotsAnchorPosition={threeDotsAnchorPosition} shouldUseHeadlineHeader={shouldUseHeadlineHeader}>
                    {headerContent}
                </HeaderWithBackButton_1.default>
                {(isLoading || firstRender.current) && shouldShowLoading && isFocused ? (<FullscreenLoadingIndicator_1.default style={[styles.flex1, styles.pRelative]}/>) : (<>
                        {shouldUseScrollView ? (<ScrollViewWithContext_1.default keyboardShouldPersistTaps="handled" addBottomSafeAreaPadding={addBottomSafeAreaPadding} style={[styles.settingsPageBackground, styles.flex1, styles.w100]}>
                                <react_native_1.View style={[styles.w100, styles.flex1]}>{content}</react_native_1.View>
                            </ScrollViewWithContext_1.default>) : (content)}
                        {footer}
                    </>)}
            </FullPageNotFoundView_1.default>
        </ScreenWrapper_1.default>);
}
WorkspacePageWithSections.displayName = 'WorkspacePageWithSections';
exports.default = (0, withPolicyAndFullscreenLoading_1.default)(WorkspacePageWithSections);
