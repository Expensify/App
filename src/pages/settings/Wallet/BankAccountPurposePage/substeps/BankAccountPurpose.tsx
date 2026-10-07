import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import MenuItem from '@components/MenuItem';
import Text from '@components/Text';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@navigation/Navigation';

import variables from '@styles/variables';

import {openPersonalBankAccountSetupView} from '@userActions/BankAccounts';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import {isCollectingDepositAccountsSelector} from '@selectors/Policy';
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
    const [isCollectingDepositAccounts = false] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: isCollectingDepositAccountsSelector});

    // A workspace collecting deposit accounts needs the bank details its country requires, which the wallet setup does not ask for.
    const onGetReimbursedPressed = () => {
        if (isCollectingDepositAccounts) {
            Navigation.navigate(ROUTES.SETTINGS_COLLECT_DEPOSIT_ACCOUNT.getRoute());
            return;
        }
        openPersonalBankAccountSetupView({});
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
                    onPress={getReimbursedPressed}
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
