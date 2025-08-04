import React from 'react';
import {View} from 'react-native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import variables from '@styles/variables';

function BankAccountPurposePage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <ScreenWrapper
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicator={false}
            testID={BankAccountPurposePage.displayName}
        >
            <FullPageNotFoundView>
                <HeaderWithBackButton
                    title={translate('bankAccount.addBankAccount')}
                    onBackButtonPress={() => Navigation.goBack()}
                    shouldDisplayHelpButton={false}
                />
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
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

BankAccountPurposePage.displayName = 'BankAccountPurposePage';

export default BankAccountPurposePage;
