import React, {useMemo} from 'react';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useOnyx from '@hooks/useOnyx';
import {getCurrentUserEmail} from '@libs/Network/NetworkStore';
import {hasActiveAdminWorkspaces} from '@libs/PolicyUtils';
import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';

function DynamicAddBankAccountVerifyAccountPage() {
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.ADD_BANK_ACCOUNT_VERIFY_ACCOUNT.path);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const currentUserEmail = getCurrentUserEmail();
    const isAdmin = useMemo(() => hasActiveAdminWorkspaces(currentUserEmail ?? '', allPolicies), [currentUserEmail, allPolicies]);
    const navigateForwardTo = isAdmin ? ROUTES.SETTINGS_BANK_ACCOUNT_PURPOSE : ROUTES.SETTINGS_ADD_BANK_ACCOUNT.route;

    return (
        <VerifyAccountPageBase
            navigateBackTo={backPath}
            navigateForwardTo={navigateForwardTo}
        />
    );
}

export default DynamicAddBankAccountVerifyAccountPage;
