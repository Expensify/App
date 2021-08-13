import _ from 'underscore';
import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Onyx, {withOnyx} from 'react-native-onyx';
import {ScrollView} from 'react-native-gesture-handler';
import ONYXKEYS from '../../../ONYXKEYS';
import ROUTES from '../../../ROUTES';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Navigation from '../../../libs/Navigation/Navigation';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import compose from '../../../libs/compose';
import KeyboardAvoidingView from '../../../components/KeyboardAvoidingView/index';
import {
    Bank, Bolt,
} from '../../../components/Icon/Expensicons';
import MenuItem from '../../../components/MenuItem';
import CONST from '../../../CONST';
import variables from '../../../styles/variables';
import Text from '../../../components/Text';
import Button from '../../../components/Button';
import FixedFooter from '../../../components/FixedFooter';
import CurrentWalletBalance from '../../../components/CurrentWalletBalance';
import {
    userWalletPropTypes,
    bankAccountListPropTypes,
    cardListPropTypes,
    walletTransferPropTypes,
} from './paymentPropTypes';
import {transferWalletBalance} from '../../../libs/actions/PaymentMethods';
import {getPaymentMethodsList} from '../../../libs/paymentUtils';

const propTypes = {
    /** User's paypal.me username if they have one */
    payPalMeUsername: PropTypes.string,

    /** User's wallet information */
    userWallet: userWalletPropTypes,

    /** Array of bank account objects */
    bankAccountList: bankAccountListPropTypes,

    /** Array of card objects */
    cardList: cardListPropTypes,

    /** Wallet balance transfer props */
    walletTransfer: walletTransferPropTypes,

    ...withLocalizePropTypes,
};

const defaultProps = {
    userWallet: {},
    payPalMeUsername: '',
    bankAccountList: [],
    cardList: [],
    walletTransfer: {},
};
const Fee = 0.30;

class TransferBalancePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedPaymentType: CONST.WALLET.PAYMENT_TYPE.INSTANT,

            // Show loader while tranfer is in-transit
            loading: false,
        };

        this.paymentTypes = [
            {
                key: CONST.WALLET.PAYMENT_TYPE.INSTANT,
                title: this.props.translate('transferAmountPage.instant'),
                description: this.props.translate('transferAmountPage.instantSummary'),
                icon: Bolt,
            },
            {
                key: CONST.WALLET.PAYMENT_TYPE.ACH,
                title: this.props.translate('transferAmountPage.ach'),
                description: this.props.translate('transferAmountPage.achSummary'),
                icon: Bank,
            },
        ];

        Onyx.merge(ONYXKEYS.WALLET_TRANSFER, {
            transferAmount: this.props.userWallet.availableBalance - Fee,
        });
        this.transferBalance = this.transferBalance.bind(this);
    }

    /**
     * Transfer Wallet balance
     *
     */
    transferBalance() {
        this.setState({loading: true});
        transferWalletBalance().then(() => {
            this.setState({loading: false});
            Navigation.navigate(ROUTES.SETTINGS_PAYMENTS);
        });
    }

    render() {
        const paymentMethods = getPaymentMethodsList(
            this.props.bankAccountList,
            this.props.cardList,
            this.props.payPalMeUsername,
        );
        const defaultAccount = _.find(
            paymentMethods,
            method => method.id === this.props.userWallet.linkedBankAccount,
        );
        const selectAccount = this.props.walletTransfer.selectedAccountID
            ? _.find(
                paymentMethods,
                method => method.id === this.props.walletTransfer.selectedAccountID,
            )
            : defaultAccount || {};

        const transferAmount = 30 || (this.props.userWallet.availableBalance - Fee).toFixed(2);
        const canTransfer = transferAmount > Fee;
        return (
            <ScreenWrapper>
                <KeyboardAvoidingView>
                    <HeaderWithCloseButton
                        title={this.props.translate('common.transferBalance')}
                        onCloseButtonPress={() => Navigation.goBack()}
                    />
                    <View style={[styles.flex1, styles.flexBasisAuto, styles.justifyContentCenter]}>
                        <CurrentWalletBalance balanceStyles={[styles.text7XLarge]} />
                    </View>
                    <ScrollView style={styles.flexGrow0} contentContainerStyle={styles.p5}>
                        {_.map(this.paymentTypes, type => (
                            <MenuItem
                                key={type.key}
                                title={type.title}
                                description={type.description}
                                iconWidth={variables.iconSizeXLarge}
                                iconHeight={variables.iconSizeXLarge}
                                icon={type.icon}
                                success={this.state.selectedPaymentType === type.key}
                                wrapperStyle={{
                                    ...styles.mt3,
                                    ...styles.pv4,
                                    ...styles.transferBalancePayment,
                                    ...(this.state.selectedPaymentType === type.key
                                        && styles.transferBalanceSelectedPayment),
                                }}
                                // eslint-disable-next-line react/no-unused-state
                                onPress={() => this.setState({selectedPaymentType: type.key})}
                            />
                        ))}
                        <Text
                            style={[styles.pv5, styles.textStrong, styles.textLabel, styles.justifyContentStart]}
                        >
                            {this.props.translate('transferAmountPage.whichAccount')}
                        </Text>
                        <MenuItem
                            title={selectAccount.title}
                            description={selectAccount.description}
                            shouldShowRightIcon
                            iconWidth={variables.iconSizeXLarge}
                            iconHeight={variables.iconSizeXLarge}
                            icon={Bolt}
                            wrapperStyle={{
                                ...styles.mrn5,
                                ...styles.ph0,
                            }}
                            onPress={() => Navigation.navigate(ROUTES.SETTINGS_PAYMENTS_CHOOSE_TRANSFER_ACCOUNT)}
                        />
                        <Text
                            style={[
                                styles.mt5,
                                styles.mb3,
                                styles.textStrong,
                                styles.textLabel,
                                styles.justifyContentStart,
                            ]}
                        >
                            {this.props.translate('transferAmountPage.fee')}
                        </Text>
                        <Text
                            style={[styles.textLabel, styles.justifyContentStart]}
                        >
                            {`$${Fee.toFixed(2)}`}
                        </Text>
                    </ScrollView>
                    <FixedFooter style={[styles.flexGrow0]}>
                        <Button
                            success
                            pressOnEnter
                            isLoading={this.state.loading}
                            isDisabled={!canTransfer}
                            onPress={this.transferBalance}
                            text={this.props.translate(
                                'transferAmountPage.transfer',
                                {amount: canTransfer ? `$${transferAmount}` : ''},
                            )}
                        />
                    </FixedFooter>
                </KeyboardAvoidingView>
            </ScreenWrapper>
        );
    }
}

TransferBalancePage.propTypes = propTypes;
TransferBalancePage.defaultProps = defaultProps;
TransferBalancePage.displayName = 'TransferBalancePage';

export default compose(
    withLocalize,
    withOnyx({
        userWallet: {
            key: ONYXKEYS.USER_WALLET,
        },
        walletTransfer: {
            key: ONYXKEYS.WALLET_TRANSFER,
        },
        bankAccountList: {
            key: ONYXKEYS.BANK_ACCOUNT_LIST,
        },
        cardList: {
            key: ONYXKEYS.CARD_LIST,
        },
        payPalMeUsername: {
            key: ONYXKEYS.NVP_PAYPAL_ME_ADDRESS,
        },
    }),
)(TransferBalancePage);
