/**
 * Home widget that opens personal bank-account setup for a queued reimbursement.
 */
import BaseWidgetItem from '@components/BaseWidgetItem';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {openPersonalBankAccountSetupView} from '@libs/actions/BankAccounts';

import colors from '@styles/theme/colors';

import ONYXKEYS from '@src/ONYXKEYS';

import {isUserValidatedSelector} from '@selectors/Account';
import React from 'react';

function AddBankAccount() {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Bank']);
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector});
    const title = translate('homePage.timeSensitiveSection.addBankAccount.title');
    const subtitle = translate('common.wallet');
    const ctaText = translate('common.add');

    return (
        <BaseWidgetItem
            icon={icons.Bank}
            iconBackgroundColor={colors.green100}
            iconFill={colors.green500}
            title={title}
            subtitle={subtitle}
            ctaText={ctaText}
            onCtaPress={() => openPersonalBankAccountSetupView({isUserValidated})}
            buttonProps={{success: true}}
        />
    );
}

export default AddBankAccount;
