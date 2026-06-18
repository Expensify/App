import React from 'react';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useDynamicForwardPath from '@hooks/useDynamicForwardPath';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import VerifyAccountPageBase from './VerifyAccountPageBase';

function DynamicVerifyAccountPage() {
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.VERIFY_ACCOUNT.path);
    let forwardPath = useDynamicForwardPath(DYNAMIC_ROUTES.VERIFY_ACCOUNT.path);

    if (forwardPath === DYNAMIC_ROUTES.NEW_CONTACT_METHOD_CONFIRM_MAGIC_CODE.path) {
        forwardPath = createDynamicRoute(DYNAMIC_ROUTES.NEW_CONTACT_METHOD_CONFIRM_MAGIC_CODE.path, backPath);
    } else if (backPath === ROUTES.SETTINGS_WALLET) {
        forwardPath = ROUTES.SETTINGS_ENABLE_PAYMENTS;
    } else if (!forwardPath) {
        forwardPath = backPath;
    }

    return (
        <VerifyAccountPageBase
            navigateBackTo={backPath}
            navigateForwardTo={forwardPath}
        />
    );
}

export default DynamicVerifyAccountPage;
