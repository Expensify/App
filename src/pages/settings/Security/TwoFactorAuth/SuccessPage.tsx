import useOnyx from '@hooks/useOnyx';

import {shouldHideOldAppRedirect} from '@libs/TryNewDotUtils';

import {closeReactNativeApp} from '@userActions/HybridApp';
import {quitAndNavigateBack} from '@userActions/TwoFactorAuthActions';

import CONFIG from '@src/CONFIG';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import React from 'react';

import SuccessPageBase from './SuccessPageBase';

function SuccessPage() {
    const [tryNewDot] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT);
    const [is2FAEnabled = false] = useOnyx(ONYXKEYS.ACCOUNT, {selector: (account) => !!account?.requiresTwoFactorAuth});
    const isClassicRedirectBlocked = shouldHideOldAppRedirect(tryNewDot, false, CONFIG.IS_HYBRID_APP);
    const isClassicRedirectDismissed = tryNewDot?.classicRedirect?.dismissed;

    const goBack = () => {
        quitAndNavigateBack(is2FAEnabled, ROUTES.SETTINGS_SECURITY.getRoute());
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
