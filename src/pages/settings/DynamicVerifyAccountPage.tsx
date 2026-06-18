import React from 'react';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useDynamicForwardPath from '@hooks/useDynamicForwardPath';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import isDynamicRouteSuffix from '@libs/Navigation/helpers/dynamicRoutesUtils/isDynamicRouteSuffix';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import VerifyAccountPageBase from './VerifyAccountPageBase';

function DynamicVerifyAccountPage() {
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.VERIFY_ACCOUNT.path);
    const forwardPathFromHook = useDynamicForwardPath(DYNAMIC_ROUTES.VERIFY_ACCOUNT.path);

    let navigateForwardTo: Route = backPath;

    if (forwardPathFromHook === DYNAMIC_ROUTES.NEW_CONTACT_METHOD_CONFIRM_MAGIC_CODE.path) {
        navigateForwardTo = createDynamicRoute(DYNAMIC_ROUTES.NEW_CONTACT_METHOD_CONFIRM_MAGIC_CODE.path, backPath);
    } else if (backPath === ROUTES.SETTINGS_WALLET) {
        navigateForwardTo = ROUTES.SETTINGS_ENABLE_PAYMENTS;
    } else if (forwardPathFromHook && !isDynamicRouteSuffix(forwardPathFromHook)) {
        navigateForwardTo = forwardPathFromHook;
    }

    return (
        <VerifyAccountPageBase
            navigateBackTo={backPath}
            navigateForwardTo={navigateForwardTo}
        />
    );
}

export default DynamicVerifyAccountPage;
