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
import {DYNAMIC_ROUTES} from '@src/ROUTES';
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
