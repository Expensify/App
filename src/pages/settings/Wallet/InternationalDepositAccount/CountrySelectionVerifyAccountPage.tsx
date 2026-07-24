import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';

import ROUTES from '@src/ROUTES';

import React from 'react';

function CountrySelectionVerifyAccountPage() {
    return (
        <VerifyAccountPageBase
            navigateBackTo={ROUTES.SETTINGS_ADD_BANK_ACCOUNT.route}
            navigateForwardTo={ROUTES.SETTINGS_ADD_US_BANK_ACCOUNT.getRoute()}
        />
    );
}

export default CountrySelectionVerifyAccountPage;
