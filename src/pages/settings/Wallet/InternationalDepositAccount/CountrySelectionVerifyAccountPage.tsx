import React from 'react';
import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';
import ROUTES from '@src/ROUTES';

function CountrySelectionVerifyAccountPage() {
    return (
        <VerifyAccountPageBase
            navigateBackTo={ROUTES.SETTINGS_ADD_BANK_ACCOUNT.route}
            navigateForwardTo={ROUTES.SETTINGS_ADD_US_BANK_ACCOUNT}
        />
    );
}

export default CountrySelectionVerifyAccountPage;
