import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ConfirmationPageDefault from '@components/ConfirmationPage/composed/ConfirmationPageDefault';
import CurrentWalletBalance from '@components/CurrentWalletBalance';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useThemeStyles from '@hooks/useThemeStyles';

import {
    dismissSuccessfulTransferBalancePage,
    resetWalletTransferData,
    saveWalletTransferAccountTypeAndID,
    saveWalletTransferMethodType,
    transferWalletBalance,
} from '@libs/actions/PaymentMethods';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {calculateWalletTransferBalanceFee, formatPaymentMethods, getWalletTransferBankAccounts, hasExpensifyPaymentMethod} from '@libs/PaymentUtils';

import variables from '@styles/variables';

import {callIfAuthenticated} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type PaymentMethod from '@src/types/onyx/PaymentMethod';
import type {FilterMethodPaymentType} from '@src/types/onyx/WalletTransfer';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import {authTokenTypeSelector} from '@selectors/Session';
import React, {useEffect} from 'react';
import {View} from 'react-native';

const TRANSFER_TIER_NAMES = new Set<string>([CONST.WALLET.TIER_NAME.GOLD, CONST.WALLET.TIER_NAME.PLATINUM]);

function TransferBalancePage() {
    const {convertToDisplayString} = useCurrencyListActions();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {paddingBottom} = useSafeAreaPaddings();
    const icons = useMemoizedLazyExpensifyIcons(['Bank']);

    const [userWallet] = useOnyx(ONYXKEYS.USER_WALLET);
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
    const [walletTransfer] = useOnyx(ONYXKEYS.WALLET_TRANSFER);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST);
    const paymentCardList = fundList ?? {};

    const paymentTypes = [
        // Temporarily disable P2P debit card, see https://github.com/Expensify/App/pull/46323
        // {
        //     key: CONST.WALLET.TRANSFER_METHOD_TYPE.INSTANT,
        //     title: translate('transferAmountPage.instant'),
        //     description: translate('transferAmountPage.instantSummary',
        //         numberFormat(CONST.WALLET.TRANSFER_METHOD_TYPE_FEE.INSTANT.RATE),
        //         convertToDisplayString(CONST.WALLET.TRANSFER_METHOD_TYPE_FEE.INSTANT.MINIMUM_FEE, CONST.CURRENCY.USD)
        //     ),
        //     icon: Expensicons.Bolt,
        //     type: CONST.PAYMENT_METHODS.DEBIT_CARD,
        // },
        {
            key: CONST.WALLET.TRANSFER_METHOD_TYPE.ACH,
            title: translate('transferAmountPage.ach'),
            description: translate('transferAmountPage.achSummary'),
            icon: icons.Bank,
            type: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
        },
    ];

    /**
     * Get the selected/default payment method account for wallet transfer
     */
    function getSelectedPaymentMethodAccount(): PaymentMethod | undefined {
        const paymentMethods = formatPaymentMethods(getWalletTransferBankAccounts(bankAccountList ?? {}), paymentCardList, styles, translate);

        const defaultAccount = paymentMethods.find((method) => method.isDefault);
        const selectedAccount = paymentMethods.find(
            (method) => method.accountType === walletTransfer?.selectedAccountType && method.methodID?.toString() === walletTransfer?.selectedAccountID?.toString(),
        );
        return selectedAccount ?? defaultAccount;
    }

    function navigateToChooseTransferAccount(filterPaymentMethodType: FilterMethodPaymentType) {
        saveWalletTransferMethodType(filterPaymentMethodType);

        // If we only have a single option for the given paymentMethodType do not force the user to make a selection
        const combinedPaymentMethods = formatPaymentMethods(getWalletTransferBankAccounts(bankAccountList ?? {}), paymentCardList, styles, translate);

        const filteredMethods = combinedPaymentMethods.filter((paymentMethod) => paymentMethod.accountType === filterPaymentMethodType);
        if (filteredMethods.length === 1) {
            const account = filteredMethods.at(0);
            saveWalletTransferAccountTypeAndID(filterPaymentMethodType, account?.methodID?.toString());
            return;
        }

        Navigation.navigate(ROUTES.SETTINGS_WALLET_CHOOSE_TRANSFER_ACCOUNT);
    }

    useEffect(() => {
        // Reset to the default account when the page is opened
        resetWalletTransferData();

        const selectedAccount = getSelectedPaymentMethodAccount();
        if (!selectedAccount) {
            return;
        }

        saveWalletTransferAccountTypeAndID(selectedAccount?.accountType, selectedAccount?.methodID?.toString());
        // eslint-disable-next-line react-hooks/exhaustive-deps -- we only want this effect to run on initial render
    }, []);

    if (walletTransfer?.shouldShowSuccess && !walletTransfer?.loading) {
        return (
            <ScreenWrapper testID="TransferBalancePage">
                <HeaderWithBackButton
                    title={translate('common.transferBalance')}
                    onBackButtonPress={dismissSuccessfulTransferBalancePage}
                />
                <ConfirmationPageDefault
                    heading={translate('transferAmountPage.transferSuccess')}
                    description={
                        walletTransfer.paymentMethodType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT
                            ? translate('transferAmountPage.transferDetailBankAccount')
                            : translate('transferAmountPage.transferDetailDebitCard')
                    }
                    buttonText={translate('common.done')}
                    buttonSentryLabel={CONST.SENTRY_LABEL.SETTINGS_WALLET.TRANSFER_SUCCESS_DONE}
                    onButtonPress={dismissSuccessfulTransferBalancePage}
                    containerStyle={styles.flex1}
                />
            </ScreenWrapper>
        );
    }

    const selectedAccount = getSelectedPaymentMethodAccount();
    const selectedPaymentType =
        selectedAccount?.accountType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT ? CONST.WALLET.TRANSFER_METHOD_TYPE.ACH : CONST.WALLET.TRANSFER_METHOD_TYPE.INSTANT;

    const calculatedFee = calculateWalletTransferBalanceFee(userWallet?.currentBalance ?? 0, selectedPaymentType);
    const transferAmount = userWallet?.currentBalance ?? 0 - calculatedFee;
    const isTransferable = transferAmount > 0;
    const isButtonDisabled = !isTransferable || !selectedAccount;
    const errorMessage = getLatestErrorMessage(walletTransfer);

    const shouldShowTransferView = hasExpensifyPaymentMethod(paymentCardList, bankAccountList ?? {}) && TRANSFER_TIER_NAMES.has(userWallet?.tierName ?? '');

    return (
        <ScreenWrapper
            testID="TransferBalancePage"
            shouldShowOfflineIndicatorInWideScreen
        >
            <FullPageNotFoundView
                shouldShow={!shouldShowTransferView}
                titleKey="notFound.pageNotFound"
                subtitleKey="transferAmountPage.notHereSubTitle"
                linkTranslationKey="transferAmountPage.goToWallet"
                onLinkPress={() => Navigation.goBack(ROUTES.SETTINGS_WALLET)}
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
                                sentryLabel={CONST.SENTRY_LABEL.SETTINGS_WALLET.TRANSFER_PAYMENT_TYPE}
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
                        <MenuItem.Root
                            sentryLabel={CONST.SENTRY_LABEL.SETTINGS_WALLET.TRANSFER_ACCOUNT}
                            onPress={callIfAuthenticated(() => navigateToChooseTransferAccount(selectedAccount.accountType ?? CONST.PAYMENT_METHODS.DEBIT_CARD), session)}
                        >
                            <MenuItem.Row>
                                {!!selectedAccount.icon && (
                                    <MenuItem.Leading>
                                        <View style={[styles.popoverMenuIcon, selectedAccount.iconStyles]}>
                                            <Icon
                                                src={selectedAccount.icon}
                                                width={selectedAccount.iconSize}
                                                height={selectedAccount.iconSize}
                                            />
                                        </View>
                                    </MenuItem.Leading>
                                )}
                                <MenuItem.Content>
                                    {!!selectedAccount.title && <MenuItem.Title>{selectedAccount.title}</MenuItem.Title>}
                                    {!!selectedAccount.description && <MenuItem.Description>{selectedAccount.description}</MenuItem.Description>}
                                </MenuItem.Content>
                                <MenuItem.Trailing>
                                    <MenuItem.Chevron />
                                </MenuItem.Trailing>
                            </MenuItem.Row>
                        </MenuItem.Root>
                    )}
                    <View style={styles.ph5}>
                        <Text style={[styles.mt5, styles.mb3, styles.textLabelSupporting, styles.justifyContentStart]}>{translate('transferAmountPage.fee')}</Text>
                        <Text style={[styles.justifyContentStart]}>{convertToDisplayString(calculatedFee, CONST.CURRENCY.USD)}</Text>
                    </View>
                </ScrollView>
                <View>
                    <FormAlertWithSubmitButton
                        sentryLabel={CONST.SENTRY_LABEL.SETTINGS_WALLET.TRANSFER_SUBMIT}
                        buttonText={translate('transferAmountPage.transfer', isTransferable ? convertToDisplayString(transferAmount, CONST.CURRENCY.USD) : '')}
                        isLoading={walletTransfer?.loading}
                        onSubmit={() => selectedAccount && transferWalletBalance(selectedAccount)}
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

export default TransferBalancePage;
