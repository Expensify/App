import {useNavigationState} from '@react-navigation/native';
import React from 'react';
import getPathFromState from '@libs/Navigation/helpers/getPathFromState';
import ROUTES, {VERIFY_ACCOUNT} from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import VerifyAccountPageBase from './settings/VerifyAccountPageBase';

function VerifyAccountPage() {
    const path = useNavigationState((state) => getPathFromState(state));
    const backTo = path ? (path.replace(`/${VERIFY_ACCOUNT}`, '') as Route) : ROUTES.HOME;
    // currently, the default behavior of this component after completing verification is to navigate back
    const forwardTo = backTo;
    return (
        <VerifyAccountPageBase
            navigateBackTo={backTo}
            navigateForwardTo={forwardTo}
        />
    );
}

export default VerifyAccountPage;
