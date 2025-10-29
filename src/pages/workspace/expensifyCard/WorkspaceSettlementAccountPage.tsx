import React, {useCallback, useEffect, useMemo} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import getBankIcon from '@components/Icon/BankIcons';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionListWithSections';
import RadioListItem from '@components/SelectionListWithSections/RadioListItem';
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

function WorkspaceSettlementAccountPage({route}: WorkspaceSettlementAccountPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();
    const policyID = route.params?.policyID;
    const defaultFundID = useDefaultFundID(policyID);

    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: true});
    const [bankAccountsList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: true});
    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${defaultFundID}`, {canBeMissing: true});
    const [isUsingContinuousReconciliation] = useOnyx(`${ONYXKEYS.COLLECTION.EXPENSIFY_CARD_USE_CONTINUOUS_RECONCILIATION}${defaultFundID}`, {canBeMissing: true});
    const [reconciliationConnection] = useOnyx(`${ONYXKEYS.COLLECTION.EXPENSIFY_CARD_CONTINUOUS_RECONCILIATION_CONNECTION}${defaultFundID}`, {canBeMissing: true});
    const isUkEuCurrencySupported = useExpensifyCardUkEuSupported(policyID);
    const connectionName = reconciliationConnection ?? '';
    const connectionParam = getRouteParamForConnection(connectionName as ConnectionName);

    const paymentBankAccountID = cardSettings?.paymentBankAccountID;
    const paymentBankAccountNumberFromCardSettings = cardSettings?.paymentBankAccountNumber;
    const paymentBankAccountAddressName = cardSettings?.paymentBankAccountAddressName;
    const paymentBankAccountNumber = bankAccountsList?.[paymentBankAccountID?.toString() ?? '']?.accountData?.accountNumber ?? paymentBankAccountNumberFromCardSettings ?? '';

    const eligibleBankAccounts = isUkEuCurrencySupported ? getEligibleBankAccountsForUkEuCard(bankAccountsList, policy?.outputCurrency) : getEligibleBankAccountsForCard(bankAccountsList);

    const domainName = cardSettings?.domainName ?? getDomainNameForPolicy(policyID);

    const hasActiveAccountingConnection = !!(policy?.connections && Object.keys(policy.connections).length > 0);

    const fetchPolicyAccountingData = useCallback(() => {
        if (!policyID) {
            return;
        }
        openPolicyAccountingPage(policyID);
    }, [policyID]);

    useEffect(() => {
        if (!cardSettings || !hasActiveAccountingConnection || isUsingContinuousReconciliation !== undefined || reconciliationConnection !== undefined) {
            return;
        }
        fetchPolicyAccountingData();
    }, [cardSettings, hasActiveAccountingConnection, isUsingContinuousReconciliation, reconciliationConnection, fetchPolicyAccountingData]);

    const data = useMemo(() => {
        const options = eligibleBankAccounts.map((bankAccount) => {
            const bankName = (bankAccount.accountData?.addressName ?? '') as BankName;
            const bankAccountNumber = bankAccount.accountData?.accountNumber ?? '';
            const bankAccountID = bankAccount.accountData?.bankAccountID ?? bankAccount.methodID;

            const {icon, iconSize, iconStyles} = getBankIcon({bankName, styles});

            return {
                value: bankAccountID,
                text: bankAccount.title,
                leftElement: !!icon && (
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.mr3]}>
                        <Icon
                            src={icon}
                            width={iconSize}
                            height={iconSize}
                            additionalStyles={iconStyles}
                        />
                    </View>
                ),
                alternateText: `${translate('workspace.expensifyCard.accountEndingIn')} ${getLastFourDigits(bankAccountNumber)}`,
                keyForList: bankAccountID?.toString(),
                isSelected: bankAccountID === paymentBankAccountID,
            };
        });
        if (options.length === 0) {
            const bankName = (paymentBankAccountAddressName ?? '') as BankName;
            const bankAccountNumber = paymentBankAccountNumberFromCardSettings ?? '';
            const {icon, iconSize, iconStyles} = getBankIcon({bankName, styles});
            options.push({
                value: paymentBankAccountID,
                text: paymentBankAccountAddressName,
                leftElement: (
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.mr3]}>
                        <Icon
                            src={icon}
                            width={iconSize}
                            height={iconSize}
                            additionalStyles={iconStyles}
                        />
                    </View>
                ),
                alternateText: `${translate('workspace.expensifyCard.accountEndingIn')} ${getLastFourDigits(bankAccountNumber)}`,
                keyForList: paymentBankAccountID?.toString(),
                isSelected: true,
            });
        }
        return options;
    }, [eligibleBankAccounts, paymentBankAccountAddressName, paymentBankAccountID, paymentBankAccountNumberFromCardSettings, styles, translate]);

    const updateSettlementAccount = (value: number) => {
        updateSettlementAccountCard(domainName, defaultFundID, policyID, value, paymentBankAccountID);
        Navigation.goBack();
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}
        >
            <ScreenWrapper
                testID={WorkspaceSettlementAccountPage.displayName}
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.expensifyCard.settlementAccount')}
                    onBackButtonPress={() => {
                        if (route.params?.backTo) {
                            Navigation.goBack(route.params.backTo);
                            return;
                        }
                        Navigation.goBack(ROUTES.WORKSPACE_EXPENSIFY_CARD_SETTINGS.getRoute(policyID));
                    }}
                />
                <SelectionList
                    addBottomSafeAreaPadding
                    sections={[{data}]}
                    ListItem={RadioListItem}
                    onSelectRow={({value}) => updateSettlementAccount(value ?? 0)}
                    shouldSingleExecuteRowSelect
                    initiallyFocusedOptionKey={paymentBankAccountID?.toString()}
                    listHeaderContent={
                        <>
                            <Text style={[styles.mh5, styles.mv4]}>{translate('workspace.expensifyCard.settlementAccountDescription')}</Text>
                            {!!isUsingContinuousReconciliation && !!connectionParam && hasActiveAccountingConnection && (
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
                    }
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceSettlementAccountPage.displayName = 'WorkspaceSettlementAccountPage';

export default WorkspaceSettlementAccountPage;
