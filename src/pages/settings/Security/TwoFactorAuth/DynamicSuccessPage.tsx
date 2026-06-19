import {findFocusedRoute} from '@react-navigation/native';
import React from 'react';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useDynamicForwardPath from '@hooks/useDynamicForwardPath';
import useEnvironment from '@hooks/useEnvironment';
import useOnyx from '@hooks/useOnyx';
import {getXeroSetupLink} from '@libs/actions/connections/Xero';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {TwoFactorAuthNavigatorParamList} from '@libs/Navigation/types';
import {shouldHideOldAppRedirect} from '@libs/TryNewDotUtils';
import {openReimbursementAccountPage} from '@userActions/BankAccounts';
import {closeReactNativeApp} from '@userActions/HybridApp';
import {openLink} from '@userActions/Link';
import {clearTwoFactorAuthData, quitAndNavigateBack} from '@userActions/TwoFactorAuthActions';
import CONFIG from '@src/CONFIG';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import SuccessPageBase from './SuccessPageBase';

type DynamicSuccessPageProps = PlatformStackScreenProps<TwoFactorAuthNavigatorParamList, typeof SCREENS.TWO_FACTOR_AUTH.DYNAMIC_SUCCESS>;

function DynamicSuccessPage({route}: DynamicSuccessPageProps) {
    const {environmentURL} = useEnvironment();
    const dynamicBackPath = useDynamicBackPath(DYNAMIC_ROUTES.TWO_FACTOR_AUTH_SUCCESS.path);
    const dynamicForwardPath = useDynamicForwardPath(DYNAMIC_ROUTES.TWO_FACTOR_AUTH_SUCCESS.path);

    const baseState = getStateFromPath(dynamicBackPath);
    const focusedRoute = baseState ? findFocusedRoute(baseState) : undefined;
    const isUSDBankAccountFlow = focusedRoute?.name === SCREENS.REIMBURSEMENT_ACCOUNT;
    const isSecuritySettingsFlow = focusedRoute?.name === SCREENS.SETTINGS.SECURITY;

    const [tryNewDot, tryNewDotMetadata] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT);
    const isLoadingTryNewDot = isLoadingOnyxValue(tryNewDotMetadata);
    const isClassicRedirectBlocked = shouldHideOldAppRedirect(tryNewDot, isLoadingTryNewDot, CONFIG.IS_HYBRID_APP);
    const isClassicRedirectDismissed = tryNewDot?.classicRedirect?.dismissed;

    const goBack = () => {
        if (isUSDBankAccountFlow) {
            Navigation.goBack(dynamicBackPath, {
                afterTransition: () => {
                    clearTwoFactorAuthData();
                    // Re-fetch bank account data so ReimbursementAccountPage reflects the latest state after 2FA setup.
                    openReimbursementAccountPage({
                        policyID: route.params?.policyID,
                        stepToOpen: '',
                    });
                },
            });
            return;
        }
        quitAndNavigateBack(dynamicBackPath);
    };

    const onButtonPress = () => {
        if (CONFIG.IS_HYBRID_APP && isClassicRedirectDismissed && !isClassicRedirectBlocked) {
            closeReactNativeApp({shouldSetNVP: false, isTrackingGPS: false});
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
            clearTwoFactorAuthData(true);
            return;
        }
        goBack();
        if (dynamicForwardPath) {
            const policyID = route.params?.policyID;
            if (policyID) {
                openLink(getXeroSetupLink(policyID), environmentURL);
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
