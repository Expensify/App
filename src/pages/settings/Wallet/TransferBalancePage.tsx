import React, {useEffect} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ConfirmationPage from '@components/ConfirmationPage';
import CurrentWalletBalance from '@components/CurrentWalletBalance';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useStyledSafeAreaInsets from '@hooks/useStyledSafeAreaInsets';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as PaymentUtils from '@libs/PaymentUtils';
import variables from '@styles/variables';
import * as PaymentMethods from '@userActions/PaymentMethods';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {BankAccountList, FundList, UserWallet, WalletTransfer} from '@src/types/onyx';
import type PaymentMethod from '@src/types/onyx/PaymentMethod';
import type {FilterMethodPaymentType} from '@src/types/onyx/WalletTransfer';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type TransferBalancePageOnyxProps = {
    /** User's wallet information */
    userWallet: OnyxEntry<UserWallet>;

    /** List of bank accounts */
    bankAccountList: OnyxEntry<BankAccountList>;

    /** List of user's card objects */
    fundList: OnyxEntry<FundList>;

    /** Wallet balance transfer props */
    walletTransfer: OnyxEntry<WalletTransfer>;
};

type TransferBalancePageProps = TransferBalancePageOnyxProps;

const TRANSFER_TIER_NAMES: string[] = [CONST.WALLET.TIER_NAME.GOLD, CONST.WALLET.TIER_NAME.PLATINUM];

function TransferBalancePage({bankAccountList, fundList, userWallet, walletTransfer}: TransferBalancePageProps) {
    const styles = useThemeStyles();
    const {numberFormat, translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {paddingBottom} = useStyledSafeAreaInsets();
    const paymentCardList = fundList ?? {};

    const paymentTypes = [
        {
            key: CONST.WALLET.TRANSFER_METHOD_TYPE.INSTANT,
            title: translate('transferAmountPage.instant'),
            description: translate('transferAmountPage.instantSummary', {
                rate: numberFormat(CONST.WALLET.TRANSFER_METHOD_TYPE_FEE.INSTANT.RATE),
                minAmount: CurrencyUtils.convertToDisplayString(CONST.WALLET.TRANSFER_METHOD_TYPE_FEE.INSTANT.MINIMUM_FEE),
            }),
            icon: Expensicons.Bolt,
            type: CONST.PAYMENT_METHODS.DEBIT_CARD,
        },
        {
            key: CONST.WALLET.TRANSFER_METHOD_TYPE.ACH,
            title: translate('transferAmountPage.ach'),
            description: translate('transferAmountPage.achSummary'),
            icon: Expensicons.Bank,
            type: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
        },
    ];

    /**
     * Get the selected/default payment method account for wallet transfer
     */
    function getSelectedPaymentMethodAccount(): PaymentMethod | undefined {
        const paymentMethods = PaymentUtils.formatPaymentMethods(bankAccountList ?? {}, paymentCardList, styles);

        const defaultAccount = paymentMethods.find((method) => method.isDefault);
        const selectedAccount = paymentMethods.find(
            (method) => method.accountType === walletTransfer?.selectedAccountType && method.methodID?.toString() === walletTransfer?.selectedAccountID?.toString(),
        );
        return selectedAccount ?? defaultAccount;
    }

    function navigateToChooseTransferAccount(filterPaymentMethodType: FilterMethodPaymentType) {
        PaymentMethods.saveWalletTransferMethodType(filterPaymentMethodType);

        // If we only have a single option for the given paymentMethodType do not force the user to make a selection
        const combinedPaymentMethods = PaymentUtils.formatPaymentMethods(bankAccountList ?? {}, paymentCardList, styles);

        const filteredMethods = combinedPaymentMethods.filter((paymentMethod) => paymentMethod.accountType === filterPaymentMethodType);
        if (filteredMethods.length === 1) {
            const account = filteredMethods.at(0);
            PaymentMethods.saveWalletTransferAccountTypeAndID(filterPaymentMethodType ?? '', account?.methodID?.toString());
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

        PaymentMethods.saveWalletTransferAccountTypeAndID(selectedAccount?.accountType ?? '', selectedAccount?.methodID?.toString());
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- we only want this effect to run on initial render
    }, []);

    if (walletTransfer?.shouldShowSuccess && !walletTransfer?.loading) {
        return (
            <ScreenWrapper testID={TransferBalancePage.displayName}>
                <HeaderWithBackButton
                    title={translate('common.transferBalance')}
                    onBackButtonPress={PaymentMethods.dismissSuccessfulTransferBalancePage}
                />
                <ConfirmationPage
                    heading={translate('transferAmountPage.transferSuccess')}
                    description={
                        walletTransfer.paymentMethodType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT
                            ? translate('transferAmountPage.transferDetailBankAccount')
                            : translate('transferAmountPage.transferDetailDebitCard')
                    }
                    shouldShowButton
                    buttonText={translate('common.done')}
                    onButtonPress={PaymentMethods.dismissSuccessfulTransferBalancePage}
                />
            </ScreenWrapper>
        );
    }

    const selectedAccount = getSelectedPaymentMethodAccount();
    const selectedPaymentType =
        selectedAccount && selectedAccount.accountType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT ? CONST.WALLET.TRANSFER_METHOD_TYPE.ACH : CONST.WALLET.TRANSFER_METHOD_TYPE.INSTANT;

    const calculatedFee = PaymentUtils.calculateWalletTransferBalanceFee(userWallet?.currentBalance ?? 0, selectedPaymentType);
    const transferAmount = userWallet?.currentBalance ?? 0 - calculatedFee;
    const isTransferable = transferAmount > 0;
    const isButtonDisabled = !isTransferable || !selectedAccount;
    const errorMessage = ErrorUtils.getLatestErrorMessage(walletTransfer);

    const shouldShowTransferView = PaymentUtils.hasExpensifyPaymentMethod(paymentCardList, bankAccountList ?? {}) && TRANSFER_TIER_NAMES.includes(userWallet?.tierName ?? '');

    return (
        <ScreenWrapper testID={TransferBalancePage.displayName}>
            <FullPageNotFoundView
                shouldShow={!shouldShowTransferView}
                titleKey="notFound.pageNotFound"
                subtitleKey="transferAmountPage.notHereSubTitle"
                linkKey="transferAmountPage.goToWallet"
            >
                <HeaderWithBackButton
                    title={translate('common.transferBalance')}
                    shouldShowBackButton
                />
                <View style={[styles.flexGrow1, styles.flexShrink1, styles.flexBasisAuto, styles.justifyContentCenter]}>
                    <CurrentWalletBalance balanceStyles={[styles.transferBalanceBalance]} />
                </View>
                <ScrollView
                    style={styles.flexGrow0}
                    contentContainerStyle={styles.pv5}
                >
                    <View style={styles.ph5}>
                        {paymentTypes.map((paymentType) => (
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
                    <Text style={[styles.pt8, styles.ph5, styles.pb1, styles.textLabelSupporting, styles.justifyContentStart]}>{translate('transferAmountPage.whichAccount')}</Text>
                    {!!selectedAccount && (
                        <MenuItem
                            title={selectedAccount?.title}
                            description={selectedAccount?.description}
                            shouldShowRightIcon
                            iconStyles={selectedAccount?.iconStyles}
                            iconWidth={selectedAccount?.iconSize}
                            iconHeight={selectedAccount?.iconSize}
                            icon={selectedAccount?.icon}
                            onPress={() => navigateToChooseTransferAccount(selectedAccount?.accountType ?? CONST.PAYMENT_METHODS.DEBIT_CARD)}
                            displayInDefaultIconColor
                        />
                    )}
                    <View style={styles.ph5}>
                        <Text style={[styles.mt5, styles.mb3, styles.textLabelSupporting, styles.justifyContentStart]}>{translate('transferAmountPage.fee')}</Text>
                        <Text style={[styles.justifyContentStart]}>{CurrencyUtils.convertToDisplayString(calculatedFee)}</Text>
                    </View>
                </ScrollView>
                <View>
                    <FormAlertWithSubmitButton
                        buttonText={translate('transferAmountPage.transfer', {
                            amount: isTransferable ? CurrencyUtils.convertToDisplayString(transferAmount) : '',
                        })}
                        isLoading={walletTransfer?.loading}
                        onSubmit={() => selectedAccount && PaymentMethods.transferWalletBalance(selectedAccount)}
                        isDisabled={isButtonDisabled || isOffline}
                        message={errorMessage}
                        isAlertVisible={!isEmptyObject(errorMessage)}
                        containerStyles={[styles.ph5, !paddingBottom ? styles.pb5 : null]}
                    />
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

TransferBalancePage.displayName = 'TransferBalancePage';

export default withOnyx<TransferBalancePageProps, TransferBalancePageOnyxProps>({
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
})(TransferBalancePage);
