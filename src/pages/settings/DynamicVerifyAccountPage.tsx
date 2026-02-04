import React from 'react';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import VerifyAccountPageBase from './VerifyAccountPageBase';

function DynamicVerifyAccountPage() {
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.VERIFY_ACCOUNT.path);

    let forwardPath = backPath;
    if (backPath === ROUTES.SETTINGS_WALLET) {
        forwardPath = ROUTES.SETTINGS_ENABLE_PAYMENTS;
    }

    return (
        <VerifyAccountPageBase
            navigateBackTo={backPath}
            navigateForwardTo={forwardPath}
        />
    );
}

export default DynamicVerifyAccountPage;
