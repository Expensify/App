import _ from 'underscore';
import React, {useEffect} from 'react';
import {View, ScrollView} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../../../ONYXKEYS';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Navigation from '../../../libs/Navigation/Navigation';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import compose from '../../../libs/compose';
import * as Expensicons from '../../../components/Icon/Expensicons';
import MenuItem from '../../../components/MenuItem';
import CONST from '../../../CONST';
import variables from '../../../styles/variables';
import Text from '../../../components/Text';
import CurrentWalletBalance from '../../../components/CurrentWalletBalance';
import walletTransferPropTypes from './walletTransferPropTypes';
import * as PaymentMethods from '../../../libs/actions/PaymentMethods';
import * as PaymentUtils from '../../../libs/PaymentUtils';
import cardPropTypes from '../../../components/cardPropTypes';
import userWalletPropTypes from '../../EnablePayments/userWalletPropTypes';
import ROUTES from '../../../ROUTES';
import FormAlertWithSubmitButton from '../../../components/FormAlertWithSubmitButton';
import {withNetwork} from '../../../components/OnyxProvider';
import ConfirmationPage from '../../../components/ConfirmationPage';
import * as CurrencyUtils from '../../../libs/CurrencyUtils';
import FullPageNotFoundView from '../../../components/BlockingViews/FullPageNotFoundView';

const propTypes = {
    /** User's wallet information */
    userWallet: userWalletPropTypes,

    /** List of bank accounts */
    bankAccountList: PropTypes.objectOf(
        PropTypes.shape({
            /** The name of the institution (bank of america, etc) */
            addressName: PropTypes.string,

            /** The masked bank account number */
            accountNumber: PropTypes.string,

            /** The bankAccountID in the bankAccounts db */
            bankAccountID: PropTypes.number,

            /** The bank account type */
            type: PropTypes.string,
        }),
    ),

    /** List of user's card objects */
    fundList: PropTypes.objectOf(cardPropTypes),

    /** Wallet balance transfer props */
    walletTransfer: walletTransferPropTypes,

    ...withLocalizePropTypes,
};

const defaultProps = {
    bankAccountList: {},
    fundList: null,
    userWallet: {},
    walletTransfer: {},
};

function TransferBalancePage(props) {
    const paymentCardList = props.fundList || {};

    const paymentTypes = [
        {
            key: CONST.WALLET.TRANSFER_METHOD_TYPE.INSTANT,
            title: props.translate('transferAmountPage.instant'),
            description: props.translate('transferAmountPage.instantSummary', {
                rate: props.numberFormat(CONST.WALLET.TRANSFER_METHOD_TYPE_FEE.INSTANT.RATE),
                minAmount: CurrencyUtils.convertToDisplayString(CONST.WALLET.TRANSFER_METHOD_TYPE_FEE.INSTANT.MINIMUM_FEE),
            }),
            icon: Expensicons.Bolt,
            type: CONST.PAYMENT_METHODS.DEBIT_CARD,
        },
        {
            key: CONST.WALLET.TRANSFER_METHOD_TYPE.ACH,
            title: props.translate('transferAmountPage.ach'),
            description: props.translate('transferAmountPage.achSummary'),
            icon: Expensicons.Bank,
            type: CONST.PAYMENT_METHODS.BANK_ACCOUNT,
        },
    ];

    /**
     * Get the selected/default payment method account for wallet transfer
     * @returns {Object|undefined}
     */
    function getSelectedPaymentMethodAccount() {
        const paymentMethods = PaymentUtils.formatPaymentMethods(props.bankAccountList, paymentCardList);

        const defaultAccount = _.find(paymentMethods, (method) => method.isDefault);
        const selectedAccount = _.find(
            paymentMethods,
            (method) => method.accountType === props.walletTransfer.selectedAccountType && method.methodID === props.walletTransfer.selectedAccountID,
        );
        return selectedAccount || defaultAccount;
    }

    /**
     * @param {String} filterPaymentMethodType
     */
    function navigateToChooseTransferAccount(filterPaymentMethodType) {
        PaymentMethods.saveWalletTransferMethodType(filterPaymentMethodType);

        // If we only have a single option for the given paymentMethodType do not force the user to make a selection
        const combinedPaymentMethods = PaymentUtils.formatPaymentMethods(props.bankAccountList, paymentCardList);

        const filteredMethods = _.filter(combinedPaymentMethods, (paymentMethod) => paymentMethod.accountType === filterPaymentMethodType);
        if (filteredMethods.length === 1) {
            const account = _.first(filteredMethods);
            PaymentMethods.saveWalletTransferAccountTypeAndID(filterPaymentMethodType, account.methodID);
            return;
        }

        Navigation.navigate(ROUTES.SETTINGS_WALLET_CHOOSE_TRANSFER_ACCOUNT);
    }

    useEffect(() => {
        // Reset to the default account when the page is opened
        PaymentMethods.resetWalletTransferData();

        const selectedAccount = getSelectedPaymentMethodAccount();
        if (!selectedAccount) {
            return;
        }

        PaymentMethods.saveWalletTransferAccountTypeAndID(selectedAccount.accountType, selectedAccount.methodID);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- we only want this effect to run on initial render
    }, []);

    if (props.walletTransfer.shouldShowSuccess && !props.walletTransfer.loading) {
        return (
            <ScreenWrapper>
                <HeaderWithBackButton
                    title={props.translate('common.transferBalance')}
                    onBackButtonPress={PaymentMethods.dismissSuccessfulTransferBalancePage}
                />
                <ConfirmationPage
                    heading={props.translate('transferAmountPage.transferSuccess')}
                    description={
                        props.walletTransfer.paymentMethodType === CONST.PAYMENT_METHODS.BANK_ACCOUNT
                            ? props.translate('transferAmountPage.transferDetailBankAccount')
                            : props.translate('transferAmountPage.transferDetailDebitCard')
                    }
                    shouldShowButton
                    buttonText={props.translate('common.done')}
                    onButtonPress={PaymentMethods.dismissSuccessfulTransferBalancePage}
                />
            </ScreenWrapper>
        );
    }

    const selectedAccount = getSelectedPaymentMethodAccount();
    const selectedPaymentType =
        selectedAccount && selectedAccount.accountType === CONST.PAYMENT_METHODS.BANK_ACCOUNT ? CONST.WALLET.TRANSFER_METHOD_TYPE.ACH : CONST.WALLET.TRANSFER_METHOD_TYPE.INSTANT;

    const calculatedFee = PaymentUtils.calculateWalletTransferBalanceFee(props.userWallet.currentBalance, selectedPaymentType);
    const transferAmount = props.userWallet.currentBalance - calculatedFee;
    const isTransferable = transferAmount > 0;
    const isButtonDisabled = !isTransferable || !selectedAccount;
    const errorMessage = !_.isEmpty(props.walletTransfer.errors) ? _.chain(props.walletTransfer.errors).values().first().value() : '';

    const shouldShowTransferView = PaymentUtils.hasExpensifyPaymentMethod(paymentCardList, props.bankAccountList) && props.userWallet.tierName === CONST.WALLET.TIER_NAME.GOLD;

    return (
        <ScreenWrapper>
            <FullPageNotFoundView
                shouldShow={!shouldShowTransferView}
                titleKey="notFound.pageNotFound"
                subtitleKey="transferAmountPage.notHereSubTitle"
                linkKey="transferAmountPage.goToWallet"
                onLinkPress={() => Navigation.goBack(ROUTES.SETTINGS_WALLET)}
            >
                <HeaderWithBackButton
                    title={props.translate('common.transferBalance')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WALLET)}
                />
                <View style={[styles.flexGrow1, styles.flexShrink1, styles.flexBasisAuto, styles.justifyContentCenter]}>
                    <CurrentWalletBalance balanceStyles={[styles.transferBalanceBalance]} />
                </View>
                <ScrollView
                    style={styles.flexGrow0}
                    contentContainerStyle={styles.pv5}
                >
                    <View style={styles.ph5}>
                        {_.map(paymentTypes, (paymentType) => (
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
                                    ...(selectedPaymentType === paymentType.key && styles.transferBalanceSelectedPayment),
                                }}
                                onPress={() => navigateToChooseTransferAccount(paymentType.type)}
                            />
                        ))}
                    </View>
                    <Text style={[styles.p5, styles.textLabelSupporting, styles.justifyContentStart]}>{props.translate('transferAmountPage.whichAccount')}</Text>
                    {Boolean(selectedAccount) && (
                        <MenuItem
                            title={selectedAccount.title}
                            description={selectedAccount.description}
                            shouldShowRightIcon
                            iconWidth={selectedAccount.iconSize}
                            iconHeight={selectedAccount.iconSize}
                            icon={selectedAccount.icon}
                            onPress={() => navigateToChooseTransferAccount(selectedAccount.accountType)}
                        />
                    )}
                    <View style={styles.ph5}>
                        <Text style={[styles.mt5, styles.mb3, styles.textLabelSupporting, styles.justifyContentStart]}>{props.translate('transferAmountPage.fee')}</Text>
                        <Text style={[styles.justifyContentStart]}>{CurrencyUtils.convertToDisplayString(calculatedFee)}</Text>
                    </View>
                </ScrollView>
                <View>
                    <FormAlertWithSubmitButton
                        buttonText={props.translate('transferAmountPage.transfer', {
                            amount: isTransferable ? CurrencyUtils.convertToDisplayString(transferAmount) : '',
                        })}
                        isLoading={props.walletTransfer.loading}
                        onSubmit={() => PaymentMethods.transferWalletBalance(selectedAccount)}
                        isDisabled={isButtonDisabled || props.network.isOffline}
                        message={errorMessage}
                        isAlertVisible={!_.isEmpty(errorMessage)}
                    />
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

TransferBalancePage.propTypes = propTypes;
TransferBalancePage.defaultProps = defaultProps;
TransferBalancePage.displayName = 'TransferBalancePage';

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
        fundList: {
            key: ONYXKEYS.FUND_LIST,
        },
    }),
)(TransferBalancePage);
