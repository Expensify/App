import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import useThemeStyles from '@styles/useThemeStyles';
import * as BankAccounts from '@userActions/BankAccounts';
import * as PaymentMethods from '@userActions/PaymentMethods';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import PaymentMethodList from './PaymentMethodList';
import walletTransferPropTypes from './walletTransferPropTypes';

const propTypes = {
    /** Wallet transfer propTypes */
    walletTransfer: walletTransferPropTypes,

    ...withLocalizePropTypes,
};

const defaultProps = {
    walletTransfer: {},
};

function ChooseTransferAccountPage(props) {
    const styles = useThemeStyles();
    /**
     * Go back to transfer balance screen with the selected bank account set
     * @param {Object} event Click event object
     * @param {String} accountType of the selected account type
     * @param {Object} account of the selected account data
     */
    const selectAccountAndNavigateBack = (event, accountType, account) => {
        PaymentMethods.saveWalletTransferAccountTypeAndID(accountType, accountType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT ? account.bankAccountID : account.fundID);
        Navigation.goBack(ROUTES.SETTINGS_WALLET_TRANSFER_BALANCE);
    };

    /**
     * @param {String} paymentType
     */
    const navigateToAddPaymentMethodPage = () => {
        if (props.walletTransfer.filterPaymentMethodType === CONST.PAYMENT_METHODS.DEBIT_CARD) {
            Navigation.navigate(ROUTES.SETTINGS_ADD_DEBIT_CARD);
            return;
        }
        BankAccounts.openPersonalBankAccountSetupView();
    };

    return (
        <ScreenWrapper testID={ChooseTransferAccountPage.displayName}>
            <HeaderWithBackButton
                title={props.translate('chooseTransferAccountPage.chooseAccount')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WALLET_TRANSFER_BALANCE)}
            />
            <View style={[styles.mt6, styles.flexShrink1, styles.flexBasisAuto]}>
                <PaymentMethodList
                    onPress={selectAccountAndNavigateBack}
                    shouldShowSelectedState
                    filterType={props.walletTransfer.filterPaymentMethodType}
                    selectedMethodID={props.walletTransfer.selectedAccountID}
                    shouldShowAddPaymentMethodButton={false}
                />
            </View>
            <MenuItem
                onPress={navigateToAddPaymentMethodPage}
                title={
                    props.walletTransfer.filterPaymentMethodType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT
                        ? props.translate('paymentMethodList.addNewBankAccount')
                        : props.translate('paymentMethodList.addNewDebitCard')
                }
                icon={Expensicons.Plus}
            />
        </ScreenWrapper>
    );
}

ChooseTransferAccountPage.propTypes = propTypes;
ChooseTransferAccountPage.defaultProps = defaultProps;
ChooseTransferAccountPage.displayName = 'ChooseTransferAccountPage';

export default compose(
    withLocalize,
    withOnyx({
        walletTransfer: {
            key: ONYXKEYS.WALLET_TRANSFER,
        },
    }),
)(ChooseTransferAccountPage);
