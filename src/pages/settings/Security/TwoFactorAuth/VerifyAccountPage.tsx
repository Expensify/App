import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {TwoFactorAuthNavigatorParamList} from '@libs/Navigation/types';
import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type VerifyAccountPageProps = PlatformStackScreenProps<TwoFactorAuthNavigatorParamList, typeof SCREENS.TWO_FACTOR_AUTH.VERIFY_ACCOUNT>;

function VerifyAccountPage({route}: VerifyAccountPageProps) {
    return (
        <VerifyAccountPageBase
            navigateBackTo={route?.params?.backTo ?? ROUTES.SETTINGS_SECURITY}
            navigateForwardTo={route?.params?.forwardTo ?? ROUTES.SETTINGS_2FA_ROOT.getRoute()}
        />
    );
}

export default VerifyAccountPage;
