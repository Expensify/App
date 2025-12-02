import React from 'react';
import {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {SettingsNavigatorParamList} from '@libs/Navigation/types';
import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

type NewBankAccountVerifyAccountPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.ADD_BANK_ACCOUNT_VERIFY_ACCOUNT>;

function NewBankAccountVerifyAccountPage({route}: NewBankAccountVerifyAccountPageProps) {
    const navigateBackTo = route.params?.backToWallet ? ROUTES.SETTINGS_WALLET : undefined;
    return (
        <VerifyAccountPageBase
            navigateBackTo={navigateBackTo}
            navigateForwardTo={ROUTES.SETTINGS_ADD_BANK_ACCOUNT.route}
        />
    );
}

NewBankAccountVerifyAccountPage.displayName = 'NewBankAccountVerifyAccountPage';

export default NewBankAccountVerifyAccountPage;
