import React from 'react';
import {View} from 'react-native';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import * as Illustrations from '@components/Icon/Illustrations';
import MenuItem from '@components/MenuItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';

function BankAccountPurpose() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <FullPageOfflineBlockingView>
            <View style={styles.m5}>
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mb6]}>{translate('bankAccount.bankAccountPurposeTitle')}</Text>
                <MenuItem
                    icon={Illustrations.WalletAlt2}
                    title={translate('bankAccount.getReimbursed')}
                    description={translate('bankAccount.getReimbursedDescription')}
                    shouldShowRightIcon
                    onPress={() => {}}
                    displayInDefaultIconColor
                    iconStyles={[styles.ml3, styles.mr2]}
                    iconWidth={variables.menuIconSize}
                    iconHeight={variables.menuIconSize}
                    wrapperStyle={styles.purposeMenuItem}
                />
                <MenuItem
                    icon={Illustrations.BankCoin}
                    title={translate('bankAccount.makePayments')}
                    description={translate('bankAccount.makePaymentsDescription')}
                    shouldShowRightIcon
                    onPress={() => {}}
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
