import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import MenuItem from '@components/MenuItem';
import Text from '@components/Text';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWalletPersonalBankAccountSetup from '@hooks/useWalletPersonalBankAccountSetup';

import variables from '@styles/variables';

import {openWalletPersonalBankAccountSetup} from '@userActions/BankAccounts';

import React from 'react';
import {View} from 'react-native';

type BankAccountPurposeProps = {
    /** Callback to call when the user selects a purpose */
    showCountrySelectionStep: () => void;
};

function BankAccountPurpose({showCountrySelectionStep}: BankAccountPurposeProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['BankCoin', 'WalletAlt2']);
    const walletPersonalBankAccountSetup = useWalletPersonalBankAccountSetup();

    if (walletPersonalBankAccountSetup.isLoading) {
        return <FullScreenLoadingIndicator />;
    }

    const openPersonalSetup = () => {
        openWalletPersonalBankAccountSetup({
            personalBankAccount: walletPersonalBankAccountSetup.personalBankAccount,
            personalDraft: walletPersonalBankAccountSetup.personalDraft,
            internationalDraft: walletPersonalBankAccountSetup.internationalDraft,
        });
    };

    return (
        <FullPageOfflineBlockingView>
            <View style={styles.mh5}>
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mb6]}>{translate('bankAccount.bankAccountPurposeTitle')}</Text>
                <MenuItem
                    icon={illustrations.WalletAlt2}
                    title={translate('bankAccount.getReimbursed')}
                    description={translate('bankAccount.getReimbursedDescription')}
                    shouldShowRightIcon
                    onPress={openPersonalSetup}
                    displayInDefaultIconColor
                    iconStyles={[styles.ml3, styles.mr2]}
                    iconWidth={variables.menuIconSize}
                    iconHeight={variables.menuIconSize}
                    wrapperStyle={styles.purposeMenuItem}
                />
                <MenuItem
                    icon={illustrations.BankCoin}
                    title={translate('bankAccount.makePayments')}
                    description={translate('bankAccount.makePaymentsDescription')}
                    shouldShowRightIcon
                    onPress={showCountrySelectionStep}
                    displayInDefaultIconColor
                    iconStyles={[styles.ml3, styles.mr2]}
                    iconWidth={variables.menuIconSize}
                    iconHeight={variables.menuIconSize}
                    wrapperStyle={styles.purposeMenuItem}
                />
            </View>
        </FullPageOfflineBlockingView>
    );
}

BankAccountPurpose.displayName = 'BankAccountPurpose';

export default BankAccountPurpose;
