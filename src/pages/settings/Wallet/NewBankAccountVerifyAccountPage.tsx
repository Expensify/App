import React from 'react';
import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';
import ROUTES from '@src/ROUTES';

function NewBankAccountVerifyAccountPage() {
    return (
        <VerifyAccountPageBase
            navigateBackTo={ROUTES.SETTINGS_WALLET}
            navigateForwardTo={ROUTES.SETTINGS_BANK_ACCOUNT_PURPOSE}
        />
    );
}

NewBankAccountVerifyAccountPage.displayName = 'NewBankAccountVerifyAccountPage';

export default NewBankAccountVerifyAccountPage;
