import {Str} from 'expensify-common';
import React, {useEffect, useRef, useState} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import ColorSchemeWrapper from '@components/ColorSchemeWrapper';
import CustomStatusBarAndBackground from '@components/CustomStatusBarAndBackground';
import ScreenWrapper from '@components/ScreenWrapper';
import ThemeProvider from '@components/ThemeProvider';
import ThemeStylesProvider from '@components/ThemeStylesProvider';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ActiveClientManager from '@libs/ActiveClientManager';
import * as Localize from '@libs/Localize';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import Performance from '@libs/Performance';
import Visibility from '@libs/Visibility';
import * as App from '@userActions/App';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Account, Credentials, Locale} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import ChooseSSOOrMagicCode from './ChooseSSOOrMagicCode';
import EmailDeliveryFailurePage from './EmailDeliveryFailurePage';
import LoginForm from './LoginForm';
import type {InputHandle} from './LoginForm/types';
import SignInPageLayout from './SignInPageLayout';
import type {SignInPageLayoutRef} from './SignInPageLayout/types';
import SignUpWelcomeForm from './SignUpWelcomeForm';
import UnlinkLoginForm from './UnlinkLoginForm';
import ValidateCodeForm from './ValidateCodeForm';

type SignInPageInnerOnyxProps = {
    /** The details about the account that the user is signing in with */
    account: OnyxEntry<Account>;

    /** The credentials of the person signing in */
    credentials: OnyxEntry<Credentials>;

    /** Active Clients connected to ONYX Database */
    activeClients: OnyxEntry<string[]>;

    /** The user's preferred locale */
    preferredLocale: OnyxEntry<Locale>;
};

type SignInPageInnerProps = SignInPageInnerOnyxProps & {
    shouldEnableMaxHeight?: boolean;
};

type RenderOption = {
    shouldShowLoginForm: boolean;
    shouldShowEmailDeliveryFailurePage: boolean;
    shouldShowUnlinkLoginForm: boolean;
    shouldShowValidateCodeForm: boolean;
    shouldShowChooseSSOOrMagicCode: boolean;
    shouldInitiateSAMLLogin: boolean;
    shouldShowWelcomeHeader: boolean;
    shouldShowWelcomeText: boolean;
    shouldShouldSignUpWelcomeForm: boolean;
};

type GetRenderOptionsParams = {
    hasLogin: boolean;
    hasValidateCode: boolean;
    account: OnyxEntry<Account>;
    isPrimaryLogin: boolean;
    isUsingMagicCode: boolean;
    hasInitiatedSAMLLogin: boolean;
    shouldShowAnotherLoginPageOpenedMessage: boolean;
    credentials: OnyxEntry<Credentials>;
};

/**
 * @param hasLogin
 * @param hasValidateCode
 * @param account
 * @param isPrimaryLogin
 * @param isUsingMagicCode
 * @param hasInitiatedSAMLLogin
 * @param hasEmailDeliveryFailure
 */
function getRenderOptions({
    hasLogin,
    hasValidateCode,
    account,
    isPrimaryLogin,
    isUsingMagicCode,
    hasInitiatedSAMLLogin,
    shouldShowAnotherLoginPageOpenedMessage,
    credentials,
}: GetRenderOptionsParams): RenderOption {
    const hasAccount = !isEmptyObject(account);
    const isSAMLEnabled = !!account?.isSAMLEnabled;
    const isSAMLRequired = !!account?.isSAMLRequired;
    const hasEmailDeliveryFailure = !!account?.hasEmailDeliveryFailure;

    // True, if the user has SAML required, and we haven't yet initiated SAML for their account
    const shouldInitiateSAMLLogin = hasAccount && hasLogin && isSAMLRequired && !hasInitiatedSAMLLogin && !!account.isLoading;
    const shouldShowChooseSSOOrMagicCode = hasAccount && hasLogin && isSAMLEnabled && !isSAMLRequired && !isUsingMagicCode;

    // SAML required users may reload the login page after having already entered their login details, in which
    // case we want to clear their sign in data so they don't end up in an infinite loop redirecting back to their
    // SSO provider's login page
    if (hasLogin && isSAMLRequired && !shouldInitiateSAMLLogin && !hasInitiatedSAMLLogin && !account.isLoading) {
        Session.clearSignInData();
    }

    // Show the Welcome form if a user is signing up for a new account in a domain that is not controlled
    const shouldShouldSignUpWelcomeForm = !!credentials?.login && !account?.validated && !account?.accountExists && !account?.domainControlled;
    const shouldShowLoginForm = !shouldShowAnotherLoginPageOpenedMessage && !hasLogin && !hasValidateCode;
    const shouldShowEmailDeliveryFailurePage = hasLogin && hasEmailDeliveryFailure && !shouldShowChooseSSOOrMagicCode && !shouldInitiateSAMLLogin;
    const isUnvalidatedSecondaryLogin = hasLogin && !isPrimaryLogin && !account?.validated && !hasEmailDeliveryFailure;
    const shouldShowValidateCodeForm =
        !shouldShouldSignUpWelcomeForm &&
        hasAccount &&
        (hasLogin || hasValidateCode) &&
        !isUnvalidatedSecondaryLogin &&
        !hasEmailDeliveryFailure &&
        !shouldShowChooseSSOOrMagicCode &&
        !isSAMLRequired;
    const shouldShowWelcomeHeader = shouldShowLoginForm || shouldShowValidateCodeForm || shouldShowChooseSSOOrMagicCode || isUnvalidatedSecondaryLogin || shouldShouldSignUpWelcomeForm;
    const shouldShowWelcomeText =
        shouldShowLoginForm || shouldShowValidateCodeForm || shouldShowChooseSSOOrMagicCode || shouldShowAnotherLoginPageOpenedMessage || shouldShouldSignUpWelcomeForm;

    return {
        shouldShowLoginForm,
        shouldShowEmailDeliveryFailurePage,
        shouldShowUnlinkLoginForm: !shouldShouldSignUpWelcomeForm && isUnvalidatedSecondaryLogin,
        shouldShowValidateCodeForm,
        shouldShowChooseSSOOrMagicCode,
        shouldInitiateSAMLLogin,
        shouldShowWelcomeHeader,
        shouldShowWelcomeText,
        shouldShouldSignUpWelcomeForm,
    };
}

function SignInPage({credentials, account, activeClients = [], preferredLocale, shouldEnableMaxHeight = true}: SignInPageInnerProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate, formatPhoneNumber} = useLocalize();
    const {shouldUseNarrowLayout, isInNarrowPaneModal} = useResponsiveLayout();
    const safeAreaInsets = useSafeAreaInsets();
    const signInPageLayoutRef = useRef<SignInPageLayoutRef>(null);
    const loginFormRef = useRef<InputHandle>(null);
    /** This state is needed to keep track of if user is using recovery code instead of 2fa code,
     * and we need it here since welcome text(`welcomeText`) also depends on it */
    const [isUsingRecoveryCode, setIsUsingRecoveryCode] = useState(false);

    /** This state is needed to keep track of whether the user has opted to use magic codes
     * instead of signing in via SAML when SAML is enabled and not required */
    const [isUsingMagicCode, setIsUsingMagicCode] = useState(false);

    /** This state is needed to keep track of whether the user has been directed to their SSO provider's login page and
     *  if we need to clear their sign in details so they can enter a login */
    const [hasInitiatedSAMLLogin, setHasInitiatedSAMLLogin] = useState(false);

    const isClientTheLeader = !!activeClients && ActiveClientManager.isClientTheLeader();
    // We need to show "Another login page is opened" message if the page isn't active and visible
    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowAnotherLoginPageOpenedMessage = Visibility.isVisible() && !isClientTheLeader;

    useEffect(() => Performance.measureTTI(), []);
    useEffect(() => {
        if (preferredLocale) {
            return;
        }
        App.setLocale(Localize.getDevicePreferredLocale());
    }, [preferredLocale]);
    useEffect(() => {
        if (credentials?.login) {
            return;
        }

        // If we don't have a login set, reset the user's SAML login preferences
        if (isUsingMagicCode) {
            setIsUsingMagicCode(false);
        }
        if (hasInitiatedSAMLLogin) {
            setHasInitiatedSAMLLogin(false);
        }
    }, [credentials?.login, isUsingMagicCode, setIsUsingMagicCode, hasInitiatedSAMLLogin, setHasInitiatedSAMLLogin]);

    const {
        shouldShowLoginForm,
        shouldShowEmailDeliveryFailurePage,
        shouldShowUnlinkLoginForm,
        shouldShowValidateCodeForm,
        shouldShowChooseSSOOrMagicCode,
        shouldInitiateSAMLLogin,
        shouldShowWelcomeHeader,
        shouldShowWelcomeText,
        shouldShouldSignUpWelcomeForm,
    } = getRenderOptions({
        hasLogin: !!credentials?.login,
        hasValidateCode: !!credentials?.validateCode,
        account,
        isPrimaryLogin: !account?.primaryLogin || account.primaryLogin === credentials?.login,
        isUsingMagicCode,
        hasInitiatedSAMLLogin,
        shouldShowAnotherLoginPageOpenedMessage,
        credentials,
    });

    if (shouldInitiateSAMLLogin) {
        setHasInitiatedSAMLLogin(true);
        Navigation.isNavigationReady().then(() => Navigation.navigate(ROUTES.SAML_SIGN_IN));
    }

    let welcomeHeader = '';
    let welcomeText = '';
    const headerText = translate('login.hero.header');

    const userLogin = Str.removeSMSDomain(credentials?.login ?? '');

    // replacing spaces with "hard spaces" to prevent breaking the number
    const userLoginToDisplay = Str.isSMSLogin(userLogin) ? formatPhoneNumber(userLogin) : userLogin;

    if (shouldShowAnotherLoginPageOpenedMessage) {
        welcomeHeader = translate('welcomeText.anotherLoginPageIsOpen');
        welcomeText = translate('welcomeText.anotherLoginPageIsOpenExplanation');
    } else if (shouldShowLoginForm) {
        welcomeHeader = shouldUseNarrowLayout ? headerText : translate('welcomeText.getStarted');
        welcomeText = shouldUseNarrowLayout ? translate('welcomeText.getStarted') : '';
    } else if (shouldShowValidateCodeForm) {
        if (account?.requiresTwoFactorAuth) {
            // We will only know this after a user signs in successfully, without their 2FA code
            welcomeHeader = shouldUseNarrowLayout ? '' : translate('welcomeText.welcome');
            welcomeText = isUsingRecoveryCode ? translate('validateCodeForm.enterRecoveryCode') : translate('validateCodeForm.enterAuthenticatorCode');
        } else {
            welcomeHeader = shouldUseNarrowLayout ? '' : translate('welcomeText.welcome');
            welcomeText = shouldUseNarrowLayout
                ? `${translate('welcomeText.welcome')} ${translate('welcomeText.welcomeEnterMagicCode', {login: userLoginToDisplay})}`
                : translate('welcomeText.welcomeEnterMagicCode', {login: userLoginToDisplay});
        }
    } else if (shouldShowUnlinkLoginForm || shouldShowEmailDeliveryFailurePage || shouldShowChooseSSOOrMagicCode) {
        welcomeHeader = shouldUseNarrowLayout ? headerText : translate('welcomeText.welcome');

        // Don't show any welcome text if we're showing the user the email delivery failed view
        if (shouldShowEmailDeliveryFailurePage || shouldShowChooseSSOOrMagicCode) {
            welcomeText = '';
        }
    } else if (shouldShouldSignUpWelcomeForm) {
        welcomeHeader = shouldUseNarrowLayout ? headerText : translate('welcomeText.welcome');
        welcomeText = shouldUseNarrowLayout
            ? `${translate('welcomeText.welcomeWithoutExclamation')} ${translate('welcomeText.welcomeNewFace', {login: userLoginToDisplay})}`
            : translate('welcomeText.welcomeNewFace', {login: userLoginToDisplay});
    } else if (!shouldInitiateSAMLLogin && !hasInitiatedSAMLLogin) {
        Log.warn('SignInPage in unexpected state!');
    }

    const navigateFocus = () => {
        signInPageLayoutRef.current?.scrollPageToTop();
        loginFormRef.current?.clearDataAndFocus();
    };

    return (
        // Bottom SafeAreaView is removed so that login screen svg displays correctly on mobile.
        // The SVG should flow under the Home Indicator on iOS.
        <ScreenWrapper
            shouldShowOfflineIndicator={false}
            shouldEnableMaxHeight={shouldEnableMaxHeight}
            shouldUseCachedViewportHeight
            style={[styles.signInPage, StyleUtils.getSafeAreaPadding({...safeAreaInsets, bottom: 0, top: isInNarrowPaneModal ? 0 : safeAreaInsets.top}, 1)]}
            testID={SignInPageThemeWrapper.displayName}
        >
            <SignInPageLayout
                welcomeHeader={welcomeHeader}
                welcomeText={welcomeText}
                shouldShowWelcomeHeader={shouldShowWelcomeHeader || !shouldUseNarrowLayout}
                shouldShowWelcomeText={shouldShowWelcomeText}
                ref={signInPageLayoutRef}
                navigateFocus={navigateFocus}
            >
                {/* LoginForm must use the isVisible prop. This keeps it mounted, but visually hidden
             so that password managers can access the values. Conditionally rendering this component will break this feature. */}
                <LoginForm
                    ref={loginFormRef}
                    isVisible={shouldShowLoginForm}
                    blurOnSubmit={account?.validated === false}
                    scrollPageToTop={signInPageLayoutRef.current?.scrollPageToTop}
                />
                {shouldShouldSignUpWelcomeForm && <SignUpWelcomeForm />}
                {shouldShowValidateCodeForm && (
                    <ValidateCodeForm
                        isVisible={!shouldShowAnotherLoginPageOpenedMessage}
                        isUsingRecoveryCode={isUsingRecoveryCode}
                        setIsUsingRecoveryCode={setIsUsingRecoveryCode}
                    />
                )}
                {!shouldShowAnotherLoginPageOpenedMessage && (
                    <>
                        {shouldShowUnlinkLoginForm && <UnlinkLoginForm />}
                        {shouldShowChooseSSOOrMagicCode && <ChooseSSOOrMagicCode setIsUsingMagicCode={setIsUsingMagicCode} />}
                        {shouldShowEmailDeliveryFailurePage && <EmailDeliveryFailurePage />}
                    </>
                )}
            </SignInPageLayout>
        </ScreenWrapper>
    );
}

type SignInPageProps = SignInPageInnerProps;
type SignInPageOnyxProps = SignInPageInnerOnyxProps;

function SignInPageThemeWrapper(props: SignInPageProps) {
    return (
        <ThemeProvider theme={CONST.THEME.DARK}>
            <ThemeStylesProvider>
                <ColorSchemeWrapper>
                    <CustomStatusBarAndBackground isNested />
                    <SignInPage
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...props}
                    />
                </ColorSchemeWrapper>
            </ThemeStylesProvider>
        </ThemeProvider>
    );
}

SignInPageThemeWrapper.displayName = 'SignInPage';

export default withOnyx<SignInPageProps, SignInPageOnyxProps>({
    account: {key: ONYXKEYS.ACCOUNT},
    credentials: {key: ONYXKEYS.CREDENTIALS},
    /**
      This variable is only added to make sure the component is re-rendered
      whenever the activeClients change, so that we call the
      ActiveClientManager.isClientTheLeader function
      everytime the leader client changes.
      We use that function to prevent repeating code that checks which client is the leader.
    */
    activeClients: {key: ONYXKEYS.ACTIVE_CLIENTS},
    preferredLocale: {
        key: ONYXKEYS.NVP_PREFERRED_LOCALE,
    },
})(SignInPageThemeWrapper);
