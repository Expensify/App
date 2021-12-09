import _ from 'underscore';
import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import {ScrollView} from 'react-native-gesture-handler';
import lodashGet from 'lodash/get';
import ONYXKEYS from '../../../ONYXKEYS';
import ROUTES from '../../../ROUTES';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Navigation from '../../../libs/Navigation/Navigation';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import compose from '../../../libs/compose';
import KeyboardAvoidingView from '../../../components/KeyboardAvoidingView/index';
import * as Expensicons from '../../../components/Icon/Expensicons';
import MenuItem from '../../../components/MenuItem';
import CONST from '../../../CONST';
import variables from '../../../styles/variables';
import ExpensifyText from '../../../components/ExpensifyText';
import ExpensifyButton from '../../../components/ExpensifyButton';
import FixedFooter from '../../../components/FixedFooter';
import CurrentWalletBalance from '../../../components/CurrentWalletBalance';
import * as paymentPropTypes from './paymentPropTypes';
import * as PaymentMethods from '../../../libs/actions/PaymentMethods';
import * as PaymentUtils from '../../../libs/PaymentUtils';

const propTypes = {
    /** User's wallet information */
    userWallet: paymentPropTypes.userWalletPropTypes,

    /** Array of bank account objects */
    bankAccountList: paymentPropTypes.bankAccountListPropTypes,

    /** Array of card objects */
    cardList: paymentPropTypes.cardListPropTypes,

    /** Wallet balance transfer props */
    walletTransfer: paymentPropTypes.walletTransferPropTypes,

    ...withLocalizePropTypes,
};

const defaultProps = {
    userWallet: {
        walletLinkedAccount: {},
    },
    bankAccountList: [],
    cardList: [],
    walletTransfer: {},
};
const Fee = 0.30;

class TransferBalancePage extends React.Component {
    constructor(props) {
        super(props);

        this.paymentTypes = [
            {
                key: CONST.WALLET.PAYMENT_TYPE.INSTANT,
                title: this.props.translate('transferAmountPage.instant'),
                description: this.props.translate('transferAmountPage.instantSummary', {
                    amount: this.props.numberFormat(
                        0.25,
                        {style: 'currency', currency: 'USD'},
                    ),
                }),
                icon: Expensicons.Bolt,
                type: CONST.WALLET.PAYMENT_METHOD_TYPE.CARD,
            },
            {
                key: CONST.WALLET.PAYMENT_TYPE.ACH,
                title: this.props.translate('transferAmountPage.ach'),
                description: this.props.translate('transferAmountPage.achSummary'),
                icon: Expensicons.Bank,
                type: CONST.WALLET.PAYMENT_METHOD_TYPE.BANK,
            },
        ];
        PaymentMethods.startWalletTransfer(this.props.userWallet.currentBalance - Fee);
        this.transferBalance = this.transferBalance.bind(this);
    }

    /**
     * Transfer Wallet balance
     * @param {Object} selectedAccount
     */
    transferBalance(selectedAccount) {
        if (!selectedAccount) {
            return;
        }
        PaymentMethods.transferWalletBalance(selectedAccount);
    }

    render() {
        const paymentMethods = PaymentUtils.getPaymentMethodsList(
            this.props.bankAccountList,
            this.props.cardList,
        );
        const defaultAccount = _.find(
            paymentMethods,
            method => method.id === lodashGet(this.props, 'userWallet.walletLinkedAccountID', ''),
        );
        const selectAccount = this.props.walletTransfer.selectedAccountID
            ? _.find(
                paymentMethods,
                method => method.id === this.props.walletTransfer.selectedAccountID,
            )
            : defaultAccount;

        const selectedPaymentType = selectAccount && selectAccount.type === CONST.WALLET.PAYMENT_METHOD_TYPE.BANK ? CONST.WALLET.PAYMENT_TYPE.ACH : CONST.WALLET.PAYMENT_TYPE.INSTANT;
        const transferAmount = (this.props.userWallet.currentBalance - Fee).toFixed(2);
        const canTransfer = transferAmount > Fee;
        const isButtonDisabled = !canTransfer || !selectAccount;

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
                        <CurrentWalletBalance balanceStyles={[styles.text7XLarge]} />
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
                                // eslint-disable-next-line react/no-unused-state
                                onPress={() => {
                                    PaymentMethods.updateWalletTransferData({filterPaymentMethodType: paymentType.type});
                                    Navigation.navigate(ROUTES.SETTINGS_PAYMENTS_CHOOSE_TRANSFER_ACCOUNT);
                                }}
                            />
                        ))}
                        <ExpensifyText
                            style={[styles.pv5, styles.textStrong, styles.textLabel, styles.justifyContentStart]}
                        >
                            {this.props.translate('transferAmountPage.whichAccount')}
                        </ExpensifyText>
                        {!!selectAccount
                            && (
                                <MenuItem
                                    title={selectAccount.title}
                                    description={selectAccount.description}
                                    shouldShowRightIcon
                                    iconWidth={variables.iconSizeXLarge}
                                    iconHeight={variables.iconSizeXLarge}
                                    icon={Expensicons.Bolt}
                                    wrapperStyle={{
                                        ...styles.mrn5,
                                        ...styles.ph0,
                                    }}
                                    onPress={() => {
                                        PaymentMethods.updateWalletTransferData({filterPaymentMethodType: selectAccount.type});
                                        Navigation.navigate(ROUTES.SETTINGS_PAYMENTS_CHOOSE_TRANSFER_ACCOUNT);
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
                                Fee,
                                {style: 'currency', currency: 'USD'},
                            )}
                        </ExpensifyText>
                    </ScrollView>
                    <FixedFooter style={[styles.flexGrow0]}>
                        <ExpensifyButton
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
    }),
)(TransferBalancePage);
