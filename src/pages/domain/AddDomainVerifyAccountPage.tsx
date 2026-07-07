import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';

import ROUTES from '@src/ROUTES';

import React from 'react';

function AddDomainVerifyAccountPage() {
    return <VerifyAccountPageBase navigateBackTo={ROUTES.WORKSPACES_ADD_DOMAIN} />;
}

export default AddDomainVerifyAccountPage;
