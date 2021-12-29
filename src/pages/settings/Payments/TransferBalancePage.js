import _ from 'underscore';
import React from 'react';
import {View, ScrollView} from 'react-native';
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
import ExpensifyText from '../../../components/ExpensifyText';
import Button from '../../../components/Button';
import FixedFooter from '../../../components/FixedFooter';
import CurrentWalletBalance from '../../../components/CurrentWalletBalance';
import * as paymentPropTypes from './paymentPropTypes';
import * as PaymentMethods from '../../../libs/actions/PaymentMethods';
import PaymentUtils from '../../../libs/PaymentUtils';
import userWalletPropTypes from '../../EnablePayments/userWalletPropTypes';

const propTypes = {
    /** User's wallet information */
    userWallet: userWalletPropTypes.userWallet,

    /** Array of bank account objects */
    bankAccountList: paymentPropTypes.bankAccountListPropTypes,

    /** Array of card objects */
    cardList: paymentPropTypes.cardListPropTypes,

    /** Wallet balance transfer props */
    walletTransfer: paymentPropTypes.walletTransferPropTypes,

    ...withLocalizePropTypes,
};

const defaultProps = {
    userWallet: {},
    bankAccountList: [],
    cardList: [],
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
                    amount: this.props.numberFormat(
                        0.25,
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

        this.transferBalance = this.transferBalance.bind(this);

        const selectedAccount = this.getSelectedAccount();
        PaymentMethods.saveWalletTransferAccount(selectedAccount ? selectedAccount.id : '');
    }

    /**
     * Get the selected/default Account for wallet tsransfer
     * @returns {Object|undefined}
     */
    getSelectedAccount() {
        const paymentMethods = PaymentUtils.getPaymentMethods(
            this.props.bankAccountList,
            this.props.cardList,
        );

        const defaultAccount = _.find(
            paymentMethods,
            method => method.id === lodashGet(this.props, 'userWallet.walletLinkedAccountID', ''),
        );
        const selectedAccount = this.props.walletTransfer.selectedAccountID
            ? _.find(
                paymentMethods,
                method => method.id === this.props.walletTransfer.selectedAccountID,
            )
            : defaultAccount;

        return selectedAccount;
    }

    /**
     * Transfer Wallet balance
     * @param {PaymentMethod} selectedAccount
     */
    transferBalance(selectedAccount) {
        if (!selectedAccount) {
            return;
        }
        PaymentMethods.transferWalletBalance(selectedAccount);
    }

    render() {
        const selectedAccount = this.getSelectedAccount();
        const selectedPaymentType = selectedAccount && selectedAccount.type === CONST.PAYMENT_METHODS.BANK_ACCOUNT
            ? CONST.WALLET.TRANSFER_METHOD_TYPE.ACH
            : CONST.WALLET.TRANSFER_METHOD_TYPE.INSTANT;

        const transferAmount = PaymentUtils.getWalletTransferAmount(this.props.userWallet.currentBalance).toFixed(2);
        const canTransfer = transferAmount > CONST.WALLET.TRANSFER_BALANCE_FEE;
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
                        <ExpensifyText
                            style={[styles.pv5, styles.textStrong, styles.textLabel, styles.justifyContentStart]}
                        >
                            {this.props.translate('transferAmountPage.whichAccount')}
                        </ExpensifyText>
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
                        <ExpensifyText
                            style={[
                                styles.mt5,
                                styles.mb3,
                                styles.textStrong,
                                styles.textLabel,
                                styles.justifyContentStart,
                            ]}
                        >
                            {this.props.translate('transferAmountPage.fee')}
                        </ExpensifyText>
                        <ExpensifyText
                            style={[styles.textLabel, styles.justifyContentStart]}
                        >
                            {this.props.numberFormat(
                                CONST.WALLET.TRANSFER_BALANCE_FEE,
                                {style: 'currency', currency: 'USD'},
                            )}
                        </ExpensifyText>
                    </ScrollView>
                    <FixedFooter style={[styles.flexGrow0]}>
                        <Button
                            success
                            pressOnEnter
                            isLoading={this.props.walletTransfer.loading}
                            isDisabled={isButtonDisabled}
                            onPress={this.transferBalance}
                            text={this.props.translate(
                                'transferAmountPage.transfer',
                                {
                                    amount: canTransfer
                                        ? this.props.numberFormat(
                                            transferAmount,
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
