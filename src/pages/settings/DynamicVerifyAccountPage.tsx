import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useDynamicForwardPath from '@hooks/useDynamicForwardPath';

import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';

import React from 'react';

import VerifyAccountPageBase from './VerifyAccountPageBase';

function DynamicVerifyAccountPage() {
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.VERIFY_ACCOUNT.path);
    let forwardPath = useDynamicForwardPath(DYNAMIC_ROUTES.VERIFY_ACCOUNT.path);

    if (backPath === ROUTES.SETTINGS_WALLET) {
        forwardPath = ROUTES.SETTINGS_ENABLE_PAYMENTS.getRoute();
    }

    return (
        <VerifyAccountPageBase
            navigateBackTo={backPath}
            navigateForwardTo={forwardPath}
        />
    );
}

export default DynamicVerifyAccountPage;
