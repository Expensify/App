import React from 'react';
import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';
import ROUTES from '@src/ROUTES';

function AddDomainVerifyAccountPage() {
    return <VerifyAccountPageBase navigateBackTo={ROUTES.WORKSPACES_ADD_DOMAIN} />;
}

export default AddDomainVerifyAccountPage;
