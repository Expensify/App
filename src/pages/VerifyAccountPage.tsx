import {findFocusedRoute, useNavigationState} from '@react-navigation/native';
import React from 'react';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import VerifyAccountPageBase from './settings/VerifyAccountPageBase';

function VerifyAccountPage() {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const state = useNavigationState((state) => findFocusedRoute(state));
    const activePath = state?.path ? state.path.replace('/verify-account', '') : ROUTES.HOME;
    return (
        <VerifyAccountPageBase
            navigateBackTo={activePath as Route}
            navigateForwardTo={ROUTES.HOME}
        />
    );
}

export default VerifyAccountPage;
