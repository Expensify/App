import React from 'react';
import type {GestureResponderEvent} from 'react-native';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as BankAccounts from '@userActions/BankAccounts';
import * as PaymentMethods from '@userActions/PaymentMethods';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {AccountData, WalletTransfer} from '@src/types/onyx';
import PaymentMethodList from './PaymentMethodList';

type ChooseTransferAccountPageOnyxProps = {
    /** Wallet transfer propTypes */
    walletTransfer: OnyxEntry<WalletTransfer>;
};

type ChooseTransferAccountPageProps = ChooseTransferAccountPageOnyxProps;

function ChooseTransferAccountPage({walletTransfer = {}}: ChooseTransferAccountPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    /**
     * Go back to transfer balance screen with the selected bank account set
     * @param event Click event object
     * @param accountType of the selected account type
     * @param account of the selected account data
     */
    const selectAccountAndNavigateBack = (event?: GestureResponderEvent | KeyboardEvent, accountType?: string, account?: AccountData) => {
        PaymentMethods.saveWalletTransferAccountTypeAndID(
            accountType ?? '',
            (accountType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT ? account?.bankAccountID?.toString() : account?.fundID?.toString()) ?? '',
        );
        Navigation.goBack(ROUTES.SETTINGS_WALLET_TRANSFER_BALANCE);
    };

    const navigateToAddPaymentMethodPage = () => {
        if (walletTransfer?.filterPaymentMethodType === CONST.PAYMENT_METHODS.DEBIT_CARD) {
            Navigation.navigate(ROUTES.SETTINGS_ADD_DEBIT_CARD);
            return;
        }
        BankAccounts.openPersonalBankAccountSetupView();
    };

    return (
        <ScreenWrapper testID={ChooseTransferAccountPage.displayName}>
            <HeaderWithBackButton
                title={translate('chooseTransferAccountPage.chooseAccount')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WALLET_TRANSFER_BALANCE)}
            />
            <View style={[styles.mt3, styles.flexShrink1, styles.flexBasisAuto]}>
                <PaymentMethodList
                    onPress={selectAccountAndNavigateBack}
                    shouldShowSelectedState
                    filterType={walletTransfer?.filterPaymentMethodType}
                    selectedMethodID={walletTransfer?.selectedAccountID}
                    shouldShowAddPaymentMethodButton={false}
                />
            </View>
            <MenuItem
                onPress={navigateToAddPaymentMethodPage}
                title={
                    walletTransfer?.filterPaymentMethodType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT
                        ? translate('paymentMethodList.addNewBankAccount')
                        : translate('paymentMethodList.addNewDebitCard')
                }
                icon={Expensicons.Plus}
            />
        </ScreenWrapper>
    );
}

ChooseTransferAccountPage.displayName = 'ChooseTransferAccountPage';

export default withOnyx<ChooseTransferAccountPageProps, ChooseTransferAccountPageOnyxProps>({
    walletTransfer: {
        key: ONYXKEYS.WALLET_TRANSFER,
    },
})(ChooseTransferAccountPage);
