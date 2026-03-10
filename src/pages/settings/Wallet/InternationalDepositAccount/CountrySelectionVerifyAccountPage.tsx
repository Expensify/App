import React from 'react';
import createDynamicRoute from '@libs/Navigation/helpers/createDynamicRoute';
import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';

function CountrySelectionVerifyAccountPage() {
    return (
        <VerifyAccountPageBase
            navigateBackTo={createDynamicRoute(DYNAMIC_ROUTES.ADD_BANK_ACCOUNT.path)}
            navigateForwardTo={ROUTES.SETTINGS_ADD_US_BANK_ACCOUNT}
        />
    );
}

export default CountrySelectionVerifyAccountPage;
