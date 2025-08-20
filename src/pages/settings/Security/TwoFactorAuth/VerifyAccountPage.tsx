import React from 'react';
import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';
import ROUTES from '@src/ROUTES';

function VerifyAccountPage() {
    return (
        <VerifyAccountPageBase
            navigateBackTo={ROUTES.SETTINGS_SECURITY}
            navigateForwardTo={ROUTES.SETTINGS_2FA_ROOT.getRoute()}
        />
    );
}

export default VerifyAccountPage;
