import useDynamicBackPath from '@hooks/useDynamicBackPath';

import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';

import {DYNAMIC_ROUTES} from '@src/ROUTES';

import React from 'react';

function DynamicReimbursementAccountVerifyAccountPage() {
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.BANK_ACCOUNT_VERIFY_ACCOUNT.path);

    return <VerifyAccountPageBase navigateBackTo={backPath} />;
}

export default DynamicReimbursementAccountVerifyAccountPage;
