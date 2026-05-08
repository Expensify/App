import React from 'react';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import CopyCodesPage from './CopyCodesPage';
import EnabledPage from './EnabledPage';

function DynamicTwoFactorAuthPage() {
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.TWO_FACTOR_AUTH_ROOT.path);

    if (account?.requiresTwoFactorAuth) {
        return <EnabledPage />;
    }

    return <CopyCodesPage navigateBackTo={backPath} />;
}

export default DynamicTwoFactorAuthPage;
