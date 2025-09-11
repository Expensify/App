import React from 'react';
import Navigation from '@src/libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import VerifyAccountPageBase from './settings/VerifyAccountPageBase';

function VerifyAccountPage() {
    const activeRoute = Navigation.getActiveRoute();
    const backToRoute: Route = activeRoute.replace(/\/verify-account$/, '') as Route;
    return (
        <VerifyAccountPageBase
            navigateBackTo={backToRoute}
            navigateForwardTo={ROUTES.HOME}
        />
    );
}

export default VerifyAccountPage;
