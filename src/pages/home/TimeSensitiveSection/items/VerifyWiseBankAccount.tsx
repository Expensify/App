import BaseWidgetItem from '@components/BaseWidgetItem';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import navigateToWiseMoreInfoNeeded from '@libs/Navigation/helpers/navigateToWiseMoreInfoNeeded';

import CONST from '@src/CONST';

import React from 'react';

/**
 * The Home time-sensitive task for a bank account Wise asked for more info on.
 */
type VerifyWiseBankAccountProps = {
    /** The bank account Wise asked for more info on */
    bankAccountID: number;

    bankAccountLastFour: string;
};

/** Asks the admin to send Wise the info it needs before global reimbursements can be enabled on the bank account */
function VerifyWiseBankAccount({bankAccountID, bankAccountLastFour}: VerifyWiseBankAccountProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['GlobeWithCard']);

    return (
        <BaseWidgetItem
            icon={icons.GlobeWithCard}
            title={translate('homePage.timeSensitiveSection.verifyWiseBankAccount.title')}
            subtitle={translate('homePage.timeSensitiveSection.verifyWiseBankAccount.subtitle', {bankAccountLastFour})}
            ctaText={translate('homePage.forYouSection.begin')}
            onCtaPress={() => navigateToWiseMoreInfoNeeded(bankAccountID)}
            buttonVariant={CONST.BUTTON_VARIANT.SUCCESS}
        />
    );
}

export default VerifyWiseBankAccount;
