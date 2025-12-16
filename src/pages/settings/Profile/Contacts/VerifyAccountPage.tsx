import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';
import type SCREENS from '@src/SCREENS';

type VerifyAccountPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.PROFILE.CONTACT_METHOD_VERIFY_ACCOUNT>;

function VerifyAccountPage({route}: VerifyAccountPageProps) {
    // We're moving towards removing route.params?.forwardTo and route.params?.backTo, but for now this page is used in several different flows, so it needs to stay like that.
    // TODO refactor this for 1 route per modal like src/pages/settings/Security/TwoFactorAuth/VerifyAccountPage.tsx and src/pages/settings/Security/AddDelegate/VerifyAccountPage.tsx in follow up PRs
    const navigateForwardTo = route.params?.forwardTo;
    const navigateBackTo = route.params?.backTo;

    return (
        <VerifyAccountPageBase
            navigateBackTo={navigateBackTo}
            navigateForwardTo={navigateForwardTo}
        />
    );
}

export default VerifyAccountPage;
