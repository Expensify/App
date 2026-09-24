import BaseWidgetItem from '@components/BaseWidgetItem';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {openPersonalBankAccountSetupView} from '@libs/actions/BankAccounts';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {isUserValidatedSelector} from '@selectors/Account';
import React from 'react';

function AddDepositAccount() {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Bank']);
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector});

    return (
        <BaseWidgetItem
            icon={icons.Bank}
            title={translate('homePage.timeSensitiveSection.addDepositAccount.title')}
            subtitle={translate('common.wallet')}
            ctaText={translate('homePage.timeSensitiveSection.ctaFix')}
            onCtaPress={() => openPersonalBankAccountSetupView({isUserValidated})}
            buttonVariant={CONST.BUTTON_VARIANT.SUCCESS}
        />
    );
}

export default AddDepositAccount;
