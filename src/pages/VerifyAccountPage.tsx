import {findFocusedRoute, useNavigationState} from '@react-navigation/native';
import React from 'react';
import getForwardToFromPath from '@libs/Navigation/helpers/getForwardToFromPath';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import VerifyAccountPageBase from './settings/VerifyAccountPageBase';

function VerifyAccountPage() {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const state = useNavigationState((state) => findFocusedRoute(state));
    const path = state?.path ?? '';

    const backTo = path ? path.replace('/verify-account', '') : ROUTES.HOME;
    const forwardTo = getForwardToFromPath(path ?? '');
    return (
        <VerifyAccountPageBase
            navigateBackTo={backTo as Route}
            navigateForwardTo={forwardTo as Route}
        />
    );
}

export default VerifyAccountPage;
