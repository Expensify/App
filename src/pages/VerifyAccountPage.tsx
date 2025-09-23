import {findFocusedRoute, useNavigationState} from '@react-navigation/native';
import React from 'react';
import getForwardToFromPath from '@libs/Navigation/helpers/getForwardToFromPath';
import ROUTES, {VERIFY_ACCOUNT} from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import VerifyAccountPageBase from './settings/VerifyAccountPageBase';

function VerifyAccountPage() {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const state = useNavigationState((state) => findFocusedRoute(state));
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
