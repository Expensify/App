import React from 'react';
import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';
import ROUTES from '@src/ROUTES';

function VerifyAccountPage() {
    return (
        <VerifyAccountPageBase
            navigateBackTo={ROUTES.SETTINGS_WALLET}
            navigateForwardTo={ROUTES.SETTINGS_ENABLE_PAYMENTS}
        />
    );
}

export default VerifyAccountPage;
