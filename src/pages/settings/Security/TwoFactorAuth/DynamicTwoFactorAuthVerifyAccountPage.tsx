import React from 'react';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

function DynamicTwoFactorAuthVerifyAccountPage() {
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.TWO_FACTOR_AUTH_VERIFY_ACCOUNT.path);

    return (
        <VerifyAccountPageBase
            navigateBackTo={backPath}
            navigateForwardTo={createDynamicRoute(DYNAMIC_ROUTES.TWO_FACTOR_AUTH_ROOT.path, backPath)}
        />
    );
}

export default DynamicTwoFactorAuthVerifyAccountPage;
