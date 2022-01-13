import React from 'react';
import {withOnyx} from 'react-native-onyx';
import {View} from 'react-native';
import PropTypes from 'prop-types';
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

    /** Are we loading payment methods? */
    isLoadingPaymentMethods: PropTypes.bool,

    ...withLocalizePropTypes,
};

const defaultProps = {
    walletTransfer: {},
    isLoadingPaymentMethods: false,
};

const ChooseTransferAccountPage = (props) => {
    /**
     * Go back to TransferPage with the selected bank account
     * @param {String} accountID of the selected account.
     */
    const selectAccountAndNavigateBack = (accountID) => {
        PaymentMethods.updateWalletTransferData({selectedAccountID: accountID});
        Navigation.navigate(ROUTES.SETTINGS_TRANSFER_BALANCE);
    };

    /**
     * @param {String} paymentType
     */
    const navigateToAddPaymentMethodPage = () => {
        if (props.filterType === CONST.PAYMENT_METHODS.DEBIT_CARD) {
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
                <View style={[styles.flexShrink1, styles.flexBasisAuto]}>
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
                    title={props.filterType === CONST.PAYMENT_METHODS.BANK_ACCOUNT
                        ? props.translate('paymentMethodList.addBankAccount')
                        : props.translate('paymentMethodList.addDebitCard')}
                    icon={Expensicons.Plus}
                    disabled={props.isLoadingPaymentMethods}
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
        isLoadingPaymentMethods: {
            key: ONYXKEYS.IS_LOADING_PAYMENT_METHODS,
            initWithStoredValues: false,
        },
    }),
)(ChooseTransferAccountPage);
