import {findFocusedRoute, useNavigationState} from '@react-navigation/native';
import React from 'react';
import getForwardToFromPath from '@libs/Navigation/helpers/getForwardToFromPath';
import ROUTES, {VERIFY_ACCOUNT} from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import VerifyAccountPageBase from './settings/VerifyAccountPageBase';

function VerifyAccountPage() {
    const state = useNavigationState((focusedRoute) => findFocusedRoute(focusedRoute));
    const path = state?.path ?? '';

    const backTo = path ? (path.replace(`/${VERIFY_ACCOUNT}`, '') as Route) : ROUTES.HOME;
    const forwardTo = getForwardToFromPath(path ?? '');
    return (
        <VerifyAccountPageBase
            navigateBackTo={backTo}
            navigateForwardTo={forwardTo}
        />
    );
}

export default VerifyAccountPage;
