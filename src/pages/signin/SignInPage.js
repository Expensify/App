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
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var ColorSchemeWrapper_1 = require("@components/ColorSchemeWrapper");
var CustomStatusBarAndBackground_1 = require("@components/CustomStatusBarAndBackground");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ThemeProvider_1 = require("@components/ThemeProvider");
var ThemeStylesProvider_1 = require("@components/ThemeStylesProvider");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useSafeAreaInsets_1 = require("@hooks/useSafeAreaInsets");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ActiveClientManager_1 = require("@libs/ActiveClientManager");
var Localize_1 = require("@libs/Localize");
var Log_1 = require("@libs/Log");
var Navigation_1 = require("@libs/Navigation/Navigation");
var Performance_1 = require("@libs/Performance");
var Visibility_1 = require("@libs/Visibility");
var App_1 = require("@userActions/App");
var Session_1 = require("@userActions/Session");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var ChooseSSOOrMagicCode_1 = require("./ChooseSSOOrMagicCode");
var EmailDeliveryFailurePage_1 = require("./EmailDeliveryFailurePage");
var LoginForm_1 = require("./LoginForm");
var SignInLoginContext_1 = require("./SignInLoginContext");
var SignInPageLayout_1 = require("./SignInPageLayout");
var SignUpWelcomeForm_1 = require("./SignUpWelcomeForm");
var SMSDeliveryFailurePage_1 = require("./SMSDeliveryFailurePage");
var UnlinkLoginForm_1 = require("./UnlinkLoginForm");
var ValidateCodeForm_1 = require("./ValidateCodeForm");
/**
 * @param hasLogin
 * @param hasValidateCode
 * @param account
 * @param isPrimaryLogin
 * @param isUsingMagicCode
 * @param hasInitiatedSAMLLogin
 * @param hasEmailDeliveryFailure
 * @param hasSMSDeliveryFailure
 */
function getRenderOptions(_a) {
    var _b;
    var hasLogin = _a.hasLogin, hasValidateCode = _a.hasValidateCode, account = _a.account, isPrimaryLogin = _a.isPrimaryLogin, isUsingMagicCode = _a.isUsingMagicCode, hasInitiatedSAMLLogin = _a.hasInitiatedSAMLLogin, shouldShowAnotherLoginPageOpenedMessage = _a.shouldShowAnotherLoginPageOpenedMessage, credentials = _a.credentials, isAccountValidated = _a.isAccountValidated;
    var hasAccount = !(0, EmptyObject_1.isEmptyObject)(account);
    var isSAMLEnabled = !!(account === null || account === void 0 ? void 0 : account.isSAMLEnabled);
    var isSAMLRequired = !!(account === null || account === void 0 ? void 0 : account.isSAMLRequired);
    var hasEmailDeliveryFailure = !!(account === null || account === void 0 ? void 0 : account.hasEmailDeliveryFailure);
    var hasSMSDeliveryFailure = !!((_b = account === null || account === void 0 ? void 0 : account.smsDeliveryFailureStatus) === null || _b === void 0 ? void 0 : _b.hasSMSDeliveryFailure);
    // True, if the user has SAML required, and we haven't yet initiated SAML for their account
    var shouldInitiateSAMLLogin = hasAccount && hasLogin && isSAMLRequired && !hasInitiatedSAMLLogin && !!account.isLoading;
    var shouldShowChooseSSOOrMagicCode = hasAccount && hasLogin && isSAMLEnabled && !isSAMLRequired && !isUsingMagicCode;
    // SAML required users may reload the login page after having already entered their login details, in which
    // case we want to clear their sign in data so they don't end up in an infinite loop redirecting back to their
    // SSO provider's login page
    if (hasLogin && isSAMLRequired && !shouldInitiateSAMLLogin && !hasInitiatedSAMLLogin && !account.isLoading) {
        (0, Session_1.clearSignInData)();
    }
    // Show the Welcome form if a user is signing up for a new account in a domain that is not controlled
    var shouldShouldSignUpWelcomeForm = !!(credentials === null || credentials === void 0 ? void 0 : credentials.login) && !isAccountValidated && !(account === null || account === void 0 ? void 0 : account.accountExists) && !(account === null || account === void 0 ? void 0 : account.domainControlled);
    var shouldShowLoginForm = !shouldShowAnotherLoginPageOpenedMessage && !hasLogin && !hasValidateCode;
    var shouldShowEmailDeliveryFailurePage = hasLogin && hasEmailDeliveryFailure && !shouldShowChooseSSOOrMagicCode && !shouldInitiateSAMLLogin;
    var shouldShowSMSDeliveryFailurePage = !!(hasLogin && hasSMSDeliveryFailure && !shouldShowChooseSSOOrMagicCode && !shouldInitiateSAMLLogin && (account === null || account === void 0 ? void 0 : account.accountExists));
    var isUnvalidatedSecondaryLogin = hasLogin && !isPrimaryLogin && !isAccountValidated && !hasEmailDeliveryFailure && !hasSMSDeliveryFailure;
    var shouldShowValidateCodeForm = !shouldShouldSignUpWelcomeForm &&
        hasAccount &&
        (hasLogin || hasValidateCode) &&
        !isUnvalidatedSecondaryLogin &&
        !hasEmailDeliveryFailure &&
        !hasSMSDeliveryFailure &&
        !shouldShowChooseSSOOrMagicCode &&
        !isSAMLRequired;
    var shouldShowWelcomeHeader = shouldShowLoginForm || shouldShowValidateCodeForm || shouldShowChooseSSOOrMagicCode || isUnvalidatedSecondaryLogin || shouldShouldSignUpWelcomeForm;
    var shouldShowWelcomeText = shouldShowLoginForm || shouldShowValidateCodeForm || shouldShowChooseSSOOrMagicCode || shouldShowAnotherLoginPageOpenedMessage || shouldShouldSignUpWelcomeForm;
    return {
        shouldShowLoginForm: shouldShowLoginForm,
        shouldShowEmailDeliveryFailurePage: shouldShowEmailDeliveryFailurePage,
        shouldShowSMSDeliveryFailurePage: shouldShowSMSDeliveryFailurePage,
        shouldShowUnlinkLoginForm: !shouldShouldSignUpWelcomeForm && isUnvalidatedSecondaryLogin,
        shouldShowValidateCodeForm: shouldShowValidateCodeForm,
        shouldShowChooseSSOOrMagicCode: shouldShowChooseSSOOrMagicCode,
        shouldInitiateSAMLLogin: shouldInitiateSAMLLogin,
        shouldShowWelcomeHeader: shouldShowWelcomeHeader,
        shouldShowWelcomeText: shouldShowWelcomeText,
        shouldShouldSignUpWelcomeForm: shouldShouldSignUpWelcomeForm,
    };
}
function SignInPage(_a, ref) {
    var _b, _c;
    var _d = _a.shouldEnableMaxHeight, shouldEnableMaxHeight = _d === void 0 ? true : _d;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var _e = (0, useLocalize_1.default)(), translate = _e.translate, formatPhoneNumber = _e.formatPhoneNumber;
    var _f = (0, useResponsiveLayout_1.default)(), shouldUseNarrowLayout = _f.shouldUseNarrowLayout, isInNarrowPaneModal = _f.isInNarrowPaneModal;
    var safeAreaInsets = (0, useSafeAreaInsets_1.default)();
    var signInPageLayoutRef = (0, react_1.useRef)(null);
    var loginFormRef = (0, react_1.useRef)(null);
    var validateCodeFormRef = (0, react_1.useRef)(null);
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { canBeMissing: true })[0];
    var isAccountValidated = account === null || account === void 0 ? void 0 : account.validated;
    var credentials = (0, useOnyx_1.default)(ONYXKEYS_1.default.CREDENTIALS, { canBeMissing: true })[0];
    /**
      This variable is only added to make sure the component is re-rendered
      whenever the activeClients change, so that we call the
      ActiveClientManager.isClientTheLeader function
      every time the leader client changes.
      We use that function to prevent repeating code that checks which client is the leader.
    */
    var _g = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACTIVE_CLIENTS, { canBeMissing: true })[0], activeClients = _g === void 0 ? [] : _g;
    var preferredLocale = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_PREFERRED_LOCALE, { canBeMissing: true })[0];
    /** This state is needed to keep track of if user is using recovery code instead of 2fa code,
     * and we need it here since welcome text(`welcomeText`) also depends on it */
    var _h = (0, react_1.useState)(false), isUsingRecoveryCode = _h[0], setIsUsingRecoveryCode = _h[1];
    /** This state is needed to keep track of whether the user has opted to use magic codes
     * instead of signing in via SAML when SAML is enabled and not required */
    var _j = (0, react_1.useState)(false), isUsingMagicCode = _j[0], setIsUsingMagicCode = _j[1];
    /** This state is needed to keep track of whether the user has been directed to their SSO provider's login page and
     *  if we need to clear their sign in details so they can enter a login */
    var _k = (0, react_1.useState)(false), hasInitiatedSAMLLogin = _k[0], setHasInitiatedSAMLLogin = _k[1];
    var isClientTheLeader = !!activeClients && (0, ActiveClientManager_1.isClientTheLeader)();
    // We need to show "Another login page is opened" message if the page isn't active and visible
    // eslint-disable-next-line rulesdir/no-negated-variables
    var shouldShowAnotherLoginPageOpenedMessage = Visibility_1.default.isVisible() && !isClientTheLeader;
    (0, react_1.useEffect)(function () { return Performance_1.default.measureTTI(); }, []);
    (0, react_1.useEffect)(function () {
        if (preferredLocale) {
            return;
        }
        (0, App_1.setLocale)((0, Localize_1.getDevicePreferredLocale)());
    }, [preferredLocale]);
    (0, react_1.useEffect)(function () {
        if (credentials === null || credentials === void 0 ? void 0 : credentials.login) {
            return;
        }
        // If we don't have a login set, reset the user's SAML login preferences
        if (isUsingMagicCode) {
            setIsUsingMagicCode(false);
        }
        if (hasInitiatedSAMLLogin) {
            setHasInitiatedSAMLLogin(false);
        }
    }, [credentials === null || credentials === void 0 ? void 0 : credentials.login, isUsingMagicCode, setIsUsingMagicCode, hasInitiatedSAMLLogin, setHasInitiatedSAMLLogin]);
    var _l = getRenderOptions({
        hasLogin: !!(credentials === null || credentials === void 0 ? void 0 : credentials.login),
        hasValidateCode: !!(credentials === null || credentials === void 0 ? void 0 : credentials.validateCode),
        account: account,
        isPrimaryLogin: !(account === null || account === void 0 ? void 0 : account.primaryLogin) || account.primaryLogin === (credentials === null || credentials === void 0 ? void 0 : credentials.login),
        isUsingMagicCode: isUsingMagicCode,
        hasInitiatedSAMLLogin: hasInitiatedSAMLLogin,
        shouldShowAnotherLoginPageOpenedMessage: shouldShowAnotherLoginPageOpenedMessage,
        credentials: credentials,
        isAccountValidated: isAccountValidated,
    }), shouldShowLoginForm = _l.shouldShowLoginForm, shouldShowEmailDeliveryFailurePage = _l.shouldShowEmailDeliveryFailurePage, shouldShowSMSDeliveryFailurePage = _l.shouldShowSMSDeliveryFailurePage, shouldShowUnlinkLoginForm = _l.shouldShowUnlinkLoginForm, shouldShowValidateCodeForm = _l.shouldShowValidateCodeForm, shouldShowChooseSSOOrMagicCode = _l.shouldShowChooseSSOOrMagicCode, shouldInitiateSAMLLogin = _l.shouldInitiateSAMLLogin, shouldShowWelcomeHeader = _l.shouldShowWelcomeHeader, shouldShowWelcomeText = _l.shouldShowWelcomeText, shouldShouldSignUpWelcomeForm = _l.shouldShouldSignUpWelcomeForm;
    if (shouldInitiateSAMLLogin) {
        setHasInitiatedSAMLLogin(true);
        Navigation_1.default.isNavigationReady().then(function () { return Navigation_1.default.navigate(ROUTES_1.default.SAML_SIGN_IN); });
    }
    var welcomeHeader = '';
    var welcomeText = '';
    var headerText = translate('login.hero.header');
    var userLogin = expensify_common_1.Str.removeSMSDomain((_b = credentials === null || credentials === void 0 ? void 0 : credentials.login) !== null && _b !== void 0 ? _b : '');
    // replacing spaces with "hard spaces" to prevent breaking the number
    var userLoginToDisplay = expensify_common_1.Str.isSMSLogin(userLogin) ? formatPhoneNumber(userLogin) : userLogin;
    if (shouldShowAnotherLoginPageOpenedMessage) {
        welcomeHeader = translate('welcomeText.anotherLoginPageIsOpen');
        welcomeText = translate('welcomeText.anotherLoginPageIsOpenExplanation');
    }
    else if (shouldShowLoginForm) {
        welcomeHeader = shouldUseNarrowLayout ? headerText : translate('welcomeText.getStarted');
        welcomeText = shouldUseNarrowLayout ? translate('welcomeText.getStarted') : '';
    }
    else if (shouldShowValidateCodeForm) {
        if (account === null || account === void 0 ? void 0 : account.requiresTwoFactorAuth) {
            // We will only know this after a user signs in successfully, without their 2FA code
            welcomeHeader = shouldUseNarrowLayout ? '' : translate('welcomeText.welcome');
            welcomeText = isUsingRecoveryCode ? translate('validateCodeForm.enterRecoveryCode') : translate('validateCodeForm.enterAuthenticatorCode');
        }
        else {
            welcomeHeader = shouldUseNarrowLayout ? '' : translate('welcomeText.welcome');
            welcomeText = shouldUseNarrowLayout
                ? "".concat(translate('welcomeText.welcome'), " ").concat(translate('welcomeText.welcomeEnterMagicCode', { login: userLoginToDisplay }))
                : translate('welcomeText.welcomeEnterMagicCode', { login: userLoginToDisplay });
        }
    }
    else if (shouldShowUnlinkLoginForm || shouldShowEmailDeliveryFailurePage || shouldShowChooseSSOOrMagicCode || shouldShowSMSDeliveryFailurePage) {
        welcomeHeader = shouldUseNarrowLayout ? headerText : translate('welcomeText.welcome');
        // Don't show any welcome text if we're showing the user the email delivery failed view
        if (shouldShowEmailDeliveryFailurePage || shouldShowChooseSSOOrMagicCode || shouldShowSMSDeliveryFailurePage) {
            welcomeText = '';
        }
    }
    else if (shouldShouldSignUpWelcomeForm) {
        welcomeHeader = shouldUseNarrowLayout ? headerText : translate('welcomeText.welcome');
        welcomeText = shouldUseNarrowLayout
            ? "".concat(translate('welcomeText.welcomeWithoutExclamation'), " ").concat(translate('welcomeText.welcomeNewFace', { login: userLoginToDisplay }))
            : translate('welcomeText.welcomeNewFace', { login: userLoginToDisplay });
    }
    else if (!shouldInitiateSAMLLogin && !hasInitiatedSAMLLogin) {
        Log_1.default.warn('SignInPage in unexpected state!');
    }
    var navigateFocus = function () {
        var _a, _b;
        (_a = signInPageLayoutRef.current) === null || _a === void 0 ? void 0 : _a.scrollPageToTop();
        (_b = loginFormRef.current) === null || _b === void 0 ? void 0 : _b.clearDataAndFocus();
    };
    var navigateBack = function () {
        var _a;
        if (shouldShouldSignUpWelcomeForm ||
            (!shouldShowAnotherLoginPageOpenedMessage &&
                (shouldShowEmailDeliveryFailurePage || shouldShowUnlinkLoginForm || shouldShowChooseSSOOrMagicCode || shouldShowSMSDeliveryFailurePage))) {
            (0, Session_1.clearSignInData)();
            return;
        }
        if (shouldShowValidateCodeForm) {
            (_a = validateCodeFormRef.current) === null || _a === void 0 ? void 0 : _a.clearSignInData();
            return;
        }
        Navigation_1.default.goBack();
    };
    (0, react_1.useImperativeHandle)(ref, function () { return ({
        navigateBack: navigateBack,
    }); });
    return (
    // Bottom SafeAreaView is removed so that login screen svg displays correctly on mobile.
    // The SVG should flow under the Home Indicator on iOS.
    <ScreenWrapper_1.default shouldShowOfflineIndicator={false} shouldEnableMaxHeight={shouldEnableMaxHeight} style={[styles.signInPage, StyleUtils.getPlatformSafeAreaPadding(__assign(__assign({}, safeAreaInsets), { bottom: 0, top: isInNarrowPaneModal ? 0 : safeAreaInsets.top }), 1)]} testID={SignInPageWrapper.displayName}>
            <SignInPageLayout_1.default welcomeHeader={welcomeHeader} welcomeText={welcomeText} shouldShowWelcomeHeader={shouldShowWelcomeHeader || !shouldUseNarrowLayout} shouldShowWelcomeText={shouldShowWelcomeText} ref={signInPageLayoutRef} navigateFocus={navigateFocus}>
                {/* LoginForm must use the isVisible prop. This keeps it mounted, but visually hidden
     so that password managers can access the values. Conditionally rendering this component will break this feature. */}
                <LoginForm_1.default ref={loginFormRef} isVisible={shouldShowLoginForm} blurOnSubmit={isAccountValidated === false} 
    // eslint-disable-next-line react-compiler/react-compiler
    scrollPageToTop={(_c = signInPageLayoutRef.current) === null || _c === void 0 ? void 0 : _c.scrollPageToTop}/>
                {shouldShouldSignUpWelcomeForm && <SignUpWelcomeForm_1.default />}
                {shouldShowValidateCodeForm && (<ValidateCodeForm_1.default isVisible={!shouldShowAnotherLoginPageOpenedMessage} isUsingRecoveryCode={isUsingRecoveryCode} setIsUsingRecoveryCode={setIsUsingRecoveryCode} ref={validateCodeFormRef}/>)}
                {!shouldShowAnotherLoginPageOpenedMessage && (<>
                        {shouldShowUnlinkLoginForm && <UnlinkLoginForm_1.default />}
                        {shouldShowChooseSSOOrMagicCode && <ChooseSSOOrMagicCode_1.default setIsUsingMagicCode={setIsUsingMagicCode}/>}
                        {shouldShowEmailDeliveryFailurePage && <EmailDeliveryFailurePage_1.default />}
                        {shouldShowSMSDeliveryFailurePage && <SMSDeliveryFailurePage_1.default />}
                    </>)}
            </SignInPageLayout_1.default>
        </ScreenWrapper_1.default>);
}
var SignInPageWithRef = (0, react_1.forwardRef)(SignInPage);
function SignInPageWrapper(props, ref) {
    return (<ThemeProvider_1.default theme={CONST_1.default.THEME.DARK}>
            <ThemeStylesProvider_1.default>
                <ColorSchemeWrapper_1.default>
                    <CustomStatusBarAndBackground_1.default isNested/>
                    <SignInLoginContext_1.LoginProvider>
                        <SignInPageWithRef ref={ref} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}/>
                    </SignInLoginContext_1.LoginProvider>
                </ColorSchemeWrapper_1.default>
            </ThemeStylesProvider_1.default>
        </ThemeProvider_1.default>);
}
SignInPageWrapper.displayName = 'SignInPage';
exports.default = (0, react_1.forwardRef)(SignInPageWrapper);
