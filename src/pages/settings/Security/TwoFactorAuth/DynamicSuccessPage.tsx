import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useDynamicForwardPath from '@hooks/useDynamicForwardPath';
import useEnvironment from '@hooks/useEnvironment';
import useOnyx from '@hooks/useOnyx';

import AccountUtils from '@libs/AccountUtils';
import {getXeroSetupLink} from '@libs/actions/connections/Xero';
import getPlatform from '@libs/getPlatform';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {TwoFactorAuthNavigatorParamList} from '@libs/Navigation/types';
import {shouldHideOldAppRedirect} from '@libs/TryNewDotUtils';

import {openReimbursementAccountPage} from '@userActions/BankAccounts';
import {closeReactNativeApp} from '@userActions/HybridApp';
import {openLink} from '@userActions/Link';
import {clearTwoFactorAuthData, quitAndNavigateBack} from '@userActions/TwoFactorAuthActions';
import {buildOnboardingFlowParams, resumeOnboardingAfterRequired2FASetup} from '@userActions/Welcome/OnboardingFlow';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import {hasCompletedGuidedSetupFlowSelector} from '@src/selectors/Onboarding';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import {findFocusedRoute} from '@react-navigation/native';
import {authTokenTypeSelector} from '@selectors/Session';
import React from 'react';

import SuccessPageBase from './SuccessPageBase';

type DynamicSuccessPageProps = PlatformStackScreenProps<TwoFactorAuthNavigatorParamList, typeof SCREENS.TWO_FACTOR_AUTH.DYNAMIC_SUCCESS>;

function DynamicSuccessPage({route}: DynamicSuccessPageProps) {
    const {environmentURL} = useEnvironment();
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
    const dynamicBackPath = useDynamicBackPath(DYNAMIC_ROUTES.TWO_FACTOR_AUTH_SUCCESS.path);
    const dynamicForwardPath = useDynamicForwardPath(DYNAMIC_ROUTES.TWO_FACTOR_AUTH_SUCCESS.path);

    const baseState = getStateFromPath(dynamicBackPath);
    const focusedRoute = baseState ? findFocusedRoute(baseState) : undefined;
    const isUSDBankAccountFlow = focusedRoute?.name === SCREENS.REIMBURSEMENT_ACCOUNT;
    const isSecuritySettingsFlow = focusedRoute?.name === SCREENS.SETTINGS.SECURITY;
    // The require-2FA overlay opens setup on settings/security?forceSetup=true. The base route's query params are merged
    // into this screen's params and survive the Onyx clear in validateTwoFactorAuth, unlike account flags.
    const isForcedSetupFlow = isSecuritySettingsFlow && route.params?.forceSetup === 'true';

    const [tryNewDot, tryNewDotMetadata] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [onboardingValues] = useOnyx(ONYXKEYS.NVP_ONBOARDING);
    const hasCompletedGuidedSetupFlow = hasCompletedGuidedSetupFlowSelector(onboardingValues);
    const [onboardingPurposeSelected] = useOnyx(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED);
    const [onboardingCompanySize] = useOnyx(ONYXKEYS.ONBOARDING_COMPANY_SIZE);
    const [onboardingInitialPath] = useOnyx(ONYXKEYS.ONBOARDING_LAST_VISITED_PATH);
    const isLoadingTryNewDot = isLoadingOnyxValue(tryNewDotMetadata);
    const isClassicRedirectBlocked = shouldHideOldAppRedirect(tryNewDot, isLoadingTryNewDot, CONFIG.IS_HYBRID_APP);
    const isClassicRedirectDismissed = tryNewDot?.classicRedirect?.dismissed;
    const isIncompleteOnboarding = hasCompletedGuidedSetupFlow === false;
    const hasSavedOnboardingPath = !!onboardingInitialPath?.includes(`/${ROUTES.ONBOARDING_ROOT.route}`);
    // Forced onboarding 2FA always enters via Settings > Security (from the require-2FA overlay).
    // Gate on the real hasCompletedGuidedSetupFlow so the handoff only fires for users who haven't finished
    // guided setup; passing a literal false made it fire for every user setting up 2FA from Settings > Security.
    const isForcedOnboardingHandoff =
        AccountUtils.isForced2FAOnboardingSetup(account, !!hasCompletedGuidedSetupFlow) || (!!account?.requiresTwoFactorAuth && isIncompleteOnboarding && hasSavedOnboardingPath);
    const shouldReturnToOnboardingAfter2FA = isSecuritySettingsFlow && isForcedOnboardingHandoff;

    const is2FAEnabled = !!account?.requiresTwoFactorAuth;

    const completeForcedOnboarding2FAHandoff = () => {
        clearTwoFactorAuthData(is2FAEnabled, true);
        const onboardingFlowParams = buildOnboardingFlowParams(account, onboardingValues, onboardingCompanySize, onboardingPurposeSelected, onboardingInitialPath);
        Navigation.revealRouteBeforeDismissingModal(ROUTES.HOME, {
            afterTransition: () => {
                resumeOnboardingAfterRequired2FASetup(onboardingFlowParams);
            },
        });
    };

    const sendForcedSetupUserHome = () => {
        Navigation.revealRouteBeforeDismissingModal(ROUTES.HOME, {
            afterTransition: () => {
                clearTwoFactorAuthData(is2FAEnabled, true);
            },
        });
    };

    const goBack = () => {
        if (shouldReturnToOnboardingAfter2FA) {
            completeForcedOnboarding2FAHandoff();
            return;
        }
        if (isForcedSetupFlow) {
            sendForcedSetupUserHome();
            return;
        }
        if (isUSDBankAccountFlow) {
            Navigation.goBack(dynamicBackPath, {
                afterTransition: () => {
                    clearTwoFactorAuthData(is2FAEnabled);
                    // Re-fetch bank account data so ReimbursementAccountPage reflects the latest state after 2FA setup.
                    openReimbursementAccountPage({
                        policyID: route.params?.policyID,
                        stepToOpen: '',
                    });
                },
            });
            return;
        }
        quitAndNavigateBack(is2FAEnabled, dynamicBackPath);
    };

    const onButtonPress = () => {
        if (CONFIG.IS_HYBRID_APP && isClassicRedirectDismissed && !isClassicRedirectBlocked) {
            closeReactNativeApp({shouldSetNVP: false, isTrackingGPS: false});
            return;
        }
        if (shouldReturnToOnboardingAfter2FA) {
            completeForcedOnboarding2FAHandoff();
            return;
        }
        if (isForcedSetupFlow) {
            sendForcedSetupUserHome();
            return;
        }
        // For the Settings > Security entry, keep the 2FA RHP open on the Enabled page instead of dismissing it
        // back to the Security screen. The USD bank account and Xero flows fall through to goBack() so they still
        // return to their own entry points.
        if (isSecuritySettingsFlow) {
            Navigation.navigate(ROUTES.SETTINGS_2FA_ENABLED, {forceReplace: true});
            // Pass clearProgress=true to also reset twoFactorAuthSetupInProgress. Replacing the success screen with the
            // Enabled page keeps the TWO_FACTOR_AUTH modal mounted, so RightModalNavigator's beforeRemove cleanup never
            // runs here; without this the require-2FA overlay would persist for users who haven't finished guided setup.
            clearTwoFactorAuthData(is2FAEnabled, true);
            return;
        }
        goBack();
        if (dynamicForwardPath) {
            const policyID = route.params?.policyID;
            if (policyID) {
                // Open Xero setup the same way ConnectToXeroFlow does per platform: on web open the link inline in a
                // new browser tab (within this button's gesture), on native navigate to the in-app WebView setup
                // screen. Calling openLink on native would open the external browser instead of the WebView.
                if (getPlatform() === CONST.PLATFORM.WEB) {
                    openLink(getXeroSetupLink(policyID), environmentURL, false, session);
                } else {
                    Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_SETUP.getRoute(policyID));
                }
            }
        }
    };

    return (
        <SuccessPageBase
            onButtonPress={onButtonPress}
            onBackButtonPress={goBack}
        />
    );
}

export default DynamicSuccessPage;
