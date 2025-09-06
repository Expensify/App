import React from 'react';
import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';
import ROUTES from '@src/ROUTES';

function VerifyAccountPage() {
    return (
        <VerifyAccountPageBase
            navigateBackTo={ROUTES.SETTINGS_WALLET}
            navigateForwardTo={ROUTES.SETTINGS_ADD_BANK_ACCOUNT.route}
        />
    );
}

export default VerifyAccountPage;
