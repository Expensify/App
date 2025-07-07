"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@navigation/Navigation");
var CardAuthenticationModal_1 = require("@pages/settings/Subscription/CardAuthenticationModal");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var withPolicy_1 = require("@pages/workspace/withPolicy");
var Member_1 = require("@userActions/Policy/Member");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var WorkspaceOwnerChangeCheck_1 = require("./WorkspaceOwnerChangeCheck");
var WorkspaceOwnerPaymentCardForm_1 = require("./WorkspaceOwnerPaymentCardForm");
function WorkspaceOwnerChangeWrapperPage(_a) {
    var _b;
    var route = _a.route, policy = _a.policy;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var privateStripeCustomerID = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_PRIVATE_STRIPE_CUSTOMER_ID, { canBeMissing: true })[0];
    var policyID = route.params.policyID;
    var accountID = route.params.accountID;
    var error = route.params.error;
    var isAuthRequired = (privateStripeCustomerID === null || privateStripeCustomerID === void 0 ? void 0 : privateStripeCustomerID.status) === CONST_1.default.STRIPE_SCA_AUTH_STATUSES.CARD_AUTHENTICATION_REQUIRED;
    var shouldShowPaymentCardForm = error === CONST_1.default.POLICY.OWNERSHIP_ERRORS.NO_BILLING_CARD || isAuthRequired;
    (0, react_1.useEffect)(function () {
        var _a, _b, _c;
        if (!policy || (policy === null || policy === void 0 ? void 0 : policy.isLoading)) {
            return;
        }
        if (!policy.errorFields && policy.isChangeOwnerFailed) {
            // there are some errors but not related to change owner flow - show an error page
            Navigation_1.default.goBack();
            Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_OWNER_CHANGE_ERROR.getRoute(policyID, accountID));
            return;
        }
        if (!((_a = policy === null || policy === void 0 ? void 0 : policy.errorFields) === null || _a === void 0 ? void 0 : _a.changeOwner) && (policy === null || policy === void 0 ? void 0 : policy.isChangeOwnerSuccessful)) {
            // no errors - show a success page
            Navigation_1.default.goBack();
            Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_OWNER_CHANGE_SUCCESS.getRoute(policyID, accountID));
            return;
        }
        var changeOwnerErrors = Object.keys((_c = (_b = policy === null || policy === void 0 ? void 0 : policy.errorFields) === null || _b === void 0 ? void 0 : _b.changeOwner) !== null && _c !== void 0 ? _c : {});
        if (changeOwnerErrors && changeOwnerErrors.length > 0) {
            Navigation_1.default.setParams({ error: changeOwnerErrors.at(0) });
        }
    }, [accountID, policy, (_b = policy === null || policy === void 0 ? void 0 : policy.errorFields) === null || _b === void 0 ? void 0 : _b.changeOwner, policyID]);
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID}>
            <ScreenWrapper_1.default testID={WorkspaceOwnerChangeWrapperPage.displayName}>
                <HeaderWithBackButton_1.default title={translate('workspace.changeOwner.changeOwnerPageTitle')} onBackButtonPress={function () {
            (0, Member_1.clearWorkspaceOwnerChangeFlow)(policyID);
            Navigation_1.default.goBack();
            Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID));
        }}/>
                <react_native_1.View style={[styles.containerWithSpaceBetween, error !== CONST_1.default.POLICY.OWNERSHIP_ERRORS.NO_BILLING_CARD ? styles.ph5 : styles.ph0, styles.pb0]}>
                    {!!(policy === null || policy === void 0 ? void 0 : policy.isLoading) && <FullscreenLoadingIndicator_1.default />}
                    {shouldShowPaymentCardForm && <WorkspaceOwnerPaymentCardForm_1.default policy={policy}/>}
                    {!(policy === null || policy === void 0 ? void 0 : policy.isLoading) && !shouldShowPaymentCardForm && (<WorkspaceOwnerChangeCheck_1.default policy={policy} accountID={accountID} error={error}/>)}
                    <CardAuthenticationModal_1.default headerTitle={translate('subscription.authenticatePaymentCard')} policyID={policyID}/>
                </react_native_1.View>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceOwnerChangeWrapperPage.displayName = 'WorkspaceOwnerChangeWrapperPage';
exports.default = (0, withPolicy_1.default)(WorkspaceOwnerChangeWrapperPage);
