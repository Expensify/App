import _ from 'underscore';
import React from 'react';
import {View, ScrollView} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../../../ONYXKEYS';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Navigation from '../../../libs/Navigation/Navigation';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import compose from '../../../libs/compose';
import * as Expensicons from '../../../components/Icon/Expensicons';
import * as Illustrations from '../../../components/Icon/Illustrations';
import Icon from '../../../components/Icon';
import defaultTheme from '../../../styles/themes/default';
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
import cardPropTypes from '../../../components/cardPropTypes';
import userWalletPropTypes from '../../EnablePayments/userWalletPropTypes';
import ROUTES from '../../../ROUTES';
import FormAlertWithSubmitButton from '../../../components/FormAlertWithSubmitButton';
import {withNetwork} from '../../../components/OnyxProvider';

const propTypes = {
    /** User's wallet information */
    userWallet: userWalletPropTypes,

    /** List of bank accounts */
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

    /** List of card objects */
    cardList: PropTypes.objectOf(cardPropTypes),

    /** Wallet balance transfer props */
    walletTransfer: walletTransferPropTypes,

    ...withLocalizePropTypes,
};

const defaultProps = {
    bankAccountList: {},
    cardList: {},
    userWallet: {},
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

        PaymentMethods.resetWalletTransferData();
        const selectedAccount = this.getSelectedPaymentMethodAccount();

        // Select the default payment account when page is opened,
        // so that user can see that preselected on choose transfer account page
        if (!selectedAccount || !selectedAccount.isDefault) {
            return;
        }

        PaymentMethods.saveWalletTransferAccountTypeAndID(
            selectedAccount.accountType,
            selectedAccount.methodID,
        );
    }

    /**
     * Get the selected/default payment method account for wallet transfer
     * @returns {Object|undefined}
     */
    getSelectedPaymentMethodAccount() {
        const paymentMethods = PaymentUtils.formatPaymentMethods(
            this.props.bankAccountList,
            this.props.cardList,
        );

        const defaultAccount = _.find(paymentMethods, method => method.isDefault);
        const selectedAccount = _.find(
            paymentMethods,
            method => method.accountType === this.props.walletTransfer.selectedAccountType
                && method.methodID === this.props.walletTransfer.selectedAccountID,
        );
        return selectedAccount || defaultAccount;
    }

    /**
     * @param {String} filterPaymentMethodType
     */
    navigateToChooseTransferAccount(filterPaymentMethodType) {
        PaymentMethods.saveWalletTransferMethodType(filterPaymentMethodType);

        // If we only have a single option for the given paymentMethodType do not force the user to make a selection
        const combinedPaymentMethods = PaymentUtils.formatPaymentMethods(
            this.props.bankAccountList,
            this.props.cardList,
        );

        const filteredMethods = _.filter(combinedPaymentMethods, paymentMethod => paymentMethod.accountType === filterPaymentMethodType);
        if (filteredMethods.length === 1) {
            const account = _.first(filteredMethods);
            PaymentMethods.saveWalletTransferAccountTypeAndID(
                filterPaymentMethodType,
                account.methodID,
            );
            return;
        }

        Navigation.navigate(ROUTES.SETTINGS_PAYMENTS_CHOOSE_TRANSFER_ACCOUNT);
    }

    render() {
        if (this.props.walletTransfer.shouldShowSuccess && !this.props.walletTransfer.loading) {
            return (
                <ScreenWrapper>
                    <HeaderWithCloseButton
                        title={this.props.translate('common.transferBalance')}
                        onCloseButtonPress={PaymentMethods.dismissSuccessfulTransferBalancePage}
                    />
                    <View style={[styles.pageWrapper, styles.flex1, styles.flexColumn, styles.alignItemsCenter, styles.justifyContentCenter]}>
                        <Icon
                            src={Illustrations.TadaBlue}
                            height={100}
                            width={100}
                            fill={defaultTheme.iconSuccessFill}
                        />
                        <View style={[styles.ph5]}>
                            <Text style={[styles.mt5, styles.h1, styles.textAlignCenter]}>
                                {this.props.translate('transferAmountPage.transferSuccess')}
                            </Text>
                            <Text style={[styles.mt3, styles.textAlignCenter]}>
                                {this.props.walletTransfer.paymentMethodType === CONST.PAYMENT_METHODS.BANK_ACCOUNT
                                    ? this.props.translate('transferAmountPage.transferDetailBankAccount')
                                    : this.props.translate('transferAmountPage.transferDetailDebitCard')}
                            </Text>
                        </View>
                    </View>
                    <FixedFooter>
                        <Button
                            text={this.props.translate('common.done')}
                            onPress={() => PaymentMethods.dismissSuccessfulTransferBalancePage()}
                            style={[styles.mt4]}
                            iconStyles={[styles.mr5]}
                            success
                        />
                    </FixedFooter>
                </ScreenWrapper>
            );
        }
        const selectedAccount = this.getSelectedPaymentMethodAccount();
        const selectedPaymentType = selectedAccount && selectedAccount.accountType === CONST.PAYMENT_METHODS.BANK_ACCOUNT
            ? CONST.WALLET.TRANSFER_METHOD_TYPE.ACH
            : CONST.WALLET.TRANSFER_METHOD_TYPE.INSTANT;

        const calculatedFee = PaymentUtils.calculateWalletTransferBalanceFee(this.props.userWallet.currentBalance, selectedPaymentType);
        const transferAmount = this.props.userWallet.currentBalance - calculatedFee;
        const isTransferable = transferAmount > 0;
        const isButtonDisabled = !isTransferable || !selectedAccount;
        const error = this.props.walletTransfer.error;

        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={this.props.translate('common.transferBalance')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.goBack()}
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                />
                <View style={[styles.flex1, styles.flexBasisAuto, styles.justifyContentCenter]}>
                    <CurrentWalletBalance balanceStyles={[styles.transferBalanceBalance]} />
                </View>
                <ScrollView style={styles.flexGrow0} contentContainerStyle={styles.pv5}>
                    <View style={styles.ph5}>
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
                                onPress={() => this.navigateToChooseTransferAccount(paymentType.type)}
                            />
                        ))}
                    </View>
                    <Text
                        style={[styles.p5, styles.textStrong, styles.textLabel, styles.justifyContentStart]}
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
                                onPress={() => this.navigateToChooseTransferAccount(selectedAccount.accountType)}
                            />
                        )}
                    <View style={styles.ph5}>
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
                            style={[styles.justifyContentStart]}
                        >
                            {this.props.numberFormat(
                                calculatedFee / 100,
                                {style: 'currency', currency: 'USD'},
                            )}
                        </Text>
                    </View>
                </ScrollView>
                <View>
                    <FormAlertWithSubmitButton
                        buttonText={this.props.translate(
                            'transferAmountPage.transfer',
                            {
                                amount: isTransferable
                                    ? this.props.numberFormat(
                                        transferAmount / 100,
                                        {style: 'currency', currency: 'USD'},
                                    ) : '',
                            },
                        )}
                        isLoading={this.props.walletTransfer.loading}
                        onSubmit={() => PaymentMethods.transferWalletBalance(selectedAccount)}
                        isDisabled={isButtonDisabled || this.props.network.isOffline}
                        message={error}
                        isAlertVisible={!_.isEmpty(error)}
                    />
                </View>
            </ScreenWrapper>
        );
    }
}

TransferBalancePage.propTypes = propTypes;
TransferBalancePage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withNetwork(),
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
