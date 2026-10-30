import BaseWidgetItem from '@components/BaseWidgetItem';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import {navigateToBankAccountRoute} from '@libs/actions/ReimbursementAccount';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';

type ValidateBankAccountProps = {
    /** The ID of the bank account waiting on its test transactions */
    bankAccountID: number;

    /** The workspace the account reimburses from — undefined means the account is opened from the Wallet */
    policyID?: string;

    /** The policy name — undefined means the account is opened from the Wallet (subtitle: 'Wallet') */
    policyName?: string;
};

/** Home time-sensitive row that sends the user to the test transaction step of a PENDING bank account */
function ValidateBankAccount({bankAccountID, policyID, policyName}: ValidateBankAccountProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Bank']);

    const subtitle = policyName
        ? translate('homePage.timeSensitiveSection.validateBankAccount.workspaceSubtitle', {policyName})
        : translate('homePage.timeSensitiveSection.validateBankAccount.personalSubtitle');

    const navigateToTestTransactionStep = () => {
        // Opening by policyID lets the bank account page redirect a USD PENDING account straight to the test transaction step
        if (policyID) {
            navigateToBankAccountRoute({policyID, backTo: ROUTES.HOME});
            return;
        }
        navigateToBankAccountRoute({bankAccountID, backTo: ROUTES.HOME});
    };

    return (
        <BaseWidgetItem
            icon={icons.Bank}
            title={translate('homePage.timeSensitiveSection.validateBankAccount.title')}
            subtitle={subtitle}
            ctaText={translate('common.validate')}
            onCtaPress={navigateToTestTransactionStep}
            buttonVariant={CONST.BUTTON_VARIANT.SUCCESS}
        />
    );
}

export default ValidateBankAccount;
