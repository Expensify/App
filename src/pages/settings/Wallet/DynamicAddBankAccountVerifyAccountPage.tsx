import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useOnyx from '@hooks/useOnyx';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getCurrentUserEmail} from '@libs/Network/NetworkStore';
import {hasActiveAdminWorkspaces} from '@libs/PolicyUtils';

import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React, {useMemo} from 'react';

type DynamicAddBankAccountVerifyAccountPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.DYNAMIC_ADD_BANK_ACCOUNT_VERIFY_ACCOUNT>;

function DynamicAddBankAccountVerifyAccountPage({route}: DynamicAddBankAccountVerifyAccountPageProps) {
    const {shouldSkipPurposeSelection, shouldSetUpUSBankAccount} = route.params ?? {};
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.ADD_BANK_ACCOUNT_VERIFY_ACCOUNT.path);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const currentUserEmail = getCurrentUserEmail();
    const isAdmin = useMemo(() => hasActiveAdminWorkspaces(currentUserEmail ?? '', allPolicies), [currentUserEmail, allPolicies]);
    // This forward path must agree with the validated branch of openPersonalBankAccountSetupView.
    let navigateForwardTo;
    if (shouldSetUpUSBankAccount === 'true') {
        navigateForwardTo = ROUTES.SETTINGS_ADD_US_BANK_ACCOUNT.getRoute();
    } else if (isAdmin && shouldSkipPurposeSelection !== 'true') {
        navigateForwardTo = ROUTES.SETTINGS_BANK_ACCOUNT_PURPOSE;
    } else {
        navigateForwardTo = ROUTES.SETTINGS_ADD_BANK_ACCOUNT.getRoute(backPath);
    }

    return (
        <VerifyAccountPageBase
            navigateBackTo={backPath}
            navigateForwardTo={navigateForwardTo}
        />
    );
}

export default DynamicAddBankAccountVerifyAccountPage;
