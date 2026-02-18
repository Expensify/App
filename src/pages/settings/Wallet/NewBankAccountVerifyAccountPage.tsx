import React, {useMemo} from 'react';
import useOnyx from '@hooks/useOnyx';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getCurrentUserEmail} from '@libs/Network/NetworkStore';
import {hasActiveAdminWorkspaces} from '@libs/PolicyUtils';
import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type NewBankAccountVerifyAccountPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.ADD_BANK_ACCOUNT_VERIFY_ACCOUNT>;

function NewBankAccountVerifyAccountPage({route}: NewBankAccountVerifyAccountPageProps) {
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});

    const currentUserEmail = getCurrentUserEmail();
    const isAdmin = useMemo(() => hasActiveAdminWorkspaces(currentUserEmail ?? '', allPolicies), [currentUserEmail, allPolicies]);
    const navigateForwardTo = isAdmin ? ROUTES.SETTINGS_BANK_ACCOUNT_PURPOSE : ROUTES.SETTINGS_ADD_BANK_ACCOUNT.route;
    const navigateBackTo = route.params?.backTo ?? ROUTES.SETTINGS_WALLET;

    return (
        <VerifyAccountPageBase
            navigateBackTo={navigateBackTo}
            navigateForwardTo={navigateForwardTo}
        />
    );
}

export default NewBankAccountVerifyAccountPage;
