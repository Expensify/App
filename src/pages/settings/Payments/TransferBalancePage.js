import _ from 'underscore';
import React from 'react';
import {View, ScrollView} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import ONYXKEYS from '../../../ONYXKEYS';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Navigation from '../../../libs/Navigation/Navigation';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import compose from '../../../libs/compose';
import KeyboardAvoidingView from '../../../components/KeyboardAvoidingView';
import * as Expensicons from '../../../components/Icon/Expensicons';
import MenuItem from '../../../components/MenuItem';
import CONST from '../../../CONST';
import variables from '../../../styles/variables';
import Text from '../../../components/Text';
import Button from '../../../components/Button';
import FixedFooter from '../../../components/FixedFooter';
import CurrentWalletBalance from '../../../components/CurrentWalletBalance';
import walletTransferPropTypes from './walletTransferPropTypes';
import * as PaymentMethods from '../../../libs/actions/PaymentMethods';
import * as PaymentUtils from '../../../libs/PaymentUtils';
import userWalletPropTypes from '../../EnablePayments/userWalletPropTypes';

const propTypes = {
    /** User's wallet information */
    userWallet: userWalletPropTypes.userWallet,

    /** Array of bank account objects */
    bankAccountList: PropTypes.objectOf(PropTypes.shape({
        /** The name of the institution (bank of america, etc) */
        addressName: PropTypes.string,

        /** The masked bank account number */
        accountNumber: PropTypes.string,

        /** The bankAccountID in the bankAccounts db */
        bankAccountID: PropTypes.number,

        /** The bank account type */
        type: PropTypes.string,
    })),

    /** Array of card objects */
    cardList: PropTypes.objectOf(PropTypes.shape({
        /** The name of the institution (bank of america, etc) */
        cardName: PropTypes.string,

        /** The masked credit card number */
        cardNumber: PropTypes.string,

        /** The ID of the card in the cards DB */
        cardID: PropTypes.number,
    })),

    /** Wallet balance transfer props */
    walletTransfer: walletTransferPropTypes,

    ...withLocalizePropTypes,
};

const defaultProps = {
    userWallet: {},
    bankAccountList: {},
    cardList: {},
    walletTransfer: {},
};

class TransferBalancePage extends React.Component {
    constructor(props) {
        super(props);

        this.paymentTypes = [
            {
                key: CONST.WALLET.TRANSFER_METHOD_TYPE.INSTANT,
                title: this.props.translate('transferAmountPage.instant'),
                description: this.props.translate('transferAmountPage.instantSummary', {
                    rate: this.props.numberFormat(CONST.WALLET.TRANSFER_METHOD_TYPE_FEE.INSTANT.RATE),
                    minAmount: this.props.numberFormat(
                        CONST.WALLET.TRANSFER_METHOD_TYPE_FEE.INSTANT.MINIMUM_FEE / 100,
                        {style: 'currency', currency: 'USD'},
                    ),
                }),
                icon: Expensicons.Bolt,
                type: CONST.PAYMENT_METHODS.DEBIT_CARD,
            },
            {
                key: CONST.WALLET.TRANSFER_METHOD_TYPE.ACH,
                title: this.props.translate('transferAmountPage.ach'),
                description: this.props.translate('transferAmountPage.achSummary'),
                icon: Expensicons.Bank,
                type: CONST.PAYMENT_METHODS.BANK_ACCOUNT,
            },
        ];

        this.saveTransferAmountAndBalance = this.saveTransferAmountAndBalance.bind(this);
        this.getSelectedPaymentMethodAccount = this.getSelectedPaymentMethodAccount.bind(this);

        const selectedAccount = this.getSelectedPaymentMethodAccount();
        PaymentMethods.saveWalletTransferAccountAndResetData(selectedAccount ? selectedAccount.id : '');
    }

    /**
     * Get the selected/default payment method account for wallet transfer
     * @returns {Object|undefined}
     */
    getSelectedPaymentMethodAccount() {
        const paymentMethods = PaymentUtils.formatPaymentMethods(this.props.bankAccountList, this.props.cardList, '', this.props.userWallet);
        const accountID = this.props.walletTransfer.selectedAccountID || lodashGet(this.props, 'userWallet.walletLinkedAccountID', '');
        return _.find(paymentMethods, method => method.methodID === accountID);
    }

    /**
     * @param {Number} transferAmount
     * @param {Object} selectedAccount
     */
    saveTransferAmountAndBalance(transferAmount, selectedAccount) {
        PaymentMethods.saveWalletTransferAmount(transferAmount);
        PaymentMethods.transferWalletBalance(selectedAccount);
    }

    render() {
        const selectedAccount = this.getSelectedPaymentMethodAccount();
        const selectedPaymentType = selectedAccount && selectedAccount.type === CONST.PAYMENT_METHODS.BANK_ACCOUNT
            ? CONST.WALLET.TRANSFER_METHOD_TYPE.ACH
            : CONST.WALLET.TRANSFER_METHOD_TYPE.INSTANT;

        const calculatedFee = PaymentUtils.calculateWalletTransferBalanceFee(this.props.userWallet.currentBalance, selectedPaymentType);
        const transferAmount = this.props.userWallet.currentBalance - calculatedFee;
        const canTransfer = transferAmount > 0;
        const isButtonDisabled = !canTransfer || !selectedAccount;

        return (
            <ScreenWrapper>
                <KeyboardAvoidingView>
                    <HeaderWithCloseButton
                        title={this.props.translate('common.transferBalance')}
                        shouldShowBackButton
                        onBackButtonPress={() => Navigation.goBack()}
                        onCloseButtonPress={() => Navigation.dismissModal(true)}
                    />
                    <View style={[styles.flex1, styles.flexBasisAuto, styles.justifyContentCenter]}>
                        <CurrentWalletBalance balanceStyles={[styles.transferBalanceBalance]} />
                    </View>
                    <ScrollView style={styles.flexGrow0} contentContainerStyle={styles.p5}>
                        {_.map(this.paymentTypes, paymentType => (
                            <MenuItem
                                key={paymentType.key}
                                title={paymentType.title}
                                description={paymentType.description}
                                iconWidth={variables.iconSizeXLarge}
                                iconHeight={variables.iconSizeXLarge}
                                icon={paymentType.icon}
                                success={selectedPaymentType === paymentType.key}
                                wrapperStyle={{
                                    ...styles.mt3,
                                    ...styles.pv4,
                                    ...styles.transferBalancePayment,
                                    ...(selectedPaymentType === paymentType.key
                                        && styles.transferBalanceSelectedPayment),
                                }}
                            />
                        ))}
                        <Text
                            style={[styles.pv5, styles.textStrong, styles.textLabel, styles.justifyContentStart]}
                        >
                            {this.props.translate('transferAmountPage.whichAccount')}
                        </Text>
                        {Boolean(selectedAccount)
                            && (
                                <MenuItem
                                    title={selectedAccount.title}
                                    description={selectedAccount.description}
                                    shouldShowRightIcon
                                    iconWidth={selectedAccount.iconSize}
                                    iconHeight={selectedAccount.iconSize}
                                    icon={selectedAccount.icon}
                                    wrapperStyle={{
                                        ...styles.mrn5,
                                        ...styles.ph0,
                                    }}
                                />
                            )}
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
                            {this.props.numberFormat(
                                calculatedFee / 100,
                                {style: 'currency', currency: 'USD'},
                            )}
                        </Text>
                    </ScrollView>
                    <FixedFooter style={[styles.flexGrow0]}>
                        <Button
                            success
                            pressOnEnter
                            isLoading={this.props.walletTransfer.loading}
                            isDisabled={isButtonDisabled}
                            onPress={() => this.saveTransferAmountAndBalance(transferAmount, selectedAccount)}
                            text={this.props.translate(
                                'transferAmountPage.transfer',
                                {
                                    amount: canTransfer
                                        ? this.props.numberFormat(
                                            transferAmount / 100,
                                            {style: 'currency', currency: 'USD'},
                                        ) : '',
                                },
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
    }),
)(TransferBalancePage);
