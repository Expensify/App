import type {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Balance from '@components/Balance';
import ConfirmationPage from '@components/ConfirmationPage';
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
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as PaymentUtils from '@libs/PaymentUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import variables from '@styles/variables';
import * as PaymentMethods from '@userActions/PaymentMethods';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type PaymentMethod from '@src/types/onyx/PaymentMethod';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type WorkspaceTransferInvoiceBalanceProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.INVOICES_TRANSFER_BALANCE>;

function WorkspaceTransferInvoiceBalance({
    route: {
        params: {policyID},
    },
}: WorkspaceTransferInvoiceBalanceProps) {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {paddingBottom} = useStyledSafeAreaInsets();
    const {translate} = useLocalize();
    const [invoiceBalanceTransfer] = useOnyx(ONYXKEYS.INVOICE_BALANCE_TRANSFER);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST);

    useEffect(() => {
        PaymentMethods.resetInvoiceTransferData();
    }, []);

    if (invoiceBalanceTransfer?.shouldShowSuccess && !invoiceBalanceTransfer?.loading) {
        return (
            <ScreenWrapper testID={WorkspaceTransferInvoiceBalance.displayName}>
                <HeaderWithBackButton
                    title={translate('common.transferBalance')}
                    onBackButtonPress={PaymentMethods.dismissSuccessfulInvoiceTransferBalancePage}
                />
                <ConfirmationPage
                    shouldShowButton
                    heading={translate('transferAmountPage.transferSuccess')}
                    description={translate('transferAmountPage.transferDetailBankAccount')}
                    buttonText={translate('common.done')}
                    onButtonPress={PaymentMethods.dismissSuccessfulInvoiceTransferBalancePage}
                />
            </ScreenWrapper>
        );
    }

    const paymentMethods = PaymentUtils.formatPaymentMethods(bankAccountList ?? {}, fundList ?? {}, styles);
    const selectedAccount: PaymentMethod | null = paymentMethods.find((paymentMethod) => paymentMethod.methodID === policy?.invoice?.bankAccount?.transferBankAccountID) ?? null;
    const balance = policy?.invoice?.bankAccount?.stripeConnectAccountBalance ?? 0;
    const calculatedFee = PaymentUtils.calculateWalletTransferBalanceFee(balance, CONST.WALLET.TRANSFER_METHOD_TYPE.ACH);
    const transferAmount = balance - calculatedFee;
    const isTransferable = transferAmount > 0;
    const isButtonDisabled = !isTransferable || !selectedAccount;
    const errorMessage = ErrorUtils.getLatestErrorMessage(invoiceBalanceTransfer);

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            shouldBeBlocked={!selectedAccount}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_INVOICES_ENABLED}
        >
            <ScreenWrapper
                testID={WorkspaceTransferInvoiceBalance.displayName}
                shouldEnablePickerAvoiding={false}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton title={translate('common.transferBalance')} />

                <View style={[styles.flexGrow1, styles.flexShrink1, styles.flexBasisAuto, styles.justifyContentCenter]}>
                    <Balance
                        textStyles={[styles.pv5, styles.alignSelfCenter, styles.transferBalanceBalance]}
                        balance={balance}
                    />
                </View>
                <ScrollView
                    style={styles.flexGrow0}
                    contentContainerStyle={styles.pv5}
                >
                    <View style={styles.ph5}>
                        <MenuItem
                            key={CONST.WALLET.TRANSFER_METHOD_TYPE.ACH}
                            title={translate('transferAmountPage.ach')}
                            description={translate('transferAmountPage.achSummary')}
                            iconWidth={variables.iconSizeXLarge}
                            iconHeight={variables.iconSizeXLarge}
                            icon={Expensicons.Bank}
                            success
                            wrapperStyle={{
                                ...styles.mt3,
                                ...styles.pv4,
                                ...styles.transferBalancePayment,
                                ...styles.transferBalanceSelectedPayment,
                            }}
                            interactive={false}
                        />
                    </View>
                    <Text style={[styles.pt8, styles.ph5, styles.pb1, styles.textLabelSupporting, styles.justifyContentStart]}>{translate('transferAmountPage.whichAccount')}</Text>
                    {!!selectedAccount && (
                        <MenuItem
                            title={selectedAccount?.title}
                            description={selectedAccount?.description}
                            shouldShowRightIcon={false}
                            iconStyles={selectedAccount?.iconStyles}
                            iconWidth={selectedAccount?.iconSize}
                            iconHeight={selectedAccount?.iconSize}
                            icon={selectedAccount?.icon}
                            displayInDefaultIconColor
                            interactive={false}
                        />
                    )}
                    <View style={styles.ph5}>
                        <Text style={[styles.mt5, styles.mb3, styles.textLabelSupporting, styles.justifyContentStart]}>{translate('transferAmountPage.fee')}</Text>
                        <Text style={[styles.justifyContentStart]}>{CurrencyUtils.convertToDisplayString(calculatedFee)}</Text>
                    </View>
                </ScrollView>
                <View>
                    <FormAlertWithSubmitButton
                        buttonText={translate('common.transfer')}
                        isLoading={invoiceBalanceTransfer?.loading}
                        onSubmit={() => PaymentMethods.transferInvoiceBalance(policyID)}
                        isDisabled={isButtonDisabled || isOffline}
                        message={errorMessage}
                        isAlertVisible={!isEmptyObject(errorMessage)}
                        containerStyles={[styles.ph5, !paddingBottom ? styles.pb5 : null]}
                    />
                </View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceTransferInvoiceBalance.displayName = 'WorkspaceTransferInvoiceBalance';

export default WorkspaceTransferInvoiceBalance;
