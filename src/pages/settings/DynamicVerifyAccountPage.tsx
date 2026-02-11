import React from 'react';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import VerifyAccountPageBase from './VerifyAccountPageBase';

function DynamicVerifyAccountPage() {
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.VERIFY_ACCOUNT.path);
    // currently, the default behavior of this component after completing verification is to navigate back
    const forwardPath = backPath;
    return (
        <VerifyAccountPageBase
            navigateBackTo={backPath}
            navigateForwardTo={forwardPath}
        />
    );
}

export default DynamicVerifyAccountPage;
