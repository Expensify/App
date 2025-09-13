import React from 'react';
import ROUTES from '@src/ROUTES';
import VerifyAccountPageBase from './settings/VerifyAccountPageBase';

function VerifyAccountPage() {
    return <VerifyAccountPageBase navigateForwardTo={ROUTES.HOME} />;
}

export default VerifyAccountPage;
