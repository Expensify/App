import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import SettlementAccountSelector, {BankAccountListItemLeftElement} from '@components/SettlementAccountSelector';
import type {BankAccountListItem} from '@components/SettlementAccountSelector';
import Text from '@components/Text';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useEnvironment from '@hooks/useEnvironment';
import useExpensifyCardUkEuSupported from '@hooks/useExpensifyCardUkEuSupported';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getRouteParamForConnection} from '@libs/AccountingUtils';
import {openPolicyAccountingPage} from '@libs/actions/PolicyConnections';
import {getLastFourDigits} from '@libs/BankAccountUtils';
import {getEligibleBankAccountsForCard, getEligibleBankAccountsForUkEuCard} from '@libs/CardUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getDomainNameForPolicy} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {updateSettlementAccount as updateSettlementAccountCard} from '@userActions/Card';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {BankName} from '@src/types/onyx/Bank';
import type {ConnectionName} from '@src/types/onyx/Policy';

type WorkspaceSettlementAccountPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_SETTINGS_ACCOUNT>;

/**
 * Settlement account selection page for Expensify Card.
 * Uses the SettlementAccountSelector component for the selection UI.
 */
function WorkspaceSettlementAccountPage({route}: WorkspaceSettlementAccountPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();
    const policyID = route.params?.policyID;
    const defaultFundID = useDefaultFundID(policyID);

    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: true});
    const [bankAccountsList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: true});
    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${defaultFundID}`, {canBeMissing: true});
    const [continuousReconciliation] = useOnyx(`${ONYXKEYS.COLLECTION.EXPENSIFY_CARD_USE_CONTINUOUS_RECONCILIATION}${defaultFundID}`, {canBeMissing: true});
    const [reconciliationConnection] = useOnyx(`${ONYXKEYS.COLLECTION.EXPENSIFY_CARD_CONTINUOUS_RECONCILIATION_CONNECTION}${defaultFundID}`, {canBeMissing: true});
    const isUkEuCurrencySupported = useExpensifyCardUkEuSupported(policyID);

    const paymentBankAccountID = cardSettings?.paymentBankAccountID;
    const paymentBankAccountNumberFromCardSettings = cardSettings?.paymentBankAccountNumber;
    const paymentBankAccountAddressName = cardSettings?.paymentBankAccountAddressName;
    const paymentBankAccountNumber = bankAccountsList?.[paymentBankAccountID?.toString() ?? '']?.accountData?.accountNumber ?? paymentBankAccountNumberFromCardSettings ?? '';

    const getEligibleBankAccounts = () => {
        if (isUkEuCurrencySupported) {
            return getEligibleBankAccountsForUkEuCard(bankAccountsList, policy?.outputCurrency);
        }
        return getEligibleBankAccountsForCard(bankAccountsList);
    };
    const eligibleBankAccounts = getEligibleBankAccounts();

    const domainName = cardSettings?.domainName ?? getDomainNameForPolicy(policyID);
    const hasActiveAccountingConnection = !!(policy?.connections && Object.keys(policy.connections).length > 0);

    const fetchPolicyAccountingData = useCallback(() => {
        if (!policyID) {
            return;
        }
        openPolicyAccountingPage(policyID);
    }, [policyID]);

    useEffect(() => {
        if (!cardSettings || !hasActiveAccountingConnection || continuousReconciliation?.value !== undefined || reconciliationConnection !== undefined) {
            return;
        }
        fetchPolicyAccountingData();
    }, [cardSettings, hasActiveAccountingConnection, continuousReconciliation?.value, reconciliationConnection, fetchPolicyAccountingData]);

    const eligibleBankAccountsOptions: BankAccountListItem[] = eligibleBankAccounts.map((bankAccount) => {
        const bankName = (bankAccount.accountData?.addressName ?? '') as BankName;
        const bankAccountNumber = bankAccount.accountData?.accountNumber ?? '';
        const bankAccountID = bankAccount.accountData?.bankAccountID ?? bankAccount.methodID;

        return {
            value: bankAccountID,
            text: bankAccount.title,
            leftElement: <BankAccountListItemLeftElement bankName={bankName} />,
            alternateText: `${translate('workspace.expensifyCard.accountEndingIn')} ${getLastFourDigits(bankAccountNumber)}`,
            keyForList: bankAccountID?.toString() ?? '',
            isSelected: bankAccountID === paymentBankAccountID,
        };
    });

    const fallbackBankAccountOption: BankAccountListItem = {
        value: paymentBankAccountID,
        text: paymentBankAccountAddressName ?? '',
        leftElement: <BankAccountListItemLeftElement bankName={(paymentBankAccountAddressName ?? '') as BankName} />,
        alternateText: `${translate('workspace.expensifyCard.accountEndingIn')} ${getLastFourDigits(paymentBankAccountNumberFromCardSettings ?? '')}`,
        keyForList: paymentBankAccountID?.toString() ?? '',
        isSelected: true,
    };

    const listOptions: BankAccountListItem[] = eligibleBankAccountsOptions.length > 0 ? eligibleBankAccountsOptions : [fallbackBankAccountOption];

    const handleSelectAccount = (value: number) => {
        updateSettlementAccountCard(domainName, defaultFundID, policyID, value, paymentBankAccountID);
        Navigation.goBack();
    };

    const getCustomListHeaderContent = () => {
        const connectionName = reconciliationConnection ?? '';
        const connectionParam = getRouteParamForConnection(connectionName as ConnectionName);

        return (
            <>
                <Text style={[styles.mh5, styles.mv4]}>{translate('workspace.expensifyCard.settlementAccountDescription')}</Text>
                {!!continuousReconciliation?.value && !!connectionParam && hasActiveAccountingConnection && (
                    <View style={[styles.renderHTML, styles.mh5, styles.mb6]}>
                        <RenderHTML
                            html={translate('workspace.expensifyCard.settlementAccountInfo', {
                                reconciliationAccountSettingsLink: `${environmentURL}/${ROUTES.WORKSPACE_ACCOUNTING_RECONCILIATION_ACCOUNT_SETTINGS.getRoute(policyID, connectionParam, Navigation.getActiveRoute())}`,
                                accountNumber: `${CONST.MASKED_PAN_PREFIX}${getLastFourDigits(paymentBankAccountNumber)}`,
                            })}
                        />
                    </View>
                )}
            </>
        );
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}
        >
            <ScreenWrapper
                testID="WorkspaceSettlementAccountPage"
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.expensifyCard.settlementAccount')}
                    onBackButtonPress={() => {
                        if (route.params && 'backTo' in route.params && route.params.backTo) {
                            Navigation.goBack(route.params.backTo);
                            return;
                        }
                        Navigation.goBack(ROUTES.WORKSPACE_EXPENSIFY_CARD_SETTINGS.getRoute(policyID));
                    }}
                />
                <SettlementAccountSelector
                    listOptions={listOptions}
                    onSelectAccount={handleSelectAccount}
                    customHeaderContent={getCustomListHeaderContent()}
                    initiallyFocusedItemKey={paymentBankAccountID?.toString()}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceSettlementAccountPage;
