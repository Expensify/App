import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';

import ROUTES from '@src/ROUTES';

import React from 'react';

function VerifyAccountPage() {
    return (
        <VerifyAccountPageBase
            navigateBackTo={ROUTES.SETTINGS_COPILOT}
            navigateForwardTo={ROUTES.SETTINGS_ADD_DELEGATE}
        />
    );
}

export default VerifyAccountPage;
