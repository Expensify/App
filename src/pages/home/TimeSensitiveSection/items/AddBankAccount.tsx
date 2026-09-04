/**
 * Home widget that opens personal bank-account setup for a queued reimbursement.
 */
import BaseWidgetItem from '@components/BaseWidgetItem';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {openPersonalBankAccountSetupView} from '@libs/actions/BankAccounts';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {isUserValidatedSelector} from '@selectors/Account';
import React from 'react';

function AddBankAccount() {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Bank']);
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector});

    return (
        <BaseWidgetItem
            icon={icons.Bank}
            title={translate('homePage.timeSensitiveSection.addBankAccount.title')}
            subtitle={translate('common.wallet')}
            ctaText={translate('common.add')}
            onCtaPress={() => openPersonalBankAccountSetupView({isUserValidated})}
            buttonVariant={CONST.BUTTON_VARIANT.SUCCESS}
        />
    );
}

export default AddBankAccount;
