import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type NewBankAccountVerifyAccountPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.ADD_BANK_ACCOUNT_VERIFY_ACCOUNT>;

function NewBankAccountVerifyAccountPage({route}: NewBankAccountVerifyAccountPageProps) {
    const navigateBackTo = route.params?.backTo ?? ROUTES.SETTINGS_WALLET;
    return (
        <VerifyAccountPageBase
            navigateBackTo={navigateBackTo}
            navigateForwardTo={ROUTES.SETTINGS_ADD_BANK_ACCOUNT.route}
        />
    );
}

export default NewBankAccountVerifyAccountPage;
