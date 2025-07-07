"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var Text_1 = require("@components/Text");
var useIndicatorStatus_1 = require("@hooks/useIndicatorStatus");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useSidebarOrderedReports_1 = require("@hooks/useSidebarOrderedReports");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReimbursementAccountUtils_1 = require("@libs/ReimbursementAccountUtils");
var WorkspacesSettingsUtils_1 = require("@libs/WorkspacesSettingsUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var NAVIGATION_TABS_1 = require("./NavigationTabBar/NAVIGATION_TABS");
function getSettingsMessage(status) {
    switch (status) {
        case CONST_1.default.INDICATOR_STATUS.HAS_CUSTOM_UNITS_ERROR:
            return 'debug.indicatorStatus.theresAWorkspaceWithCustomUnitsErrors';
        case CONST_1.default.INDICATOR_STATUS.HAS_EMPLOYEE_LIST_ERROR:
            return 'debug.indicatorStatus.theresAProblemWithAWorkspaceMember';
        case CONST_1.default.INDICATOR_STATUS.HAS_QBO_EXPORT_ERROR:
            return 'debug.indicatorStatus.theresAProblemWithAWorkspaceQBOExport';
        case CONST_1.default.INDICATOR_STATUS.HAS_LOGIN_LIST_ERROR:
            return 'debug.indicatorStatus.theresAProblemWithAContactMethod';
        case CONST_1.default.INDICATOR_STATUS.HAS_LOGIN_LIST_INFO:
            return 'debug.indicatorStatus.aContactMethodRequiresVerification';
        case CONST_1.default.INDICATOR_STATUS.HAS_PAYMENT_METHOD_ERROR:
            return 'debug.indicatorStatus.theresAProblemWithAPaymentMethod';
        case CONST_1.default.INDICATOR_STATUS.HAS_POLICY_ERRORS:
            return 'debug.indicatorStatus.theresAProblemWithAWorkspace';
        case CONST_1.default.INDICATOR_STATUS.HAS_REIMBURSEMENT_ACCOUNT_ERRORS:
            return 'debug.indicatorStatus.theresAProblemWithYourReimbursementAccount';
        case CONST_1.default.INDICATOR_STATUS.HAS_SUBSCRIPTION_ERRORS:
            return 'debug.indicatorStatus.theresABillingProblemWithYourSubscription';
        case CONST_1.default.INDICATOR_STATUS.HAS_SUBSCRIPTION_INFO:
            return 'debug.indicatorStatus.yourSubscriptionHasBeenSuccessfullyRenewed';
        case CONST_1.default.INDICATOR_STATUS.HAS_SYNC_ERRORS:
            return 'debug.indicatorStatus.theresWasAProblemDuringAWorkspaceConnectionSync';
        case CONST_1.default.INDICATOR_STATUS.HAS_USER_WALLET_ERRORS:
            return 'debug.indicatorStatus.theresAProblemWithYourWallet';
        case CONST_1.default.INDICATOR_STATUS.HAS_WALLET_TERMS_ERRORS:
            return 'debug.indicatorStatus.theresAProblemWithYourWalletTerms';
        default:
            return undefined;
    }
}
function getSettingsRoute(status, reimbursementAccount, policyIDWithErrors) {
    var _a, _b, _c;
    if (policyIDWithErrors === void 0) { policyIDWithErrors = ''; }
    switch (status) {
        case CONST_1.default.INDICATOR_STATUS.HAS_CUSTOM_UNITS_ERROR:
            return ROUTES_1.default.WORKSPACE_DISTANCE_RATES.getRoute(policyIDWithErrors);
        case CONST_1.default.INDICATOR_STATUS.HAS_EMPLOYEE_LIST_ERROR:
            return ROUTES_1.default.WORKSPACE_MEMBERS.getRoute(policyIDWithErrors);
        case CONST_1.default.INDICATOR_STATUS.HAS_LOGIN_LIST_ERROR:
            return ROUTES_1.default.SETTINGS_CONTACT_METHODS.route;
        case CONST_1.default.INDICATOR_STATUS.HAS_LOGIN_LIST_INFO:
            return ROUTES_1.default.SETTINGS_CONTACT_METHODS.route;
        case CONST_1.default.INDICATOR_STATUS.HAS_PAYMENT_METHOD_ERROR:
            return ROUTES_1.default.SETTINGS_WALLET;
        case CONST_1.default.INDICATOR_STATUS.HAS_POLICY_ERRORS:
            return ROUTES_1.default.WORKSPACE_INITIAL.getRoute(policyIDWithErrors);
        case CONST_1.default.INDICATOR_STATUS.HAS_REIMBURSEMENT_ACCOUNT_ERRORS:
            return ROUTES_1.default.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute((_a = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _a === void 0 ? void 0 : _a.policyID, (0, ReimbursementAccountUtils_1.getRouteForCurrentStep)((_c = (_b = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _b === void 0 ? void 0 : _b.currentStep) !== null && _c !== void 0 ? _c : CONST_1.default.BANK_ACCOUNT.STEP.BANK_ACCOUNT));
        case CONST_1.default.INDICATOR_STATUS.HAS_SUBSCRIPTION_ERRORS:
            return ROUTES_1.default.SETTINGS_SUBSCRIPTION.route;
        case CONST_1.default.INDICATOR_STATUS.HAS_SUBSCRIPTION_INFO:
            return ROUTES_1.default.SETTINGS_SUBSCRIPTION.route;
        case CONST_1.default.INDICATOR_STATUS.HAS_SYNC_ERRORS:
            return ROUTES_1.default.WORKSPACE_ACCOUNTING.getRoute(policyIDWithErrors);
        case CONST_1.default.INDICATOR_STATUS.HAS_USER_WALLET_ERRORS:
            return ROUTES_1.default.SETTINGS_WALLET;
        case CONST_1.default.INDICATOR_STATUS.HAS_WALLET_TERMS_ERRORS:
            return ROUTES_1.default.SETTINGS_WALLET;
        default:
            return undefined;
    }
}
function DebugTabView(_a) {
    var selectedTab = _a.selectedTab, chatTabBrickRoad = _a.chatTabBrickRoad;
    var StyleUtils = (0, useStyleUtils_1.default)();
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, { canBeMissing: true })[0];
    var _b = (0, useIndicatorStatus_1.default)(), status = _b.status, indicatorColor = _b.indicatorColor, policyIDWithErrors = _b.policyIDWithErrors;
    var orderedReports = (0, useSidebarOrderedReports_1.useSidebarOrderedReports)().orderedReports;
    var message = (0, react_1.useMemo)(function () {
        if (selectedTab === NAVIGATION_TABS_1.default.HOME) {
            if (chatTabBrickRoad === CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.INFO) {
                return 'debug.indicatorStatus.theresAReportAwaitingAction';
            }
            if (chatTabBrickRoad === CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR) {
                return 'debug.indicatorStatus.theresAReportWithErrors';
            }
        }
        if (selectedTab === NAVIGATION_TABS_1.default.SETTINGS || selectedTab === NAVIGATION_TABS_1.default.WORKSPACES) {
            return getSettingsMessage(status);
        }
    }, [selectedTab, chatTabBrickRoad, status]);
    var indicator = (0, react_1.useMemo)(function () {
        if (selectedTab === NAVIGATION_TABS_1.default.HOME) {
            if (chatTabBrickRoad === CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.INFO) {
                return theme.success;
            }
            if (chatTabBrickRoad === CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR) {
                return theme.danger;
            }
        }
        if (selectedTab === NAVIGATION_TABS_1.default.SETTINGS || selectedTab === NAVIGATION_TABS_1.default.WORKSPACES) {
            if (status) {
                return indicatorColor;
            }
        }
    }, [selectedTab, chatTabBrickRoad, theme.success, theme.danger, status, indicatorColor]);
    var navigateTo = (0, react_1.useCallback)(function () {
        if (selectedTab === NAVIGATION_TABS_1.default.HOME && !!chatTabBrickRoad) {
            var report = (0, WorkspacesSettingsUtils_1.getChatTabBrickRoadReport)(orderedReports);
            if (report) {
                Navigation_1.default.navigate(ROUTES_1.default.DEBUG_REPORT.getRoute(report.reportID));
            }
        }
        if (selectedTab === NAVIGATION_TABS_1.default.SETTINGS) {
            var route = getSettingsRoute(status, reimbursementAccount, policyIDWithErrors);
            if (route) {
                Navigation_1.default.navigate(route);
            }
        }
    }, [selectedTab, chatTabBrickRoad, orderedReports, status, reimbursementAccount, policyIDWithErrors]);
    if (![NAVIGATION_TABS_1.default.HOME, NAVIGATION_TABS_1.default.SETTINGS, NAVIGATION_TABS_1.default.WORKSPACES].includes(selectedTab !== null && selectedTab !== void 0 ? selectedTab : '') || !indicator) {
        return null;
    }
    return (<react_native_1.View testID={DebugTabView.displayName} style={[StyleUtils.getBackgroundColorStyle(theme.cardBG), styles.p3, styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
            <react_native_1.View style={[styles.flexRow, styles.gap2, styles.flex1, styles.alignItemsCenter]}>
                <Icon_1.default src={Expensicons.DotIndicator} fill={indicator}/>
                {!!message && <Text_1.default style={[StyleUtils.getColorStyle(theme.text), styles.lh20]}>{translate(message)}</Text_1.default>}
            </react_native_1.View>
            <Button_1.default text={translate('common.view')} onPress={navigateTo}/>
        </react_native_1.View>);
}
DebugTabView.displayName = 'DebugTabView';
exports.default = DebugTabView;
