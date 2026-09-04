import Section from '@components/Section';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import PaymentMethodList from '@pages/settings/Wallet/PaymentMethodList';

import ONYXKEYS from '@src/ONYXKEYS';
import type {BankAccountList} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

import React from 'react';

import useBankAccountRowPress from './useBankAccountRowPress';
import useBankAccountThreeDotsMenu from './useBankAccountThreeDotsMenu';
import useWalletSectionIllustration from './useWalletSectionIllustration';

function WalletBankAccountsSection() {
    const [bankAccountList = getEmptyObject<BankAccountList>()] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const walletIllustration = useWalletSectionIllustration();
    const {onBankAccountRowPress, onAddBankAccountPress} = useBankAccountRowPress(bankAccountList, allPolicies);
    const {threeDotsMenuItems, onThreeDotsMenuPress} = useBankAccountThreeDotsMenu(bankAccountList, allPolicies);

    return (
        <Section
            subtitle={translate('walletPage.addBankAccountToSendAndReceive')}
            title={translate('common.bankAccounts')}
            isCentralPane
            subtitleMuted
            titleStyles={styles.accountSettingsSectionTitle}
            illustrationContainerStyle={styles.cardSectionIllustrationContainer}
            illustrationBackgroundColor="#411103"
            {...walletIllustration}
        >
            <PaymentMethodList
                onPress={onBankAccountRowPress}
                onAddBankAccountPress={onAddBankAccountPress}
                onThreeDotsMenuPress={onThreeDotsMenuPress}
                style={[styles.mt5, [shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8]]}
                listItemStyle={shouldUseNarrowLayout ? styles.ph5 : styles.ph8}
                shouldShowBankAccountSections
                shouldShowConnectionStatus
                threeDotsMenuItems={threeDotsMenuItems}
            />
        </Section>
    );
}

export default WalletBankAccountsSection;
