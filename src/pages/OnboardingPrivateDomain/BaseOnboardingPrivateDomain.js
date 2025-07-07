"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var ValidateCodeForm_1 = require("@components/ValidateCodeActionModal/ValidateCodeForm");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var UserUtils_1 = require("@libs/UserUtils");
var Policy_1 = require("@userActions/Policy/Policy");
var User_1 = require("@userActions/User");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function BaseOnboardingPrivateDomain(_a) {
    var _b, _c;
    var shouldUseNativeStyles = _a.shouldUseNativeStyles, route = _a.route;
    var _d = (0, react_1.useState)(false), hasMagicCodeBeenSent = _d[0], setHasMagicCodeBeenSent = _d[1];
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var loginList = (0, useOnyx_1.default)(ONYXKEYS_1.default.LOGIN_LIST, { canBeMissing: false })[0];
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { canBeMissing: false })[0];
    var getAccessiblePoliciesAction = (0, useOnyx_1.default)(ONYXKEYS_1.default.VALIDATE_USER_AND_GET_ACCESSIBLE_POLICIES, { canBeMissing: true })[0];
    var joinablePolicies = (0, useOnyx_1.default)(ONYXKEYS_1.default.JOINABLE_POLICIES, { canBeMissing: true })[0];
    var joinablePoliciesLength = Object.keys(joinablePolicies !== null && joinablePolicies !== void 0 ? joinablePolicies : {}).length;
    var onboardingIsMediumOrLargerScreenWidth = (0, useResponsiveLayout_1.default)().onboardingIsMediumOrLargerScreenWidth;
    var email = (_b = session === null || session === void 0 ? void 0 : session.email) !== null && _b !== void 0 ? _b : '';
    var domain = (_c = email.split('@').at(1)) !== null && _c !== void 0 ? _c : '';
    var isValidated = (0, UserUtils_1.isCurrentUserValidated)(loginList);
    var sendValidateCode = (0, react_1.useCallback)(function () {
        if (!email) {
            return;
        }
        (0, User_1.resendValidateCode)(email);
    }, [email]);
    (0, react_1.useEffect)(function () {
        if (isValidated) {
            return;
        }
        sendValidateCode();
    }, [sendValidateCode, isValidated]);
    (0, react_1.useEffect)(function () {
        if (!isValidated || joinablePoliciesLength === 0) {
            return;
        }
        Navigation_1.default.navigate(ROUTES_1.default.ONBOARDING_WORKSPACES.getRoute(ROUTES_1.default.ONBOARDING_PERSONAL_DETAILS.getRoute()), { forceReplace: true });
    }, [isValidated, joinablePoliciesLength]);
    return (<ScreenWrapper_1.default shouldEnableMaxHeight includeSafeAreaPaddingBottom testID="BaseOnboardingPrivateDomain" style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}>
            <HeaderWithBackButton_1.default shouldShowBackButton progressBarPercentage={40} onBackButtonPress={Navigation_1.default.goBack}/>
            <ScrollView_1.default style={[styles.w100, styles.h100, styles.flex1]} contentContainerStyle={styles.flexGrow1} keyboardShouldPersistTaps="handled">
                <react_native_1.View style={[styles.mb5, onboardingIsMediumOrLargerScreenWidth && styles.mt5, onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5, styles.flex1]}>
                    <Text_1.default style={styles.textHeadlineH1}>{translate('onboarding.peopleYouMayKnow')}</Text_1.default>
                    <Text_1.default style={[styles.textAlignLeft, styles.mv5]}>{translate('onboarding.workspaceYouMayJoin', { domain: domain, email: email })}</Text_1.default>
                    <ValidateCodeForm_1.default validateCodeActionErrorField="getAccessiblePolicies" handleSubmitForm={function (code) {
            (0, Policy_1.getAccessiblePolicies)(code);
            setHasMagicCodeBeenSent(false);
        }} sendValidateCode={function () {
            sendValidateCode();
            setHasMagicCodeBeenSent(true);
        }} clearError={function () { return (0, Policy_1.clearGetAccessiblePoliciesErrors)(); }} validateError={getAccessiblePoliciesAction === null || getAccessiblePoliciesAction === void 0 ? void 0 : getAccessiblePoliciesAction.errors} hasMagicCodeBeenSent={hasMagicCodeBeenSent} shouldShowSkipButton handleSkipButtonPress={function () { var _a; return Navigation_1.default.navigate(ROUTES_1.default.ONBOARDING_PURPOSE.getRoute((_a = route.params) === null || _a === void 0 ? void 0 : _a.backTo)); }} buttonStyles={[styles.flex2, styles.justifyContentEnd]} isLoading={getAccessiblePoliciesAction === null || getAccessiblePoliciesAction === void 0 ? void 0 : getAccessiblePoliciesAction.loading}/>
                </react_native_1.View>
            </ScrollView_1.default>
        </ScreenWrapper_1.default>);
}
BaseOnboardingPrivateDomain.displayName = 'BaseOnboardingPrivateDomain';
exports.default = BaseOnboardingPrivateDomain;
