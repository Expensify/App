import React from 'react';
import {withOnyx} from 'react-native-onyx';
import {View} from 'react-native';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Navigation from '../../../libs/Navigation/Navigation';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import KeyboardAvoidingView from '../../../components/KeyboardAvoidingView';
import CONST from '../../../CONST';
import PaymentMethodList from './PaymentMethodList';
import * as PaymentMethods from '../../../libs/actions/PaymentMethods';
import ROUTES from '../../../ROUTES';
import MenuItem from '../../../components/MenuItem';
import * as Expensicons from '../../../components/Icon/Expensicons';
import compose from '../../../libs/compose';
import ONYXKEYS from '../../../ONYXKEYS';
import walletTransferPropTypes from './walletTransferPropTypes';
import styles from '../../../styles/styles';

const propTypes = {
    /** Wallet transfer propTypes */
    walletTransfer: walletTransferPropTypes,

    ...withLocalizePropTypes,
};

const defaultProps = {
    walletTransfer: {},
};

const ChooseTransferAccountPage = (props) => {
    /**
     * Go back to transfer balance screen with the selected bank account set
     * @param {Object} event Click event object
     * @param {String} accountType of the selected account type
     * @param {Object} account of the selected account data
     */
    const selectAccountAndNavigateBack = (event, accountType, account) => {
        PaymentMethods.saveWalletTransferAccountTypeAndID(
            accountType,
            accountType === CONST.PAYMENT_METHODS.BANK_ACCOUNT
                ? account.bankAccountID
                : account.fundID,
        );
        Navigation.navigate(ROUTES.SETTINGS_PAYMENTS_TRANSFER_BALANCE);
    };

    /**
     * @param {String} paymentType
     */
    const navigateToAddPaymentMethodPage = () => {
        if (props.walletTransfer.filterPaymentMethodType === CONST.PAYMENT_METHODS.DEBIT_CARD) {
            Navigation.navigate(ROUTES.SETTINGS_ADD_DEBIT_CARD);
            return;
        }
        Navigation.navigate(ROUTES.SETTINGS_ADD_BANK_ACCOUNT);
    };

    return (
        <ScreenWrapper>
            <KeyboardAvoidingView>
                <HeaderWithCloseButton
                    title={props.translate('chooseTransferAccountPage.chooseAccount')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.goBack()}
                    onCloseButtonPress={() => Navigation.dismissModal()}
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
                    title={props.walletTransfer.filterPaymentMethodType === CONST.PAYMENT_METHODS.BANK_ACCOUNT
                        ? props.translate('paymentMethodList.addNewBankAccount')
                        : props.translate('paymentMethodList.addNewDebitCard')}
                    icon={Expensicons.Plus}
                />
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
};

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
