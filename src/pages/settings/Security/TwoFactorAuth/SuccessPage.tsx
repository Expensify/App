import useOnyx from '@hooks/useOnyx';

import {shouldHideOldAppRedirect} from '@libs/TryNewDotUtils';

import {closeReactNativeApp} from '@userActions/HybridApp';
import {quitAndNavigateBack} from '@userActions/TwoFactorAuthActions';

import CONFIG from '@src/CONFIG';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import React from 'react';

import SuccessPageBase from './SuccessPageBase';

function SuccessPage() {
    const [tryNewDot, tryNewDotMetadata] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT);
    const isLoadingTryNewDot = isLoadingOnyxValue(tryNewDotMetadata);
    const isClassicRedirectBlocked = shouldHideOldAppRedirect(tryNewDot, isLoadingTryNewDot, CONFIG.IS_HYBRID_APP);
    const isClassicRedirectDismissed = tryNewDot?.classicRedirect?.dismissed;

    const goBack = () => {
        quitAndNavigateBack(ROUTES.SETTINGS_SECURITY);
    };

    const onButtonPress = () => {
        if (CONFIG.IS_HYBRID_APP && isClassicRedirectDismissed && !isClassicRedirectBlocked) {
            closeReactNativeApp({shouldSetNVP: false, isTrackingGPS: false});
            return;
        }
        goBack();
    };

    return (
        <SuccessPageBase
            onButtonPress={onButtonPress}
            onBackButtonPress={goBack}
        />
    );
}

export default SuccessPage;
