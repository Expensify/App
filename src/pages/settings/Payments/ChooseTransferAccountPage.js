import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import ROUTES from '../../../ROUTES';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Navigation from '../../../libs/Navigation/Navigation';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import KeyboardAvoidingView from '../../../components/KeyboardAvoidingView/index';
import ONYXKEYS from '../../../ONYXKEYS';
import compose from '../../../libs/compose';
import * as paymentPropTypes from './paymentPropTypes';
import * as PaymentMethods from '../../../libs/actions/PaymentMethods';
import CONST from '../../../CONST';
import AddPaymentMethodMenu from '../../../components/AddPaymentMethodMenu';
import SelectablePaymentMethodList from './SelectablePaymentMethodList';

const propTypes = {
    /** Wallet transfer propTypes */
    walletTransfer: paymentPropTypes.walletTransferPropTypes,

    ...withLocalizePropTypes,
};

const defaultProps = {
    walletTransfer: {},
};

class ChooseTransferAccountPage extends React.Component {
    constructor(props) {
        super(props);
        this.paymentMethodSelected = this.selectAccountAndNavigateBack.bind(this);
        this.navigateToAddPaymentMethod = this.navigateToAddPaymentMethod.bind(this);
    }

    /**
     * Navigate to the appropriate payment method type addition screen
     */
    navigateToAddPaymentMethod() {
        if (this.props.walletTransfer.filterPaymentMethodType === CONST.PAYMENT_METHODS.PAYPAL) {
            Navigation.navigate(ROUTES.SETTINGS_ADD_PAYPAL_ME);
        }

        if (this.props.walletTransfer.filterPaymentMethodType === CONST.PAYMENT_METHODS.DEBIT_CARD) {
            Navigation.navigate(ROUTES.SETTINGS_ADD_DEBIT_CARD);
        }

        if (this.props.walletTransfer.filterPaymentMethodType === CONST.PAYMENT_METHODS.BANK_ACCOUNT) {
            Navigation.navigate(ROUTES.SETTINGS_ADD_BANK_ACCOUNT);
        }
    }

    /**
     * Go back to TransferPage with the selected bank account
     * @param {String} accountID of the selected account.
     */
    selectAccountAndNavigateBack(accountID) {
        PaymentMethods.updateWalletTransferData({selectedAccountID: accountID});
        Navigation.navigate(ROUTES.SETTINGS_TRANSFER_BALANCE);
    }

    render() {
        return (
            <ScreenWrapper>
                <KeyboardAvoidingView>
                    <HeaderWithCloseButton
                        title={this.props.translate('chooseTransferAccountPage.chooseAccount')}
                        shouldShowBackButton
                        onBackButtonPress={() => Navigation.goBack()}
                        onCloseButtonPress={() => Navigation.dismissModal()}
                    />
                    <View style={[styles.pv5]}>
                        <SelectablePaymentMethodList
                            onPress={this.selectAccountAndNavigateBack}
                            selectedAccountID={this.props.walletTransfer.selectedAccountID}
                            filterType={this.props.walletTransfer.filterPaymentMethodType}
                        />
                        <AddPaymentMethodMenu filterType={this.props.walletTransfer.filterPaymentMethodType} />
                    </View>
                </KeyboardAvoidingView>
            </ScreenWrapper>
        );
    }
}

ChooseTransferAccountPage.propTypes = propTypes;
ChooseTransferAccountPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        walletTransfer: {
            key: ONYXKEYS.WALLET_TRANSFER,
        },
    }),
)(ChooseTransferAccountPage);
