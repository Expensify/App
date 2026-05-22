import {hasSeenTourSelector} from '@selectors/Onboarding';
import React from 'react';
import BaseWidgetItem from '@components/BaseWidgetItem';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {pressLockedBankAccount} from '@libs/actions/BankAccounts';
import {navigateToConciergeChat} from '@libs/actions/Report';
import colors from '@styles/theme/colors';
import ONYXKEYS from '@src/ONYXKEYS';

type UnlockBankAccountProps = {
    /** The ID of the locked bank account */
    bankAccountID: number;

    /** The policy name — undefined means personal account (subtitle: 'Wallet') */
    policyName?: string;
};

function UnlockBankAccount({bankAccountID, policyName}: UnlockBankAccountProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['BankLock']);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const delegateAccountID = useDelegateAccountID();

    const title = policyName ? translate('homePage.timeSensitiveSection.unlockBankAccount.workspaceTitle') : translate('homePage.timeSensitiveSection.unlockBankAccount.personalTitle');

    const subtitle = policyName
        ? translate('homePage.timeSensitiveSection.unlockBankAccount.workspaceSubtitle', {policyName})
        : translate('homePage.timeSensitiveSection.unlockBankAccount.personalSubtitle');

    const handleCtaPress = () => {
        pressLockedBankAccount(bankAccountID, translate, conciergeReportID, delegateAccountID);
        navigateToConciergeChat(conciergeReportID, introSelected, currentUserAccountID, isSelfTourViewed, betas);
    };

    return (
        <BaseWidgetItem
            icon={icons.BankLock}
            iconBackgroundColor={colors.tangerine100}
            iconFill={colors.tangerine500}
            title={title}
            subtitle={subtitle}
            ctaText={translate('homePage.timeSensitiveSection.ctaFix')}
            onCtaPress={handleCtaPress}
            buttonProps={{danger: true}}
        />
    );
}

export default UnlockBankAccount;
